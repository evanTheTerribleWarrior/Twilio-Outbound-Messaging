function checkNumbers(event){
    event.preventDefault();

    if(this.checkEmptyNumbers())return;

    this.setState({ submitting: true, checkCompleted: false, error: false, showCheckLoadingIcon: true });


    if(this.state.sendResultsArray.length === 0){
      let arr = []
      let obj = {}
      for(let i = 0; i < this.state.csvData.length; i++){
        obj["sid"] = ""
        obj["error"] = {}
        obj["error"]["errorCode"] = ""
        obj["error"]["errorMessage"] = ""
        obj["error"]["errorLink"] = ""
        obj["status"] = ""
        arr.push(obj)
      }

      this.setState({sendResultsArray: arr})
    }

    const data = {
      'csvData':this.state.csvData,
      'radioSelection': this.state.radioSelection,
      'carrierSwitch': this.state.carrierSwitch
    }

    let auth_header = `Bearer ${this.state.token}`

    fetch(`check-numbers`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.state.auth_header
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((data) => {

        if (data.passwordError){
          throw data.passwordError
        }
        if (!data.status) {
          throw data.message;
        }
        this.setState({
          submitting: false,
          checkedSuccess: data.data.checkedSuccess,
          formatErrors: data.data.formatErrors,
          nonmobileNumbers: data.data.nonmobileNumbers,
          invalidNumbers: data.data.invalidNumbers,
          invalidNumbersCheck: true,
          checkCompleted: true,
          showCheckLoadingIcon: false
        });
        this.setState({logs: this.updateLogs("check")})
      })
      .catch((error) => {
        console.log(error);
        this.setState({ submitting: false, error: true, errorMsg: error, showCheckLoadingIcon: false });
        this.setState({logs: this.updateLogs("checkError")})
      });
  }

    function sendMsg(event) {
    event.preventDefault();

    if(this.checkEmptyNumbers())return;
    
    this.setState({ submitting: true, sendCompleted: false, error: false, showSendLoadingIcon: true, firstTimeSend: true});

    let sender = this.state.selectedService !== "" ? this.state.selectedService : this.state.sender
    let isMsgService = this.state.selectedService !== "" ? true : false


    const data = {
      'textmsg':this.state.msg,
      'sender': sender,
      'csvData':this.state.csvData,
      'channel':this.state.radioSelection,
      'isMsgService': isMsgService,
      'password': this.state.password,
      'sendResultsArray': this.state.sendResultsArray
    }


    fetch(`send`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.state.auth_header
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.passwordError){
          throw data.passwordError
        }
        if (!data.status) {
          throw data.message;
        }
        this.setState({
          submitting: false,
          smsSent: data.data.sentSuccess,
          smsErrors: data.data.sentErrors,
          sendCompleted: true,
          showSendLoadingIcon: false,
          sendResultsArray: data.data.sendResultsArray
        });
        this.setState({logs: this.updateLogs("send")})
      })
      .catch((error) => {
        console.log(error);
        this.setState({ submitting: false, error: true, errorMsg: error, showSendLoadingIcon: false });
        this.setState({logs: this.updateLogs("sendError")})
      });
  }




  const TabPanel = (props) => {
    const { value, index, sendResultsArray} = props;

    let error_array = []
    if(sendResultsArray){
      for (let i = 0; i < sendResultsArray.length; i++){
        if(sendResultsArray[i].error && sendResultsArray[i].error.errorCode){
          let error_index = error_array.findIndex((element) => {
            return parseInt(element.name) === sendResultsArray[i].error.errorCode
          })
          if(error_index !== -1){
            error_array[error_index].count++
          }
          else{
            error_array.push({"name": sendResultsArray[i].error.errorCode, "count": 1})
          }
        }
      }
    }

    let statuses_array = []
    /*statuses.map((status) =>{
      statuses_array.push({"name": status, "count": 0})
    })*/
    if(sendResultsArray){
      sendResultsArray.map((item) => {
        let status_index = statuses_array.findIndex((element) => {
          return element.name === item.status
        })
        if(status_index !== -1){
          statuses_array[status_index].count++
        }
        else{
          statuses_array.push({"name": item.status, "count": 1})
        }
      })
    }

    let colors_final = []
    statuses_array.map((status) =>{
        let color_index = statuses.indexOf(status.name)
        colors_final.push(color_index)
    })
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
      >
        {value === 0 ?
         (
          <TextareaAutosize
          placeholder="All logs will appear here"
          minRows={10}
          maxRows={10}
          style={{width: '100%'}}
          value={props.logs}
    
          />
         )
         :
         (<>
         <Stack direction="row" spacing={10}>
          <PieChart width={350} height={350}>
            <Pie
              dataKey="count"
              isAnimationActive={false}
              data={statuses_array}
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {colors_final.map((entry) => 
              (
              <Cell key={`cell-${index}`} fill={colors[entry]} />
              )
            )}
            </Pie>  
            <Tooltip />
          </PieChart>
          
          {
            error_array ?
          
          (<BarChart width={400} height={350} data={error_array} barSize={30} >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" >
            </XAxis>
            <YAxis allowDecimals={false} />
            <Bar dataKey="count" fill="red" />
          </BarChart>):
          <></>
          }
          </Stack>
          </>
        )}
      </div>
    );
  }

  export default TabPanel;




  import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Box from "@mui/material/Box";
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CircularProgress from '@mui/material/CircularProgress';

import { updateSettingsState } from '../../Redux/slices/settingsSlice';
import { SETTINGS_TYPES } from '../../Utils/variables';


