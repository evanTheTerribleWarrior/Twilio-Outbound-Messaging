import * as React from 'react';
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

const in_progress_statuses = ["accepted", "queued", "sent", "sending"]
const failed_statuses = ["undelivered", "failed"]

class CampaignTable extends React.Component{

  constructor(props) {
    super(props);
    this.state = {
      editIdx: -1,
      csvData: this.props.csvData,
      sendResultsArray: this.props.sendResultsArray,
      page: 0,
      rowsPerPage: 25,
      currentPage: 0,
      findRowNumber: 0
    }
    this.addRowClick = this.addRowClick.bind(this);
    this.startEditing = this.startEditing.bind(this);
    this.stopEditing = this.stopEditing.bind(this);
    this.handleEditing = this.handleEditing.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.handleFindRowChange = this.handleFindRowChange.bind(this);
    this.handleClickFindRow = this.handleClickFindRow.bind(this);
    this.handleMouseDownFindRow = this.handleMouseDownFindRow.bind(this);
  }

    addRowClick(){
    let cols = Object.keys(this.state.csvData[0])
    let new_row = {}
    for (let i = 0; i < cols.length; i++){    
      cols[i] === "UniqueID" ? new_row[cols[i]] = uuidv4() : new_row[cols[i]] = ""
    }
    this.state.csvData.unshift(new_row)
    this.setState({csvData: this.state.csvData})
    if(this.state.sendResultsArray.length > 0){
      let obj = {}
      obj["sid"] = ""
      obj["error"] = {}
      obj["error"]["errorCode"] = ""
      obj["error"]["errorMessage"] = ""
      obj["error"]["errorLink"] = ""
      obj["status"] = ""
      obj["UniqueID"] = new_row.UniqueID
      this.state.sendResultsArray.unshift(obj)
      obj = {}
      this.setState({sendResultsArray: this.state.sendResultsArray})
    }
    this.props.updateDataCallback(this.state.csvData, this.state.sendResultsArray)

  }
 
  changeHandler(event) {
    if (typeof this.props.onHeaderClick === 'function') {
        this.props.onHeaderClick(event);
   }
  }

  startEditing(i) {
    this.setState({ editIdx: i });
    console.log("Editing row " + i)
  };

  stopEditing() {
    this.setState({ editIdx: -1 });
    this.props.updateDataCallback(this.state.csvData, null)
  };

  handleEditing(e, name, i) {
    let value = "";
    if(name === this.props.phoneNumberColumn)
      value = e.target.value.trim().replace(/\s+/g, '')
    else value = e.target.value
    this.setState(state => ({
      csvData: state.csvData.map(
        (row, j) => (j === i ? { ...row, [name]: value } : row)
      )
    }));
  };


  handleRemove(i) {
    this.setState(state => ({
      csvData: state.csvData.filter((row, j) => j !== i),
      sendResultsArray: this.props.sendResultsArray.filter((row, j) => j !== i)
    }),() => {this.props.updateDataCallback(this.state.csvData, this.state.sendResultsArray)});
    console.log("Deleting row " + i)
 };

  getMessageStatus(){
    if (typeof this.props.getMessageStatus === 'function') {
      this.props.getMessageStatus()
    }
  }

  shouldShowIcon(UniqueID){
    
    let show = false;

    if ((this.props.nonmobileNumbers && this.props.nonmobileNumbers.includes(UniqueID)) ||
        (this.props.invalidNumbers && this.props.invalidNumbers.includes(UniqueID)) //||
        //(this.state.sendResultsArray && this.state.sendResultsArray.length > 0 && this.state.sendResultsArray[sendResultsArrayIndex]["status"] && this.state.sendResultsArray[sendResultsArrayIndex]["status"] !== "")
    )
      show = true;

    /*if(this.props.optOutNumbers.length > 0){
      let index = this.state.csvData.findIndex((element) => { return element.UniqueID === UniqueID})
      if(index > -1){
        let num = this.state.csvData[index][this.props.phoneNumberColumn];
        num.startsWith("+") ? "" : num = "+" + num
        console.log(`Num is ${num}`)
        let res = this.props.optOutNumbers.findIndex((number) => {return num === number })
        if(res > -1){
          show = true;
        }
      }
    }*/
    
    if (this.props.sendResultsArray.length > 0){
      
      let index = this.props.sendResultsArray.findIndex((element) => { return element.UniqueID === UniqueID})
      if (index !== -1){
        //console.log(`Status for ${index} message: ${this.state.sendResultsArray[index]["status"]}`)
        if (this.props.sendResultsArray[index]["status"] !== "")
          show = true;
      }

    }
    
    if(this.props.notifySwitch)
      show = true;

    return show;
  }

