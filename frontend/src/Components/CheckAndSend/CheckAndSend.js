import React, { useState } from 'react';
import { useSelector, useDispatch} from 'react-redux'
import { Button, Stack, Box, FormControlLabel, Switch, Alert, IconButton, AlertTitle } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ProTip from '../ProTip/ProTip';
import { ACTION_TYPES, SETTINGS_TYPES, MESSAGING_TYPES } from '../../Utils/variables';
import { checkNumbers, chunkArray, processChunksInBatches, sendMessages, findDuplicatePhoneIndices } from '../../Utils/functions';
import { updateActionState } from '../../Redux/slices/actionSlice';
import { updateSettingsState } from '../../Redux/slices/settingsSlice';
import { updateMessagingState } from '../../Redux/slices/messagingSlice';
import { expbackoff } from '../../exponential-backoff';


const CheckAndSend = () => {

  const protipmessage = "It is advisable to check the numbers first to ensure they have a valid structure"

  const dispatch = useDispatch()
  const csvData = useSelector(state => state.csvDataStructure.csvData);
  const phoneNumberColumn = useSelector(state => state.csvDataStructure.csvSelectedColumn)
  const messagingStructure = useSelector(state => state.messagingStructure)
  const broadcastSwitch = useSelector(state => state.settingsStructure.checkBroadcastAPI)
  const lineTypeSwitch = useSelector(state => state.settingsStructure.checkLineType)
  const limits = useSelector(state => state.settingsStructure.limits)
  const checkScheduleMessages = useSelector(state => state.settingsStructure.checkScheduleMessages)
  const scheduledDate = useSelector(state => state.messagingStructure.scheduledDate)
  const sendResultsArray = useSelector(state => state.messagingStructure.sendResultsArray)
  const checkLinkShortening = useSelector(state => state.settingsStructure.checkLinkShortening)

  const [broadcastAlertClicked, setBroadcastAlert] = useState(false);
  const [lineTypeAlertClicked, setLineTypeAlert] = useState(false);
  const [emptyNumbersArray, setEmptyNumbersArray] = useState([]);

  const hasEmptyNumbers = () => {
    let empty = []
    for(let i = 0; i < csvData.length; i++){
      if(csvData[i][phoneNumberColumn].length === 0){
        empty.push(i)
        setEmptyNumbersArray(empty)
      }
    }
    if(empty.length > 0){
      const emptyNumberDataForLogs = {
        emptyNumbersArray: empty,
        source: "emptyNumbersError"
      }
      dispatch(updateActionState({
        type: ACTION_TYPES.EMPTY_NUMBERS_FOR_LOGS,
        value: emptyNumberDataForLogs
      }))
      return true;
    }
    else {
      dispatch(updateActionState({
        type: ACTION_TYPES.EMPTY_NUMBERS_FOR_LOGS,
        value: {}
      }))
      return false;
    }
  }

  const handleBroadcastSwitch = (event) => {
    dispatch(updateSettingsState({
      type: SETTINGS_TYPES.BROADCAST_SWITCH,
      value: event.target.checked
    }))
  }

  const handleLineTypeSwitch = (event) => {
    dispatch(updateSettingsState({
      type: SETTINGS_TYPES.LINE_TYPE_SWITCH,
      value: event.target.checked
    }))
  }

  const hasDuplicates = () => {
    let duplicateNumbers = findDuplicatePhoneIndices(csvData, phoneNumberColumn)
    if (duplicateNumbers.length > 0) {
      const duplicateNumberDataForLogs = {
        duplicateNumbers: duplicateNumbers,
        source: "duplicateNumbersError"
      }
      dispatch(updateActionState({
        type: ACTION_TYPES.DUPLICATE_NUMBERS_FOR_LOGS,
        value: duplicateNumberDataForLogs
      }))
      return true;
    }
    else{
      dispatch(updateActionState({
        type: ACTION_TYPES.DUPLICATE_NUMBERS_FOR_LOGS,
        value: {}
      }))
      return false;
    }
    
  }

  const updateProgressBar = (newValue, totalData) => {
    return dispatch(updateActionState({
      type: ACTION_TYPES.PROGRESS_BAR_COUNT,
      value: {
        newValue: newValue,
        totalData: totalData
      }
    }))
  }

  
  
  const handleCheckNumbers = async () => {
    
    if (hasEmptyNumbers()) return;
    if (hasDuplicates()) return;

    updateProgressBar(0, csvData.length);

    const startTime = new Date();
    const chunkSize = limits.lookupChunkSize;
    const chunks = chunkArray(csvData, chunkSize);

    const processChunk = async (chunk) => {

      const data = {
        csvData: chunk.chunkData,
        phoneNumberColumn: phoneNumberColumn,
        startIndex: chunk.startIndex,
        checkLineType: lineTypeSwitch
      }
      updateProgressBar(chunkSize, csvData.length)
      return expbackoff(async () => {
        return checkNumbers(data);
      })
    }

    const results = await processChunksInBatches(chunks, processChunk, limits.browserConcurrency);

    let checkedSuccess = 0;
    let checkedErrors = 0;
    let nonmobileNumbers_ID = []
    let invalidNumbers_ID = []
    let nonmobileNumbers = []
    let invalidNumbers = []

    results.forEach((r,index) => {
      if (r.status === 'fulfilled') {
        checkedSuccess += r.value.checkedSuccess;
        checkedErrors += r.value.checkedErrors;
        invalidNumbers_ID = invalidNumbers_ID.concat(r.value.invalidNumbers_ID)
        nonmobileNumbers_ID = nonmobileNumbers_ID.concat(r.value.nonmobileNumbers_ID)
        invalidNumbers = invalidNumbers.concat(r.value.invalidNumbers)
        nonmobileNumbers = nonmobileNumbers.concat(r.value.nonmobileNumbers)

      } else {
        console.log(`Promise no ${index} rejected with reason: ${r.reason}`)
      }
    });

    const lookupDataForLogs = {
      checkedSuccess,
      checkedErrors,
      invalidNumbers_ID,
      nonmobileNumbers_ID,
      invalidNumbers,
      nonmobileNumbers,
      source: "lookup"
    }

    dispatch(updateActionState({
			type: ACTION_TYPES.LOOKUP_DATA_FOR_LOGS,
			value: lookupDataForLogs
	  }))
    
    const endTime = new Date();
    const timeTaken = (endTime - startTime) / 1000;

    console.log(`The whole thing for ${csvData.length} rows took ${timeTaken}`)

  }

  const handleSendMessages = async () => {
    if (hasEmptyNumbers()) return;
    if (hasDuplicates()) return;
    updateProgressBar(0, csvData.length)
    
    const startTime = new Date();
    const chunkSize = broadcastSwitch ? limits.broadcastChunkSize : limits.standardAPIChunkSize;
    const chunks = chunkArray(csvData, chunkSize);

    const processChunk = async (chunk) => {
      
      let filteredChunkData = []
      if(sendResultsArray.length > 0){
        filteredChunkData = chunk.chunkData.filter(chunkItem => {
          const found = sendResultsArray.find(r => r.csvRowID === chunkItem.UniqueID);
          return !(found && found.status === 'delivered');
        });
      }
      
      const data = {
        csvData: filteredChunkData.length > 0 ? filteredChunkData: chunk.chunkData,
        startIndex: chunk.startIndex,
        phoneNumberColumn: phoneNumberColumn,
        ...(checkScheduleMessages ? { scheduledDate : scheduledDate, isSchedulingEnabled: true } : { isSchedulingEnabled: false}),
        ...messagingStructure,
        isLinkShorteningEnabled: checkLinkShortening
      }
      
      updateProgressBar(chunkSize, csvData.length)
      return expbackoff(async () => {
        return sendMessages(data, broadcastSwitch ? "broadcast" : "standard");
      })
    }

    const results = await processChunksInBatches(chunks, processChunk, limits.browserConcurrency);

    let sentSuccess = 0;
    let sentErrors = 0;
    let messageReceiptsArray = [];
    let failedReceiptsArray = [];

    results.forEach((r,index) => {
      if (r.status === 'fulfilled') {
        sentSuccess += r.value.sentSuccess;
        sentErrors += r.value.sentErrors;
        messageReceiptsArray = messageReceiptsArray.concat(r.value.messageReceiptsArray)
        failedReceiptsArray = failedReceiptsArray.concat(r.value.failedReceiptsArray)
        
      } else {
        console.log(`Promise no ${index} rejected with reason: ${r.reason}`)
      }
    });

    const resultsForState = {
      messageReceiptsArray,
      failedReceiptsArray
    }

    dispatch(updateMessagingState({
      type: MESSAGING_TYPES.UPDATE_SEND_RESULTS_ARRAY_AFTER_SEND,
      value: resultsForState
    }))

    const sendDataForLogs = {
      sentSuccess,
      sentErrors,
      messageReceiptsArray,
      failedReceiptsArray,
      source: "send"
    }

    dispatch(updateActionState({
			type: ACTION_TYPES.SEND_DATA_FOR_LOGS,
			value: sendDataForLogs
	  }))

    const endTime = new Date();
    const timeTaken = (endTime - startTime) / 1000;

    console.log(`The whole thing for ${messageReceiptsArray.length + failedReceiptsArray.length} rows took ${timeTaken}`)

  }


  return (
    <>
    <Box mt={1}>
        <FormControlLabel control={<Switch checked={lineTypeSwitch} onChange={handleLineTypeSwitch} />} label="Line Type Intelligence" />
        <IconButton onClick={() => setLineTypeAlert(lineTypeAlertClicked ? false : true)}>
            <HelpOutlineIcon/>
        </IconButton>
        <FormControlLabel control={<Switch checked={broadcastSwitch} onChange={handleBroadcastSwitch} />} label="Broadcast Messages" />
        <IconButton onClick={() => setBroadcastAlert(broadcastAlertClicked ? false : true)}>
            <HelpOutlineIcon/>
        </IconButton>
    </Box>
    { broadcastAlertClicked &&
      (<Alert severity="info">
        If selected, we will use the Broadcast API to send messages, which sends 1 request to many recipients, so it can be more efficient
        for high volume messaging. As of December 2023, this API is in pilot so your account needs to be manually enabled and full stability is not guaranteed.
      </Alert>)
    }
    { lineTypeAlertClicked &&
      (<Alert severity="info">
        <AlertTitle>About Line Type Intelligence</AlertTitle>
          Looking for line type can provide additional insights on the number itself. For example you can exclude landlines or VOIP numbers from your SMS campaigns. Not needed for Whatsapp campaigns.
          Additional charges apply. More information <a href="https://www.twilio.com/docs/lookup/v2-api/line-type-intelligence" target="_blank">here</a>
      </Alert>)
    }
    <ProTip message={protipmessage}/>
    <Stack direction="row" spacing={2} justifyContent="center">
              <Button fullWidth
                variant="contained"
                onClick={handleCheckNumbers}
                disabled={
                  !phoneNumberColumn
                }
                margin="normal"
                component="label"
              >
                Check Numbers
              </Button>
              <Button fullWidth
                variant="contained"
                onClick={handleSendMessages}
                disabled={
                  !phoneNumberColumn
                }
                margin="normal"
                component="label"
              >
                Send messages
              </Button>
        </Stack>
    </>
  );
};

export default CheckAndSend;