const Settings = (props) => {

  const channelSelection = useSelector((state) => state.messagingStructure.channelSelection)
  const dispatch = useDispatch()

	const [carrierTypeAlertClicked, setCarrierType] = useState(false);
	const [carrierSwitch, setCarrierSwitch] = useState(false);

  const [notifySwitch, setNotifyServiceSwitch] = useState(false);
  const [notifyServiceAlertClicked, setNotifyServiceAlert] = useState(false);

  const [mediaSwitch, setMediaSwitch] = useState(false);
  const [mediaAlertClicked, setMediaAlert] = useState(false);

  const [optOutSwitch, setOptOutSwitch] = useState(false);
  const [optOutAlertClicked, setOptOutAlert] = useState(false);

	function handleCarrierSwitch(event) {
    dispatch(updateSettingsState({
      type: SETTINGS_TYPES.CARRIER_SWITCH,
      value: event.target.checked
    }))
		setCarrierSwitch(carrierSwitch ? false : true)
	}

  function handleMediaSwitch(event) {
    dispatch(updateSettingsState({
      type: SETTINGS_TYPES.MEDIA_URL_SWITCH,
      value: event.target.checked
    }))
		setMediaSwitch(mediaSwitch ? false : true)
	}

  function handleOptOutSwitch(event) {
    dispatch(updateSettingsState({
      type: SETTINGS_TYPES.OPT_OUT_SWITCH,
      value: event.target.checked
    }))
		setOptOutSwitch(optOutSwitch ? false : true)
	}


	return(
		<Box mt={2}>

      <Typography variant="h5" component="h1" gutterBottom>
        Settings
      </Typography>

      <Box mt={1}>
        <FormControlLabel control={<Switch disabled={channelSelection === "Whatsapp" ? true : false} checked={carrierSwitch} onChange={handleCarrierSwitch} />} label="Check Carrier Type" />
        <IconButton onClick={() => setCarrierType(carrierTypeAlertClicked ? false : true)}>
          <HelpOutlineIcon/>
        </IconButton>
        </Box>
        { carrierTypeAlertClicked ?
        (<Alert severity="info">
          <AlertTitle>About Carrier Type</AlertTitle>
          Looking for carrier type can provide additional insights on the number itself. For example you can exclude landlines or VOIP numbers from your SMS campaigns. Not needed for Whatsapp campaigns.
          Additional charges apply. More information <a href="https://www.twilio.com/docs/lookup/api#lookups-carrier-info" target="_blank">here</a>
        </Alert>)
        : ""
        }

        <Box mt={1}>
          <FormControlLabel control={<Switch checked={mediaSwitch} onChange={handleMediaSwitch} />} label="Send Media / MMS" />
          <IconButton onClick={() => setMediaAlert(mediaAlertClicked ? false : true)}>
            <HelpOutlineIcon/>
          </IconButton>
        </Box>
        { mediaAlertClicked ?
        (<Alert severity="info">
          If selected, you can set a publicly available Media URL in order to send a media file. You can read more about sending media files in SMS <a href="https://www.twilio.com/docs/messaging/services/tutorials/how-to-send-sms-messages-services" target="_blank">here</a> and Whatsapp <a href="https://www.twilio.com/docs/whatsapp/guidance-whatsapp-media-messages" target="_blank">here</a>
        </Alert>)
        : ""
        }

        {/*<Box mt={1}>
          <FormControlLabel control={<Switch checked={optOutSwitch} onChange={handleOptOutSwitch} />} label="Add Twilio Opt Out URL" />
          <IconButton onClick={() => setOptOutAlert(optOutAlertClicked ? false : true)}>
            <HelpOutlineIcon/>
          </IconButton>
        </Box>
        { optOutAlertClicked ?
        (<Alert severity="info">
          If selected, a Twilio URL will be automatically appended to your message to allow users to opt out.
          The URL will be in the format {props.optOutHost}/o?ABC123, where "ABC123" is the hash of the recipient's number
        </Alert>)
        : ""
        }*/}

        {/*<Box mt={1}>
          <FormControlLabel control={<Switch checked={notifySwitch} onChange={handleNotifyServiceSwitch} disabled={!props.isAuthenticated || msgServiceSwitch} />} label="Use Notify" />
          <IconButton onClick={() => setNotifyServiceAlert(notifyServiceAlertClicked ? false : true)}>
            <HelpOutlineIcon/>
          </IconButton>
          {
            props.showNotifyLoadingIcon ?

            (<>
              <CircularProgress size={15}/>
              <Typography variant="h6"gutterBottom>
                Loading Messaging Services to use with Notify...
              </Typography>

            </>) : ""
          }
        </Box>
        { notifyServiceAlertClicked ?
        (<Alert severity="info">
          Notify is a Twilio API that allows bulk messaging with minimal amount of requests - up to 10,000 recipients with a single request. If selected, you will get a dropdown with the available Messaging Services you have created in your account.
          You can choose one of them for the outbound messaging. Keep in mind that if you use Notify you can't add variables in the message body. You can read more about Notify <a href="https://www.twilio.com/docs/notify" target="_blank">here</a>
        </Alert>)
        : ""
        }*/}
        
      </Box>
     )

}

export default Settings;



