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
import { updateCSVState } from '../../Redux/slices/csvDataSlice';
import { updateMessagingState } from '../../Redux/slices/messagingSlice';
import { updateSettingsState } from '../../Redux/slices/settingsSlice';
import { updateActionState } from '../../Redux/slices/actionSlice';
import { CSVDATA_TYPES, MESSAGING_TYPES, SETTINGS_TYPES, ACTION_TYPES } from '../../Utils/variables';
import { VARIABLES } from '../../Utils/variables';
import { chunkArray, processChunksInBatches, getMessageStatus } from '../../Utils/functions';

const in_progress_statuses = ["accepted", "queued", "sent", "sending"]
const failed_statuses = ["undelivered", "failed"]

const CampaignTable = (props) => {

  const csvData = useSelector(state => state.csvDataStructure.csvData)
  const phoneNumberColumn = useSelector(state => state.csvDataStructure.csvSelectedColumn)
  const sendResultsArray = useSelector(state => state.messagingStructure.sendResultsArray)
  const customMessage = useSelector(state => state.messagingStructure.customMessage)
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
    const chunkSize = VARIABLES.GET_STATUS_CHUNK_SIZE;
    const chunks = chunkArray(sendResultsArray, chunkSize);

    console.log(chunks)

    const processChunk = async (chunk) => {
      const data = {
        sendResultsArray: chunk.chunkData,
        startIndex: chunk.startIndex
      }
      return await getMessageStatus(data);
    }

    const results = await processChunksInBatches(chunks, processChunk, VARIABLES.BROWSER_CONCURRENCY_LIMIT);

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
    
    const endTime = new Date(); // Record end time
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


  const shouldShowIcon = (UniqueID) => {
    
    let show = false;

    /*if ((this.props.nonmobileNumbers && this.props.nonmobileNumbers.includes(UniqueID)) ||
        (this.props.invalidNumbers && this.props.invalidNumbers.includes(UniqueID))
    )
      show = true;*/
    
    if (sendResultsArray.length > 0){
      
      let index = sendResultsArray.findIndex((element) => { return element.csvRowID === UniqueID})
      console.log(index)
      if (index !== -1){
        if (sendResultsArray[index]["status"] !== "")
          show = true;
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

    /*
    if(this.props.sentWithNotify){
      title = "Message Successfuly Created - Check Status periodically for final message status. If Status does not change in a few minutes, check Twilio Logs"
      color = "grey"
      icon = "CheckCircleIcon"
      interactive = false
      return {title, color, icon, interactive, renderTitleJSX}
    }

    if (this.props.nonmobileNumbers && this.props.nonmobileNumbers.includes(UniqueID)){
      title = "We could not identify this number as a valid mobile number. Ensure you don't send SMS to non-mobile numbers"
      color = "orange"
      icon = "WarningIcon"
      interactive = false

    }
    else if (this.props.invalidNumbers && this.props.invalidNumbers.includes(UniqueID)){
      title = "This number was marked as invalid, does it have the correct number of digits?"
      color = "red"
      icon = "ErrorIcon"
      interactive = false

    } 
    */

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

    /*
    if(this.props.optOutNumbers.length > 0){
      let index = csvData.findIndex((element) => { return element.UniqueID === UniqueID})
      if(index !== -1){
        let num = csvData[index][this.props.phoneNumberColumn];
        num.startsWith("+") ? "" : num = "+" + num
        let res = this.props.optOutNumbers.findIndex((number) => {return num === number })
        if(res !== -1){
          title = "This number is in your Opt Out list, they will not receive a message"
          color = "orange"
          icon = "ErrorIcon"
          interactive = false
        }
      }
    }*/
    
    return {title, color, icon, interactive, renderTitleJSX}

  }

  const handleChangePage = (event, page) => {
    setPage(parseInt(page, 10))
  };
  
  const handleChangeRowsPerPage = (event) => {
    if(event.target.value === 'All'){
      setRowsPerPage(-1)
      setPage(0)
    }
    else{
      setRowsPerPage(parseInt(event.target.value, 10))
      setPage(0)
    }
  };

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
      <TableContainer component={Paper} style={{ maxHeight: '70vh', border: "1px solid rgba(0,0,0,0.2)", padding: 4 }}>
        <Table stickyHeader={true} sx={{ tableLayout: "auto"}} style={{"maxHeight": "20vh"}} >
          <TableHead>
            <TableRow>
              <TableCell style={{color: 'grey'}}>ID</TableCell>
              {Object.keys(csvData[0]).map((col) => (
                   <>
                   {
                     col === "UniqueID" ? "" :
                     (<TableCell 
                      key={col} 
                      style={{cursor: 'pointer'}} 
                      onClick={ () => handleColumnNameClick(col)}>{col}
                      </TableCell>)
                   }
                   
                   </>
              ))}
              <TableCell style={{color: 'grey'}}>Edit</TableCell>
              <TableCell style={{color: 'grey'}}>Delete</TableCell>
              <TableCell ><Button variant="outlined" onClick={handleGetStatus} >Get Status</Button></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>

          {(
  rowsPerPage > 0 
    ? csvData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : csvData
).map((row, i) => 
            
            (<>
            
            <TableRow
                key={`tr-${csvData[i].UniqueID}`}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                  <TableCell>
                  {csvData.findIndex((element)=> element.UniqueID === row.UniqueID)}
                  </TableCell>


                  {Object.keys(row).map((col) => (
                              <>
                
                              {
                                
                                col === "UniqueID" ? "" :
                               (<TableCell key={`tc-${csvData[i].UniqueID}`}>
                                
                               { editIdx === current + i ?
                                  (
                                    <div>
                                    <TextField
                                      name={row[col]}
                                      onChange={e => handleEditing(e, col, current + i)}
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


                { editIdx === current + i ?

                  (<TableCell  onClick={ () => stopEditing()}>
                     <Tooltip title="Stop editing">
                      <IconButton >
                        <CheckIcon />
                      </IconButton>
                    </Tooltip>   
                    </TableCell>) 

                  :

                   (<TableCell onClick={ () => startEditing(current + i)}>
                     <Tooltip title="Edit this row">
                      <IconButton >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>   
                    </TableCell>) 
                }
                 
                 <TableCell  onClick={ () => handleRemove(current + i)}>
                   <Tooltip title="Delete this row">
                    <IconButton >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>   
                  </TableCell>  



                  {shouldShowIcon(csvData[current + i].UniqueID) &&

                    (<TableCell >
                     <Tooltip
                     title={showRelevantIcon(csvData[current + i].UniqueID).renderTitleJSX ?
                        (<>
                        Error code: {sendResultsArray[current + i]["error"].errorCode}<br/>
                        {sendResultsArray[current + i]["error"].errorLink ? (<>For more information please click <a href={sendResultsArray[current + i]["error"]["errorLink"]} target="_blank">HERE</a></>) : (<>For more information please click <a href={"https://twilio.com/docs/api/errors/" + sendResultsArray[current + i]["error"].errorCode} target="_blank">HERE</a></>)}   
                        </>)
                      : showRelevantIcon(csvData[current + i].UniqueID).title} 
                     interactive={showRelevantIcon(current + i).interactive ? 1 : 0}>
                      <IconButton >
                        {showRelevantIcon(csvData[current + i].UniqueID).icon === "WarningIcon"? <WarningIcon style={{color: showRelevantIcon(csvData[current + i].UniqueID).color}} /> : "" }
                        {showRelevantIcon(csvData[current + i].UniqueID).icon === "ErrorIcon"? <ErrorIcon style={{color: showRelevantIcon(csvData[current + i].UniqueID).color}} /> : "" }
                        {showRelevantIcon(csvData[current + i].UniqueID).icon === "CheckCircleIcon"? <CheckCircleIcon style={{color: showRelevantIcon(csvData[current + i].UniqueID).color}} /> : "" }
                      </IconButton>
                    </Tooltip>   
                    </TableCell>)
                    
                  } 
                  
              </TableRow>  
          </>))}
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