  showRelevantIcon(UniqueID){

    
    let title, color;
    let icon;
    let interactive = false;
    let renderTitleJSX = false;

    let index;

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

    if (this.props.sendResultsArray.length > 0){    
      index = this.props.sendResultsArray.findIndex((element) => {return element.UniqueID === UniqueID})
    }

    if (this.props.sendResultsArray && this.props.sendResultsArray.length > 0 && index !== -1 && (this.props.sendResultsArray[index]["status"] === "delivered" || this.props.sendResultsArray[index]["status"] === "read")){
      title = "Message marked as Delivered - It will be excluded from further 'Send Messages' actions"
      color = "green"
      icon = "CheckCircleIcon"
      interactive = false
    }

    else if (this.props.sendResultsArray && this.props.sendResultsArray.length > 0 && index !== -1 && failed_statuses.includes(this.props.sendResultsArray[index]["status"])){
      
      color = "red"
      icon = "ErrorIcon"
      interactive = true
      renderTitleJSX = true
    }

    else if (this.props.sendResultsArray && this.props.sendResultsArray.length > 0 && index !== -1 && in_progress_statuses.includes(this.props.sendResultsArray[index]["status"])){
      
      title = "Message Successfuly Created - Check Status periodically for final message status. If Status does not change in a few minutes, check Twilio Logs"
      color = "grey"
      icon = "CheckCircleIcon"
      interactive = false
    }

    if(this.props.optOutNumbers.length > 0){
      let index = this.state.csvData.findIndex((element) => { return element.UniqueID === UniqueID})
      if(index !== -1){
        let num = this.state.csvData[index][this.props.phoneNumberColumn];
        num.startsWith("+") ? "" : num = "+" + num
        let res = this.props.optOutNumbers.findIndex((number) => {return num === number })
        if(res !== -1){
          title = "This number is in your Opt Out list, they will not receive a message"
          color = "orange"
          icon = "ErrorIcon"
          interactive = false
        }
      }
    }

    

    return {title, color, icon, interactive, renderTitleJSX}

  }

  handleChangePage(event, page) {
    this.setState({ page: parseInt(page, 10)});
  };
  
  handleChangeRowsPerPage(event) {
    if(event.target.value === 'All'){
      this.setState({rowsPerPage: -1})
      this.setState({page: 0})
    }
    else{
      this.setState({rowsPerPage: parseInt(event.target.value, 10)});
      this.setState({page: 0});
    }
  };

  handleFindRowChange(event){
    this.setState({findRowNumber: event.target.value})
  }

  handleMouseDownFindRow(event){
    event.preventDefault();
  }

  handleClickFindRow(rowNumber){
    if(rowNumber < 0){
      rowNumber = 0;
    }
    else if (rowNumber > this.state.csvData.length){
      rowNumber = this.state.csvData.length
    }
    this.setState({page: Math.floor(rowNumber/this.state.rowsPerPage)})
  }

  updateState(){
    this.setState((state, props) => ({
      csvData: this.props.csvData
    }));
    this.props.updateFlag()
  }
  