import React, {useState, useEffect} from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import TableFooter from '@mui/material/TableFooter';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import IconButton from '@mui/material/IconButton';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Button from "@mui/material/Button";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Stack from '@mui/material/Stack';
import { v4 as uuidv4 } from 'uuid';
import { useSelector, useDispatch} from 'react-redux';
import { FixedSizeList as List } from 'react-window';
import { updateCSVState } from '../../Redux/slices/csvDataSlice';
import { updateMessagingState } from '../../Redux/slices/messagingSlice';
import { updateSettingsState } from '../../Redux/slices/settingsSlice';
import { updateActionState } from '../../Redux/slices/actionSlice';
import { CSVDATA_TYPES, MESSAGING_TYPES, SETTINGS_TYPES, ACTION_TYPES } from '../../Utils/variables';
import { chunkArray, processChunksInBatches, getMessageStatus } from '../../Utils/functions';

const in_progress_statuses = ["accepted", "queued", "sent", "sending"]
const failed_statuses = ["undelivered", "failed"]
const PlaceholderIcon = () => <HourglassEmptyIcon color="action" />;

const columnWidths = {
  id: '100px',
  other: '150px'
};

const CampaignTable = () => {

  const csvData = useSelector(state => state.csvDataStructure.csvData)
  const phoneNumberColumn = useSelector(state => state.csvDataStructure.csvSelectedColumn)
  const sendResultsArray = useSelector(state => state.messagingStructure.sendResultsArray)
  const customMessage = useSelector(state => state.messagingStructure.customMessage)
  const lookupDataForLogs = useSelector(state => state.actionStructure.lookupDataForLogs)
  const checkLineType = useSelector(state => state.settingsStructure.checkLineType)
  const limits = useSelector(state => state.settingsStructure.limits)
  const dispatch = useDispatch()

  const [editIdx, setEditIdx] = useState(-1);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [findRowNumber, setFindRowNumber] = useState(0);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setCurrent(page * rowsPerPage);
  }, [page, rowsPerPage]);

  const handleGetStatus = async () => {

    const startTime = new Date();
    const chunkSize = limits.getStatusChunkSize;
    const chunks = chunkArray(sendResultsArray, chunkSize);

    console.log(chunks)

    const processChunk = async (chunk) => {
      const data = {
        sendResultsArray: chunk.chunkData,
        startIndex: chunk.startIndex
      }
      return await getMessageStatus(data);
    }

    const results = await processChunksInBatches(chunks, processChunk, limits.browserConcurrency);

    results.forEach((r,index) => {
      if (r.status === 'fulfilled') {
        dispatch(updateMessagingState({
          type: MESSAGING_TYPES.SEND_RESULTS_ARRAY,
          value: r.value.sendResultsArray
        }))
      } else {
        console.log(`Promise no ${index} rejected with reason: ${r.reason}`)
      }
    });

    dispatch(updateSettingsState({
      type: SETTINGS_TYPES.ENABLE_GRAPH,
      value: true
    }))
    
    const endTime = new Date();
    const timeTaken = (endTime - startTime) / 1000;

    const getStatusDataForLogs = {
      source: "getMessageStatus"
    }

    dispatch(updateActionState({
			type: ACTION_TYPES.GET_STATUS_DATA_FOR_LOGS,
			value: getStatusDataForLogs
	  }))

    console.log(`Get status for ${sendResultsArray.length} rows took ${timeTaken}`)

  }

  const addRowClick = () => {
    let cols = Object.keys(csvData[0])
    let new_row = {}
    for (let i = 0; i < cols.length; i++){    
      cols[i] === "UniqueID" ? new_row[cols[i]] = uuidv4() : new_row[cols[i]] = ""
    }
    const newCsvData = [...csvData];
    newCsvData.unshift(new_row)
    dispatch(updateCSVState({
      type: CSVDATA_TYPES.ALL_CSV_DATA,
      value: newCsvData
    }));

    if(sendResultsArray.length > 0){
      let obj = {}
      obj["messageSid"] = ""
      obj["error"] = {}
      obj["error"]["errorCode"] = ""
      obj["error"]["errorMessage"] = ""
      obj["error"]["errorLink"] = ""
      obj["status"] = ""
      obj["csvRowID"] = new_row.UniqueID
      const newSendResultsArray = [...sendResultsArray];
      newSendResultsArray.unshift(obj)
      dispatch(updateMessagingState({
        type: MESSAGING_TYPES.SEND_RESULTS_ARRAY,
        value: newSendResultsArray
      }));
      obj = {}
    }

  }
 
  const handleColumnNameClick = (col) => {
    console.log(col)
    dispatch(updateMessagingState({
      type: MESSAGING_TYPES.CUSTOM_MESSAGE,
      value: customMessage + `{{${col}}}`
    }))
  }
 
  const startEditing = (i) => {
    setEditIdx(i);
    console.log("Editing row " + i)
  };

  const stopEditing = () => {
    setEditIdx(-1);
    dispatch(updateCSVState({
      type: CSVDATA_TYPES.ALL_CSV_DATA,
      value: csvData
    }));
  };

  const handleEditing = (e, name, i) => {
    let value = "";
    
    if(name === phoneNumberColumn)
      value = e.target.value.trim().replace(/\s+/g, '')
    else value = e.target.value
    
    const updatedCsvData = csvData.map((row, j) => 
      j === i ? { ...row, [name]: value } : row
    );

    dispatch(updateCSVState({
      type: CSVDATA_TYPES.ALL_CSV_DATA,
      value: updatedCsvData
    }));
  };


  const handleRemove = (i) => {
    const updatedCsvData = csvData.filter((row, j) => j !== i)
    dispatch(updateCSVState({
      type: CSVDATA_TYPES.ALL_CSV_DATA,
      value: updatedCsvData
    }));

    const updatedResultsArray = sendResultsArray.filter((row, j) => j !== i)
    dispatch(updateMessagingState({
      type: MESSAGING_TYPES.SEND_RESULTS_ARRAY,
      value: updatedResultsArray
    }));
 };

 const shouldShowIconLookup = (UniqueID) => {
    
  let show = false;
  if ((lookupDataForLogs.nonmobileNumbers && lookupDataForLogs.nonmobileNumbers.includes(UniqueID)) ||
    (lookupDataForLogs.invalidNumbers && lookupDataForLogs.invalidNumbers.includes(UniqueID)) || (lookupDataForLogs.checkedSuccess > 0 || lookupDataForLogs.checkedErrors >0)
  ){return show = true;}
  
  return show;
}

  const showRelevantIconLookup = (UniqueID) =>{
    let title, color;
    let icon;
    let interactive = false;
    let renderTitleJSX = false;

    if(lookupDataForLogs.checkedSuccess > 0 || lookupDataForLogs.checkedErrors >0){
      if (lookupDataForLogs.nonmobileNumbers && lookupDataForLogs.nonmobileNumbers.includes(UniqueID)){
        title = "We could not identify this number as a valid mobile number. Ensure you don't send SMS to non-mobile numbers"
        color = "orange"
        icon = "WarningIcon"
        interactive = false
  
      }
      else if (lookupDataForLogs.invalidNumbers && lookupDataForLogs.invalidNumbers.includes(UniqueID)){
        title = "This number was marked as invalid, does it have the correct number of digits?"
        color = "red"
        icon = "ErrorIcon"
        interactive = false
      } 
      else {
        title = "This number passed the check"
        color = "green"
        icon = "CheckCircleIcon"
        interactive = false
      }
    }

    

    return {title, color, icon, interactive, renderTitleJSX}

  }

  const shouldShowIcon = (UniqueID) => {
    let show = false;
    if (sendResultsArray.length > 0){
    
      let index = sendResultsArray.findIndex((element) => { return element.csvRowID === UniqueID})
      if (index !== -1){
        if (sendResultsArray[index]["status"].length > 0)
          return show = true;
      }
    }
    return show;
  }

  const showRelevantIcon = (UniqueID) =>{

    let title, color;
    let icon;
    let interactive = false;
    let renderTitleJSX = false;
    let index;

    if (sendResultsArray.length > 0){    
      index = sendResultsArray.findIndex((element) => {return element.csvRowID === UniqueID})
    }

    if (sendResultsArray && sendResultsArray.length > 0 && index !== -1 && (sendResultsArray[index]["status"] === "delivered" || sendResultsArray[index]["status"] === "read")){
      title = "Message marked as Delivered - It will be excluded from further 'Send Messages' actions"
      color = "green"
      icon = "CheckCircleIcon"
      interactive = false
    }

    else if (sendResultsArray && sendResultsArray.length > 0 && index !== -1 && failed_statuses.includes(sendResultsArray[index]["status"])){
      
      color = "red"
      icon = "ErrorIcon"
      interactive = true
      renderTitleJSX = true
    }

    else if (sendResultsArray && sendResultsArray.length > 0 && index !== -1 && (in_progress_statuses.includes(sendResultsArray[index]["status"]) || sendResultsArray[index]["status"] === "")){
      
      title = "Message Successfuly Created - Check Status periodically for final message status. If Status does not change in a few minutes, check Twilio Logs"
      color = "grey"
      icon = "CheckCircleIcon"
      interactive = false
    }

    return {title, color, icon, interactive, renderTitleJSX}

  }

  const handleChangePage = (event, page) => {
    setPage(parseInt(page, 10))
    setCurrent(page * rowsPerPage)
  };
  
  const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10))
      setPage(0)
  };

  const currentDataSlice = csvData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleFindRowChange = (event) => {
    setFindRowNumber(event.target.value)
  }

  const handleMouseDownFindRow = (event) => {
    event.preventDefault();
  }

  const handleClickFindRow = (rowNumber) => {
    if(rowNumber < 0){
      rowNumber = 0;
    }
    else if (rowNumber > csvData.length){
      rowNumber = csvData.length
    }
    setPage(Math.floor(rowNumber/rowsPerPage))
  }


  const Row = ({index, style}) => {

    const currentRowIndex = current + index;
    console.log(currentRowIndex)
    const row = csvData[currentRowIndex]
    console.log(row)

    return (
      <TableRow 
                key={`tr-${row.UniqueID}`}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                style={style}
              >
                  <TableCell style={{ width: '100px' }}>
                  {currentRowIndex}
                  </TableCell>


                  {Object.keys(row).map((col) => (
                              <>
                
                              {
                                
                                col === "UniqueID" ? "" :
                               (<TableCell key={`tc-${row.UniqueID}`} style={{ width: '200px' }}>
                                
                               { editIdx === currentRowIndex ?
                                  (
                                    <div>
                                    <TextField
                                      name={row[col]}
                                      onChange={e => handleEditing(e, col, currentRowIndex)}
                                      value={row[col]}
                                    />
                                    </div>
                                  )
                                  :
                                  (
                                    row[col]
                                  )
                                }
                               </TableCell>)
                              }
                               </>
                  ))}


                { editIdx === currentRowIndex ?

                  (<TableCell  onClick={ () => stopEditing()} style={{ width: '100px' }}>
                     <Tooltip title="Stop editing">
                      <IconButton >
                        <CheckIcon />
                      </IconButton>
                    </Tooltip>   
                    </TableCell>) 

                  :

                   (<TableCell onClick={ () => startEditing(currentRowIndex)} style={{ width: '100px' }}>
                     <Tooltip title="Edit this row">
                      <IconButton >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>   
                    </TableCell>) 
                }
                 
                 <TableCell  onClick={ () => handleRemove(currentRowIndex)} style={{ width: '100px' }}>
                   <Tooltip title="Delete this row">
                    <IconButton >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>   
                  </TableCell>  

                  <TableCell style={{ width: '100px' }}>
                  {shouldShowIconLookup(row.UniqueID) ?
                  (<Tooltip
                  title={showRelevantIconLookup(row.UniqueID).title} 
                  interactive={showRelevantIconLookup(currentRowIndex).interactive ? 1 : 0}>
                    <IconButton >
                      {showRelevantIconLookup(row.UniqueID).icon === "WarningIcon"? <WarningIcon style={{color: showRelevantIconLookup(row.UniqueID).color}} /> : "" }
                      {showRelevantIconLookup(row.UniqueID).icon === "ErrorIcon"? <ErrorIcon style={{color: showRelevantIconLookup(row.UniqueID).color}} /> : "" }
                      {showRelevantIconLookup(row.UniqueID).icon === "CheckCircleIcon"? <CheckCircleIcon style={{color: showRelevantIconLookup(row.UniqueID).color}} /> : "" }
                    </IconButton>
                  </Tooltip>): <HourglassEmptyIcon/>}
                  </TableCell>

                    <TableCell style={{ width: '100px' }}>
                      {shouldShowIcon(row.UniqueID) ?
                      (<Tooltip
                      title={showRelevantIcon(row.UniqueID).renderTitleJSX ?
                          (<>
                          Error code: {sendResultsArray[currentRowIndex]["error"].errorCode}<br/>
                          {sendResultsArray[currentRowIndex]["error"].errorLink ? (<>For more information please click <a href={sendResultsArray[currentRowIndex]["error"]["errorLink"]} target="_blank">HERE</a></>) : (<>For more information please click <a href={"https://twilio.com/docs/api/errors/" + sendResultsArray[currentRowIndex]["error"].errorCode} target="_blank">HERE</a></>)}   
                          </>)
                        : showRelevantIcon(row.UniqueID).title} 
                      interactive={showRelevantIcon(currentRowIndex).interactive ? 1 : 0}>
                        <IconButton >
                          {showRelevantIcon(row.UniqueID).icon === "WarningIcon"? <WarningIcon style={{color: showRelevantIcon(row.UniqueID).color}} /> : "" }
                          {showRelevantIcon(row.UniqueID).icon === "ErrorIcon"? <ErrorIcon style={{color: showRelevantIcon(row.UniqueID).color}} /> : "" }
                          {showRelevantIcon(row.UniqueID).icon === "CheckCircleIcon"? <CheckCircleIcon style={{color: showRelevantIcon(row.UniqueID).color}} /> : "" }
                        </IconButton>
                      </Tooltip>) : <PlaceholderIcon/> 
                       } 
                    </TableCell>
                    
                 
                  
              </TableRow>  
    )
  }
            
      
    return (
      <>
      
      <Typography variant="h5" component="h1" gutterBottom>
        User Data
      </Typography>

      
      <Stack direction="row" spacing={2}>
        <Button variant="outlined" startIcon={<AddIcon />} onClick = {() => addRowClick()}>Add Row</Button>
        <FormControl sx={{ m: 1, width: '20ch' }} variant="outlined">
            <InputLabel htmlFor="outlined-adornment-find">Find Row</InputLabel>
            <OutlinedInput
              id="outlined-adornment-find-row"
              type={'number'}
              value={findRowNumber}
              onChange={e => handleFindRowChange(e)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="find row"
                    onClick={() => handleClickFindRow(findRowNumber)}
                    onMouseDown={(e) => handleMouseDownFindRow(e)}
                    edge="start"
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              }
              label="Find Row"
            />
          </FormControl>
        </Stack>
      <TableContainer component={Paper} style={{ maxHeight: '70vh', border: "1px solid rgba(0,0,0,0.2)", padding: 4}}>
        <Table stickyHeader={true}  >
          <TableHead>
            <TableRow>
              <TableCell style={{color: 'grey', width: '100px'}}>ID</TableCell>
              {Object.keys(csvData[0]).map((col) => (
                   <>
                   {
                     col === "UniqueID" ? "" :
                     (<TableCell 
                      key={col} 
                      style={{cursor: 'pointer', width: '200px'}} 
                      onClick={ () => handleColumnNameClick(col)}>{col}
                      </TableCell>)
                   }
                   
                   </>
              ))}
              <TableCell style={{color: 'grey', width: '100px'}}>Edit</TableCell>
              <TableCell style={{color: 'grey', width: '100px'}}>Delete</TableCell>
              <TableCell style={{color: 'grey', width: '100px'}}>Lookup Status</TableCell>
              <TableCell style={{width: '100px'}}><Button variant="outlined" onClick={handleGetStatus} >Get Message Status</Button></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            <List
            height={500}
            itemCount={currentDataSlice.length}
            itemSize={50}
            width="100%"
            > 
              {Row}
            </List> 
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                count={csvData.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(e,p) => handleChangePage(e,p)}
                onRowsPerPageChange={(e) => handleChangeRowsPerPage(e)}
                rowsPerPageOptions={[10, 25, 50, 100]}
              />
            </TableRow>
          </TableFooter>
        </Table>
                </TableContainer>
      </>
   
                )
                
}


