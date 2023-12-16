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
import { updateCSVState } from '../../Redux/slices/csvDataSlice';
import { updateMessagingState } from '../../Redux/slices/messagingSlice';
import { updateSettingsState } from '../../Redux/slices/settingsSlice';
import { updateActionState } from '../../Redux/slices/actionSlice';
import { CSVDATA_TYPES, MESSAGING_TYPES, SETTINGS_TYPES, ACTION_TYPES } from '../../Utils/variables';
import { chunkArray, processChunksInBatches, getMessageStatus } from '../../Utils/functions';
import { expbackoff } from '../../exponential-backoff';

const in_progress_statuses = ["accepted", "queued", "sent", "sending", "scheduled"]
const failed_statuses = ["undelivered", "failed"]
const PlaceholderIcon = () => <HourglassEmptyIcon color="action" />;

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
  const [editRow, setEditRow] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [findRowNumber, setFindRowNumber] = useState(0);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setCurrent(page * rowsPerPage);
  }, [page, rowsPerPage]);

  const updateProgressBar = (newValue, totalData) => {
    return dispatch(updateActionState({
      type: ACTION_TYPES.PROGRESS_BAR_COUNT,
      value: {
        newValue: newValue,
        totalData: totalData
      }
    }))
  }

  const handleGetStatus = async () => {

    updateProgressBar(0, csvData.length)

    const startTime = new Date();
    const chunkSize = limits.getStatusChunkSize;
    const chunks = chunkArray(sendResultsArray, chunkSize);

    const processChunk = async (chunk) => {
      let shouldCheckStatus = false;

      for (let i = 0; i < chunk.chunkData.length; i++) {
        if(chunk.chunkData[i].messageSid.length > 0){
          shouldCheckStatus = true;
          break;
        }
      }

      if(shouldCheckStatus){
        const data = {
          sendResultsArray: chunk.chunkData,
          startIndex: chunk.startIndex
        }
        updateProgressBar(limits.getStatusChunkSize, csvData.length)
        return expbackoff(async () => {
          return getMessageStatus(data);
        })
      }
      else {
        updateProgressBar(limits.getStatusChunkSize, csvData.length)
        return ;
      }
      
    }

    const results = await processChunksInBatches(chunks, processChunk, limits.browserConcurrency);

    results.forEach((r,index) => {
      if (r.status === 'fulfilled' && r.value) {
        dispatch(updateMessagingState({
          type: MESSAGING_TYPES.UPDATE_STATUS_CHUNK,
          value: r.value.getStatusArray
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
    dispatch(updateCSVState({
      type: CSVDATA_TYPES.ADD_ROW,
      value: new_row
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
      dispatch(updateMessagingState({
        type: MESSAGING_TYPES.ADD_ROW,
        value: obj
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
 
  const startEditing = (i, row) => {
    setEditIdx(i);
    setEditRow(row)
  };

  const stopEditing = () => {
    dispatch(updateCSVState({
      type: CSVDATA_TYPES.UPDATE_ROW,
      value: editRow
    }));
    setEditIdx(-1);
  };

  const handleEditing = (e, name) => {
    const value = name === phoneNumberColumn
      ? e.target.value.trim().replace(/\s+/g, '')
      : e.target.value;
  
    setEditRow(prevRow => ({
      ...prevRow,
      [name]: value
    }));
  };


  const handleRemove = (i) => {
    dispatch(updateCSVState({
      type: CSVDATA_TYPES.DELETE_ROW,
      value: i
    }));

    dispatch(updateMessagingState({
      type: MESSAGING_TYPES.DELETE_ROW,
      value: i
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
      
      if(sendResultsArray[index]["status"] === "scheduled"){
        title = "Message Successfully Scheduled - Check Status once the schedule time has elapsed"
      }
      else{
        title = "Message Successfuly Created - Check Status periodically for final message status. If Status does not change in a few minutes, check Twilio Logs"
      }
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


  const renderRow = (row, index) => {

    const currentRowIndex = current + index;

    return (
      <TableRow 
                key={`tr-${row.UniqueID}`}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
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
                                      onChange={e => handleEditing(e, col, currentRowIndex, row)}
                                      value={editRow[col] || row[col]}
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

                   (<TableCell onClick={ () => startEditing(currentRowIndex, row)} style={{ width: '100px' }}>
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
  

  const renderHeader = () => {

    return (
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
        
          {renderHeader()}
        <TableBody>
        
        {(csvData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)).map((row, index) => 
            <>{renderRow(row,index)}</>
        )}
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