  render() {
    if(this.props.dataUpdated){

      this.updateState()
      
    }
    var data = this.state.csvData;
    var editIdx = this.state.editIdx;
    let page = this.state.page
    let rowsPerPage = this.state.rowsPerPage;
    let current = page * rowsPerPage;

    return (
      <>
      <Typography variant="h5" component="h1" gutterBottom>
        User Data
      </Typography>

      
      <Stack direction="row" spacing={2}>
        <Button variant="outlined" startIcon={<AddIcon />} onClick = {() => this.addRowClick()}>Add Row</Button>
        <FormControl sx={{ m: 1, width: '20ch' }} variant="outlined">
            <InputLabel htmlFor="outlined-adornment-find">Find Row</InputLabel>
            <OutlinedInput
              id="outlined-adornment-find-row"
              type={'number'}
              value={this.state.findRowNumber}
              onChange={e => this.handleFindRowChange(e)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="find row"
                    onClick={() => this.handleClickFindRow(this.state.findRowNumber)}
                    onMouseDown={(e) => this.handleMouseDownFindRow(e)}
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
              {Object.keys(data[0]).map((col) => (
                   <>
                   {
                     col === "UniqueID" ? "" :
                     (<TableCell 
                      key={col} 
                      style={{cursor: 'pointer'}} 
                      onClick={ () => this.changeHandler(col)}>{col}
                      </TableCell>)
                   }
                   
                   </>
              ))}
              <TableCell style={{color: 'grey'}}>Edit</TableCell>
              <TableCell style={{color: 'grey'}}>Delete</TableCell>
              <TableCell ><Button variant="outlined" disabled={!this.props.firstTimeSend} onClick = {() => this.getMessageStatus()} >Get Status</Button></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>

          {(
  rowsPerPage > 0 
    ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : data
).map((row, i) => 
            
            (<>
            
            <TableRow
                key={`tr-${data[i].UniqueID}`}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                  <TableCell>
                  {this.state.csvData.findIndex((element)=> element.UniqueID === row.UniqueID)}
                  </TableCell>


                  {Object.keys(row).map((col) => (
                              <>
                
                              {
                                
                                col === "UniqueID" ? "" :
                               (<TableCell key={`tc-${data[i].UniqueID}`}>
                                
                               { editIdx === current + i ?
                                  (
                                    <div>
                                    <TextField
                                      name={row[col]}
                                      onChange={e => this.handleEditing(e, col, current + i)}
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

                  (<TableCell  onClick={ () => this.stopEditing()}>
                     <Tooltip title="Stop editing">
                      <IconButton >
                        <CheckIcon />
                      </IconButton>
                    </Tooltip>   
                    </TableCell>) 

                  :

                   (<TableCell onClick={ () => this.startEditing(current + i)}>
                     <Tooltip title="Edit this row">
                      <IconButton >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>   
                    </TableCell>) 
                }
                 
                 <TableCell  onClick={ () => this.handleRemove(current + i)}>
                   <Tooltip title="Delete this row">
                    <IconButton >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>   
                  </TableCell>  



                  {this.shouldShowIcon(this.state.csvData[current + i].UniqueID) ?

                    (<TableCell >
                     <Tooltip
                     title={this.showRelevantIcon(this.state.csvData[current + i].UniqueID).renderTitleJSX ?
                        (<>
                        Error code: {this.props.sendResultsArray[current + i]["error"].errorCode}<br/>
                        {this.props.sendResultsArray[current + i]["error"].errorLink ? (<>For more information please click <a href={this.props.sendResultsArray[current + i]["error"]["errorLink"]} target="_blank">HERE</a></>) : (<>For more information please click <a href={"https://twilio.com/docs/api/errors/" + this.props.sendResultsArray[current + i]["error"].errorCode} target="_blank">HERE</a></>)}   
                        </>)
                      : this.showRelevantIcon(this.state.csvData[current + i].UniqueID).title} 
                     interactive={this.showRelevantIcon(current + i).interactive ? 1 : 0}>
                      <IconButton >
                        {this.showRelevantIcon(this.state.csvData[current + i].UniqueID).icon === "WarningIcon"? <WarningIcon style={{color: this.showRelevantIcon(this.state.csvData[current + i].UniqueID).color}} /> : "" }
                        {this.showRelevantIcon(this.state.csvData[current + i].UniqueID).icon === "ErrorIcon"? <ErrorIcon style={{color: this.showRelevantIcon(this.state.csvData[current + i].UniqueID).color}} /> : "" }
                        {this.showRelevantIcon(this.state.csvData[current + i].UniqueID).icon === "CheckCircleIcon"? <CheckCircleIcon style={{color: this.showRelevantIcon(this.state.csvData[current + i].UniqueID).color}} /> : "" }
                      </IconButton>
                    </Tooltip>   
                    </TableCell>)
                    :
                    (<></>)
                  } 
                  
              </TableRow>  
          </>))}
          </TableBody>
          <TableFooter>
    <TableRow>
      <TablePagination
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(e,p) => this.handleChangePage(e,p)}
        onRowsPerPageChange={(e) => this.handleChangeRowsPerPage(e)}
        rowsPerPageOptions={[10, 25, 50, 100]}
      />
    </TableRow>
  </TableFooter>
        </Table>
                </TableContainer>
      </>
   
                )
  }
}

export default CampaignTable;