export default CampaignTable;



import React, {useState, useEffect} from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import TableFooter from '@mui/material/TableFooter';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Box, Grid } from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import IconButton from '@mui/material/IconButton';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SearchIcon from '@mui/icons-material/Search';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Button from "@mui/material/Button";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Stack from '@mui/material/Stack';
import { v4 as uuidv4 } from 'uuid';
import { useSelector, useDispatch} from 'react-redux';
import { FixedSizeList as List } from 'react-window';
import { updateCSVState } from '../../Redux/slices/csvDataSlice';
import { updateMessagingState } from '../../Redux/slices/messagingSlice';
import { updateSettingsState } from '../../Redux/slices/settingsSlice';
import { updateActionState } from '../../Redux/slices/actionSlice';
import { CSVDATA_TYPES, MESSAGING_TYPES, SETTINGS_TYPES, ACTION_TYPES } from '../../Utils/variables';
import { chunkArray, processChunksInBatches, getMessageStatus } from '../../Utils/functions';

const in_progress_statuses = ["accepted", "queued", "sent", "sending"]
const failed_statuses = ["undelivered", "failed"]
const PlaceholderIcon = () => <HourglassEmptyIcon color="action" />;

const columnWidths = {
  editable: '200px',
  noneditable: '100px'
};

const CampaignTable = () => {

  const csvData = useSelector(state => state.csvDataStructure.csvData)
  const csvColumnFields = useSelector(state => state.csvDataStructure.csvColumnFields)
  const phoneNumberColumn = useSelector(state => state.csvDataStructure.csvSelectedColumn)
  const sendResultsArray = useSelector(state => state.messagingStructure.sendResultsArray)
  const customMessage = useSelector(state => state.messagingStructure.customMessage)
  const lookupDataForLogs = useSelector(state => state.actionStructure.lookupDataForLogs)
  const limits = useSelector(state => state.settingsStructure.limits)
  const dispatch = useDispatch()

  const [editIdx, setEditIdx] = useState(-1);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [findRowNumber, setFindRowNumber] = useState(0);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setCurrent(page * rowsPerPage);
  }, [page, rowsPerPage]);

  const handleGetStatus = async () => {

    const startTime = new Date();
    const chunkSize = limits.getStatusChunkSize;
    const chunks = chunkArray(sendResultsArray, chunkSize);

    console.log(chunks)

    const processChunk = async (chunk) => {
      const data = {
        sendResultsArray: chunk.chunkData,
        startIndex: chunk.startIndex
      }
      return await getMessageStatus(data);
    }

    const results = await processChunksInBatches(chunks, processChunk, limits.browserConcurrency);

    results.forEach((r,index) => {
      if (r.status === 'fulfilled') {
        dispatch(updateMessagingState({
          type: MESSAGING_TYPES.SEND_RESULTS_ARRAY,
          value: r.value.sendResultsArray
        }))
      } else {
        console.log(`Promise no ${index} rejected with reason: ${r.reason}`)
      }
    });

    dispatch(updateSettingsState({
      type: SETTINGS_TYPES.ENABLE_GRAPH,
      value: true
    }))
    
    const endTime = new Date();
    const timeTaken = (endTime - startTime) / 1000;

    const getStatusDataForLogs = {
      source: "getMessageStatus"
    }

    dispatch(updateActionState({
			type: ACTION_TYPES.GET_STATUS_DATA_FOR_LOGS,
			value: getStatusDataForLogs
	  }))

    console.log(`Get status for ${sendResultsArray.length} rows took ${timeTaken}`)

  }

  const addRowClick = () => {
    let cols = Object.keys(csvData[0])
    let new_row = {}
    for (let i = 0; i < cols.length; i++){    
      cols[i] === "UniqueID" ? new_row[cols[i]] = uuidv4() : new_row[cols[i]] = ""
    }
    const newCsvData = [...csvData];
    newCsvData.unshift(new_row)
    dispatch(updateCSVState({
      type: CSVDATA_TYPES.ALL_CSV_DATA,
      value: newCsvData
    }));

    if(sendResultsArray.length > 0){
      let obj = {}
      obj["messageSid"] = ""
      obj["error"] = {}
      obj["error"]["errorCode"] = ""
      obj["error"]["errorMessage"] = ""
      obj["error"]["errorLink"] = ""
      obj["status"] = ""
      obj["csvRowID"] = new_row.UniqueID
      const newSendResultsArray = [...sendResultsArray];
      newSendResultsArray.unshift(obj)
      dispatch(updateMessagingState({
        type: MESSAGING_TYPES.SEND_RESULTS_ARRAY,
        value: newSendResultsArray
      }));
      obj = {}
    }

  }
 
  const handleColumnNameClick = (col) => {
    console.log(col)
    dispatch(updateMessagingState({
      type: MESSAGING_TYPES.CUSTOM_MESSAGE,
      value: customMessage + `{{${col}}}`
    }))
  }
 
  const startEditing = (i) => {
    setEditIdx(i);
    console.log("Editing row " + i)
  };

  const stopEditing = () => {
    setEditIdx(-1);
    dispatch(updateCSVState({
      type: CSVDATA_TYPES.ALL_CSV_DATA,
      value: csvData
    }));
  };

  const handleEditing = (e, name, i) => {
    let value = "";
    
    if(name === phoneNumberColumn)
      value = e.target.value.trim().replace(/\s+/g, '')
    else value = e.target.value
    
    const updatedCsvData = csvData.map((row, j) => 
      j === i ? { ...row, [name]: value } : row
    );

    dispatch(updateCSVState({
      type: CSVDATA_TYPES.ALL_CSV_DATA,
      value: updatedCsvData
    }));
  };


  const handleRemove = (i) => {
    const updatedCsvData = csvData.filter((row, j) => j !== i)
    dispatch(updateCSVState({
      type: CSVDATA_TYPES.ALL_CSV_DATA,
      value: updatedCsvData
    }));

    const updatedResultsArray = sendResultsArray.filter((row, j) => j !== i)
    dispatch(updateMessagingState({
      type: MESSAGING_TYPES.SEND_RESULTS_ARRAY,
      value: updatedResultsArray
    }));
 };

 const shouldShowIconLookup = (UniqueID) => {
    
  let show = false;
  if ((lookupDataForLogs.nonmobileNumbers && lookupDataForLogs.nonmobileNumbers.includes(UniqueID)) ||
    (lookupDataForLogs.invalidNumbers && lookupDataForLogs.invalidNumbers.includes(UniqueID)) || (lookupDataForLogs.checkedSuccess > 0 || lookupDataForLogs.checkedErrors >0)
  ){return show = true;}
  
  return show;
}

  const showRelevantIconLookup = (UniqueID) =>{
    let title, color;
    let icon;
    let interactive = false;
    let renderTitleJSX = false;

    if(lookupDataForLogs.checkedSuccess > 0 || lookupDataForLogs.checkedErrors >0){
      if (lookupDataForLogs.nonmobileNumbers && lookupDataForLogs.nonmobileNumbers.includes(UniqueID)){
        title = "We could not identify this number as a valid mobile number. Ensure you don't send SMS to non-mobile numbers"
        color = "orange"
        icon = "WarningIcon"
        interactive = false
  
      }
      else if (lookupDataForLogs.invalidNumbers && lookupDataForLogs.invalidNumbers.includes(UniqueID)){
        title = "This number was marked as invalid, does it have the correct number of digits?"
        color = "red"
        icon = "ErrorIcon"
        interactive = false
      } 
      else {
        title = "This number passed the check"
        color = "green"
        icon = "CheckCircleIcon"
        interactive = false
      }
    }

    

    return {title, color, icon, interactive, renderTitleJSX}

  }

  const shouldShowIcon = (UniqueID) => {
    let show = false;
    if (sendResultsArray.length > 0){
    
      let index = sendResultsArray.findIndex((element) => { return element.csvRowID === UniqueID})
      if (index !== -1){
        if (sendResultsArray[index]["status"].length > 0)
          return show = true;
      }
    }
    return show;
  }

  const showRelevantIcon = (UniqueID) =>{

    let title, color;
    let icon;
    let interactive = false;
    let renderTitleJSX = false;
    let index;

    if (sendResultsArray.length > 0){    
      index = sendResultsArray.findIndex((element) => {return element.csvRowID === UniqueID})
    }

    if (sendResultsArray && sendResultsArray.length > 0 && index !== -1 && (sendResultsArray[index]["status"] === "delivered" || sendResultsArray[index]["status"] === "read")){
      title = "Message marked as Delivered - It will be excluded from further 'Send Messages' actions"
      color = "green"
      icon = "CheckCircleIcon"
      interactive = false
    }

    else if (sendResultsArray && sendResultsArray.length > 0 && index !== -1 && failed_statuses.includes(sendResultsArray[index]["status"])){
      
      color = "red"
      icon = "ErrorIcon"
      interactive = true
      renderTitleJSX = true
    }

    else if (sendResultsArray && sendResultsArray.length > 0 && index !== -1 && (in_progress_statuses.includes(sendResultsArray[index]["status"]) || sendResultsArray[index]["status"] === "")){
      
      title = "Message Successfuly Created - Check Status periodically for final message status. If Status does not change in a few minutes, check Twilio Logs"
      color = "grey"
      icon = "CheckCircleIcon"
      interactive = false
    }

    return {title, color, icon, interactive, renderTitleJSX}

  }

  const handleChangePage = (event, page) => {
    setPage(parseInt(page, 10))
    setCurrent(page * rowsPerPage)
  };
  
  const handleChangeRowsPerPage = (event) => {
      setRowsPerPage(parseInt(event.target.value, 10))
      setPage(0)
  };

  const currentDataSlice = csvData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleFindRowChange = (event) => {
    setFindRowNumber(event.target.value)
  }

  const handleMouseDownFindRow = (event) => {
    event.preventDefault();
  }

  const handleClickFindRow = (rowNumber) => {
    if(rowNumber < 0){
      rowNumber = 0;
    }
    else if (rowNumber > csvData.length){
      rowNumber = csvData.length
    }
    setPage(Math.floor(rowNumber/rowsPerPage))
  }


  const Row = ({index, style}) => {

    const currentRowIndex = current + index;
    const row = csvData[currentRowIndex];

    return (
      <Grid container style={{ ...style, width: '100%' }} alignItems="center">
        {csvColumnFields && csvColumnFields.map((column, colIndex) => (
          <Grid item key={colIndex} style={{ width: columnWidths.editable, padding: 8 }}>
            <Typography>{row[column]}</Typography>
          </Grid>
        ))}
      </Grid>
    );

    return (
      <TableRow 
                key={`tr-${row.UniqueID}`}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                style={style}
              >
                  <TableCell style={{ width: '100px' }}>
                  {currentRowIndex}
                  </TableCell>


                  {Object.keys(row).map((col) => (
                              <>
                
                              {
                                
                                col === "UniqueID" ? "" :
                               (<TableCell key={`tc-${row.UniqueID}`} style={{ width: '200px' }}>
                                
                               { editIdx === currentRowIndex ?
                                  (
                                    <div>
                                    <TextField
                                      name={row[col]}
                                      onChange={e => handleEditing(e, col, currentRowIndex)}
                                      value={row[col]}
                                    />
                                    </div>
                                  )
                                  :
                                  (
                                    row[col]
                                  )
                                }
                               </TableCell>)
                              }
                               </>
                  ))}


                { editIdx === currentRowIndex ?

                  (<TableCell  onClick={ () => stopEditing()} style={{ width: '100px' }}>
                     <Tooltip title="Stop editing">
                      <IconButton >
                        <CheckIcon />
                      </IconButton>
                    </Tooltip>   
                    </TableCell>) 

                  :

                   (<TableCell onClick={ () => startEditing(currentRowIndex)} style={{ width: '100px' }}>
                     <Tooltip title="Edit this row">
                      <IconButton >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>   
                    </TableCell>) 
                }
                 
                 <TableCell  onClick={ () => handleRemove(currentRowIndex)} style={{ width: '100px' }}>
                   <Tooltip title="Delete this row">
                    <IconButton >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>   
                  </TableCell>  

                  <TableCell style={{ width: '100px' }}>
                  {shouldShowIconLookup(row.UniqueID) ?
                  (<Tooltip
                  title={showRelevantIconLookup(row.UniqueID).title} 
                  interactive={showRelevantIconLookup(currentRowIndex).interactive ? 1 : 0}>
                    <IconButton >
                      {showRelevantIconLookup(row.UniqueID).icon === "WarningIcon"? <WarningIcon style={{color: showRelevantIconLookup(row.UniqueID).color}} /> : "" }
                      {showRelevantIconLookup(row.UniqueID).icon === "ErrorIcon"? <ErrorIcon style={{color: showRelevantIconLookup(row.UniqueID).color}} /> : "" }
                      {showRelevantIconLookup(row.UniqueID).icon === "CheckCircleIcon"? <CheckCircleIcon style={{color: showRelevantIconLookup(row.UniqueID).color}} /> : "" }
                    </IconButton>
                  </Tooltip>): <HourglassEmptyIcon/>}
                  </TableCell>

                    <TableCell style={{ width: '100px' }}>
                      {shouldShowIcon(row.UniqueID) ?
                      (<Tooltip
                      title={showRelevantIcon(row.UniqueID).renderTitleJSX ?
                          (<>
                          Error code: {sendResultsArray[currentRowIndex]["error"].errorCode}<br/>
                          {sendResultsArray[currentRowIndex]["error"].errorLink ? (<>For more information please click <a href={sendResultsArray[currentRowIndex]["error"]["errorLink"]} target="_blank">HERE</a></>) : (<>For more information please click <a href={"https://twilio.com/docs/api/errors/" + sendResultsArray[currentRowIndex]["error"].errorCode} target="_blank">HERE</a></>)}   
                          </>)
                        : showRelevantIcon(row.UniqueID).title} 
                      interactive={showRelevantIcon(currentRowIndex).interactive ? 1 : 0}>
                        <IconButton >
                          {showRelevantIcon(row.UniqueID).icon === "WarningIcon"? <WarningIcon style={{color: showRelevantIcon(row.UniqueID).color}} /> : "" }
                          {showRelevantIcon(row.UniqueID).icon === "ErrorIcon"? <ErrorIcon style={{color: showRelevantIcon(row.UniqueID).color}} /> : "" }
                          {showRelevantIcon(row.UniqueID).icon === "CheckCircleIcon"? <CheckCircleIcon style={{color: showRelevantIcon(row.UniqueID).color}} /> : "" }
                        </IconButton>
                      </Tooltip>) : <PlaceholderIcon/> 
                       } 
                    </TableCell>
                    
                 
                  
              </TableRow>  
    )
  }
  
  const headerStyles = {
    padding: 8,
    borderBottom: '1px solid #ddd', 
    backgroundColor: '#e0e0e0',
    width: columnWidths.editable
  }

  const renderHeader = () => {

    return (
      <Grid container>
          <Grid item key="ID" style={{ ...headerStyles }}>
                <Typography><strong>ID</strong></Typography>
          </Grid>
          {csvColumnFields.map((column, index) => (
            <Grid item key={index} style={{ width: columnWidths.editable, padding: 8, fontWeight: 'bold' }}>
              <Typography>{column}</Typography>
            </Grid>
          ))}
          <Grid item key="edit" style={{ width: columnWidths.noneditable, padding: 8, fontWeight: 'bold' }}>
                <Typography>Edit</Typography>
          </Grid>
          <Grid item key="delete" style={{ width: columnWidths.noneditable, padding: 8, fontWeight: 'bold' }}>
                <Typography>Delete</Typography>
          </Grid>
          <Grid item key="lookup-status" style={{ width: columnWidths.noneditable, padding: 8, fontWeight: 'bold' }}>
                <Typography>Number Check</Typography>
          </Grid>
          <Grid item key="send-status" style={{ width: columnWidths.noneditable, padding: 8, fontWeight: 'bold' }}>
            <Button variant="outlined" onClick={handleGetStatus} >Get Message Status</Button>
          </Grid>
        </Grid>
    )

  }
      
    return (
      <Paper style={{ height: 400, width: '100%', overflow: 'auto' }}>
      <Box width="100%" borderBottom="1px solid #ddd">
        {renderHeader()}
        <List
          height={350}
          itemCount={currentDataSlice.length}
          itemSize={50}
          width="100%"
        >
          {Row}
        </List>
      </Box>
      </Paper>
    )
                
}


export default CampaignTable;
