import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux'
import Box from "@mui/material/Box";
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { updateActionState } from '../../Redux/slices/actionSlice';
import { ACTION_TYPES } from '../../Utils/variables';
import TabPanel from './TabPanel/TabPanel';
import LogPanel from './LogPanel/LogPanel';
import GraphPanel from './GraphPanel/GraphPanel';
import ProgressBar from './ProgressBar/ProgressBar';

const Logs = () => {
  const dispatch = useDispatch()
  const currentTotalLogs = useSelector(state => state.actionStructure.totalLogs)
  const lookupDataForLogs = useSelector(state => state.actionStructure.lookupDataForLogs)
  const getStatusDataForLogs = useSelector(state => state.actionStructure.getStatusDataForLogs)
  const emptyNumbersForLogs = useSelector(state => state.actionStructure.emptyNumbersForLogs)
  const duplicateNumberDataForLogs = useSelector(state => state.actionStructure.duplicateNumberDataForLogs)
  const sendDataForLogs = useSelector(state => state.actionStructure.sendDataForLogs)
  const enableGraph = useSelector(state => state.settingsStructure.enableGraph)
  const sendResultsArray = useSelector(state => state.messagingStructure.sendResultsArray)
  const channelSelection = useSelector(state => state.messagingStructure.channelSelection)
  const checkLineType = useSelector(state => state.settingsStructure.checkLineType)
  const csvData = useSelector(state => state.csvDataStructure.csvData)

  useEffect(() => {
    updateLogs(lookupDataForLogs)
  }, [lookupDataForLogs])

  useEffect(() => {
    updateLogs(sendDataForLogs)
  }, [sendDataForLogs])

  useEffect(() => {
    updateLogs(getStatusDataForLogs)
  }, [getStatusDataForLogs])

  useEffect(() => {
    updateLogs(emptyNumbersForLogs)
  }, [emptyNumbersForLogs])

  useEffect(() => {
    updateLogs(duplicateNumberDataForLogs)
  }, [duplicateNumberDataForLogs])

  const [tabValue, setTabValue] = useState(0)
  
  function handleChange(e, newValue) {
    setTabValue(newValue)
  }

  const clearLogs = () => {
    dispatch(updateActionState({
      type: ACTION_TYPES.TOTAL_LOGS,
      value: ""
    }))
  }

  const updateLogs = (data) => {

    const { source } = data;

    let date = new Date(Date.now());
    date.setUTCSeconds(0);
    let checkLog = ""

    if(source === "lookup"){

      checkLog = `Date: ${date.toString()}`
      const { checkedSuccess, checkedErrors, invalidNumbers_ID, nonmobileNumbers_ID} = data;

      checkLog += `\nAction: Checked Numbers`
      checkLog += "\nTotal numbers checked: " + checkedSuccess
      if(checkedErrors > 0) checkLog += "\nTotal numbers failed to be checked: " + checkedErrors
      invalidNumbers_ID.length > 0 ? checkLog += "\n!!! Total invalid numbers found: " + invalidNumbers_ID.length + "\n==> Check rows: " + JSON.stringify(invalidNumbers_ID) + "\n==> Please fix these errors to be able to send to this number" : checkLog += "\nNo invalid numbers found"
      if(checkLineType){
        nonmobileNumbers_ID.length > 0 ? checkLog += "\n!!! Total non-mobile numbers found: " + nonmobileNumbers_ID.length + "\n==> Check rows: " + JSON.stringify(nonmobileNumbers_ID) : checkLog += "\nNo non-mobile numbers found"
      }

    }

    else if(source === "send"){
      checkLog = `Date: ${date.toString()}`
      checkLog += `\nAction: Send Messages`

      const { sentSuccess, sentErrors, messageReceiptsArray, failedReceiptsArray} = data;
      checkLog += `\nNumber of messages created successfully: ${sentSuccess}`
      checkLog += `\nNumber of messages created with errors: ${sentErrors}`
      
      let showErrorsArray = failedReceiptsArray.map((element) => {
        let csvDataIndex = csvData.findIndex(r => element.csvRowID === r.UniqueID)
        return csvDataIndex
      })
      checkLog += `\nCheck rows: ${JSON.stringify(showErrorsArray.sort((a, b) => a - b))}`
    }

    else if(source=== "emptyNumbersError"){
      checkLog = `Date: ${date.toString()}`
      checkLog += `\n!!! Error: Numbers can't be empty ==> Check rows: ${JSON.stringify(emptyNumbersForLogs.emptyNumbersArray)}`
    }

    else if(source=== "duplicateNumbersError"){
      checkLog = `Date: ${date.toString()}`
      checkLog += `\n!!! Error: You have duplicate phone numbers ==> Check rows: ${JSON.stringify(duplicateNumberDataForLogs.duplicateNumbers)}`
    }

    else if(source=== "getMessageStatus"){
      checkLog = `Date: ${date.toString()}`
      checkLog += '\nCurrent Messages Status (row numbers shown):';
      let delivered = []
      let failed = []
      let in_progress = []
      let read = []
      for(let i = 0; i < sendResultsArray.length; i++){
        if(sendResultsArray[i].status === "delivered")delivered.push(i)
        else if (sendResultsArray[i].status === "read")read.push(i)
        else if(sendResultsArray[i].status === "undelivered")failed.push(i)
        else if(sendResultsArray[i].status === "failed")failed.push(i)
        else in_progress.push(i)
      }
      checkLog += "\n===> Delivered: " + JSON.stringify(delivered)
      if(channelSelection === "Whatsapp")checkLog += "\n===> Read: " + JSON.stringify(read)
      checkLog += "\n===> Failed/Undelivered: " + JSON.stringify(failed)
      checkLog += "\n===> In-Progress: " + JSON.stringify(in_progress)
    }

    const newTotalLogs = checkLog.length > 0 ? checkLog + "\n\n" + currentTotalLogs: currentTotalLogs

    dispatch(updateActionState({
      type: ACTION_TYPES.TOTAL_LOGS,
      value: newTotalLogs
    }))
    return;
  }

  
  
  return(
  <>
  <Typography variant="h5" component="h1" gutterBottom>
    Logs
  </Typography>
  

  <Tabs value={tabValue} onChange={handleChange} aria-label="basic tabs example">
    <Tab label="Actions" /> 
    {
      enableGraph ? 
      (<Tab label="Graph"  />)
      :
      (<Tab label="Graph" disabled  />)
    }
  </Tabs>
  <Box mt={2}>
  <TabPanel value={tabValue} index={0}>
    <LogPanel logs={currentTotalLogs} clearLogs={clearLogs} />
  </TabPanel>

  <TabPanel value={tabValue} index={1}>
    <GraphPanel />
  </TabPanel>
  </Box>
  <ProgressBar/>
  </>
  )

}


export default Logs