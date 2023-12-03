
import React, { useState } from "react";

import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Select from '@mui/material/Select';
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import CircularProgress from '@mui/material/CircularProgress';

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";

import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';



import CampaignTable from './Components/CampaignTable/MyTable';
import Settings from './Components/Settings/Settings';
import Logs from './Components/Logs/Logs';
import WhatsappOptions from './Components/MessageBuilder/TemplateOptions/TemplateOptions';
import Authentication from './Components/Authentication/Authentication';
import FileLoader from './Components/FileLoader/FileLoader';
import ChannelSelection from './Components/ChannelSelection/ChannelSelection';
import NumberColumnSelection from './Components/NumberColumnSelection/NumberColumnSelection';
import ContentTemplateRenderer from "./Components/ContentTemplateRenderer/ContentTemplateRenderer";
import MessageScheduler from "./Components/MessageBuilder/MessageScheduler/MessageScheduler";
import AppBar from "./Components/MainAppBar/MainAppBar";

import './config';
import {expbackoff} from './exponential-backoff'
import { valueToPercent } from "@mui/material";


class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      msg: "",
      isAuthenticated: false,
      token: "",
      submitting: false,
      error: false,
      errorMsg: "",
      smsSent: 0,
      smsErrors: 0,
      checkedSuccess: 0,
      formatErrors: 0,
      nonmobileNumbers: [],
      nonmobileNumbers_ID: [],
      invalidNumbers: [],
      invalidNumbers_ID: [],
      firstTimeSend: false,
      sendResultsArray: [],
      services_array: [],
      emptyNumbersArray: [],
      optOutNumbers: [],
      optOutNumbers_ID: [],
      invalidNumbersCheck: false,
      checkCompleted: false,
      sendCompleted: false,
      getServicesCompleted: false,
      sender: "",
      mediaURL: "",
      optOutURL: "",
      csvData: undefined,
      radioSelection: "SMS",
      carrierSwitch: false,
      msgServiceSwitch: false,  
      selectedService: "",
      selectedTemplate: "",
      showServicesLoadingIcon: false,
      showCheckLoadingIcon: false,
      showSendLoadingIcon: false,
      showStatusLoadingIcon: false,
      logs: "",
      extraRowsAdded: false,
      tempCheckIndex: 0,
      enableGraph: false,
      notifySwitch: false,
      sentWithNotify: false,
      showNotifyLoadingIcon: false,
      showNotifyTemplateWarning: false,
      mediaSwitch: false,
      optOutSwitch: false,
      check_https: false,
      check_https_opt: false,
      dataUpdated: false,
      columnFields: [],
      selectedColumn: "",
      optOutMessage: "",
      twilioOptOutExists: false,
      skipChecked: false,
      template: null,
      sendASAP: true,
      sendDate: null
      
    };
    this.onMsgChange = this.onMsgChange.bind(this);
    this.handleAuthSuccessCallback = this.handleAuthSuccessCallback.bind(this)
    this.handleFileLoadingCallback = this.handleFileLoadingCallback.bind(this)
    this.onSenderChange = this.onSenderChange.bind(this);
    this.onRadioChange = this.onRadioChange.bind(this);
    this.sendMsg = this.sendMsg.bind(this);
    this.checkNumbers = this.checkNumbers.bind(this);
    this.onHeaderClick = this.onHeaderClick.bind(this);
    this.handleCarrierSwitch = this.handleCarrierSwitch.bind(this);
    this.handleMsgServiceSwitch = this.handleMsgServiceSwitch.bind(this);
    this.loadMessagingServices = this.loadMessagingServices.bind(this);
    this.handleSelectService = this.handleSelectService.bind(this);
    this.updateLogs = this.updateLogs.bind(this);
    this.checkEmptyNumbers = this.checkEmptyNumbers.bind(this);
    this.getMessageStatus = this.getMessageStatus.bind(this);
    this.updateMsgCallback = this.updateMsgCallback.bind(this);
    this.updateDataCallback = this.updateDataCallback.bind(this);
    this.updateChannelSelectionCallback = this.updateChannelSelectionCallback.bind(this);
    this.createPromises = this.createPromises.bind(this);
    this.calculatePromiseGroups = this.calculatePromiseGroups.bind(this)
    this.getSinglePromise = this.getSinglePromise.bind(this)
    this.preparePromiseData = this.preparePromiseData.bind(this)

    this.checkMessageBeforeSending = this.checkMessageBeforeSending.bind(this)
    this.sendWithNotify = this.sendWithNotify.bind(this)
    this.updateSettingsCallback = this.updateSettingsCallback.bind(this)
    this.onMediaURLChange = this.onMediaURLChange.bind(this)
    this.onOptOutURLChange = this.onOptOutURLChange.bind(this)
    this.updateFlag = this.updateFlag.bind(this);

    this.isValidUrl = this.isValidUrl.bind(this);
    this.updateSelectedColumn = this.updateSelectedColumn.bind(this);

    this.getOptOutList = this.getOptOutList.bind(this);

    this.skipCheckBoxChange = this.skipCheckBoxChange.bind(this)

    this.checkOptOut = this.checkOptOut.bind(this)

    this.handleOnSchedule = this.handleOnSchedule.bind(this)
  }

  updateFlag(){
    this.setState({dataUpdated: false})
  }

  updateSettingsCallback = (carrierSwitch, msgServiceSwitch, notifySwitch, mediaSwitch, optOutSwitch) => {
    this.setState({carrierSwitch: carrierSwitch, msgServiceSwitch: msgServiceSwitch, notifySwitch: notifySwitch, mediaSwitch: mediaSwitch, optOutSwitch: optOutSwitch}, () =>{

      if(this.state.msgServiceSwitch || this.state.notifySwitch){
        this.loadMessagingServices()
      }
      else{
        this.setState({getServicesCompleted: false, services_array: [], selectedService: ""})
      }
    })
  }

  handleAuthSuccessCallback = (token) => {
    let auth_header = `Bearer ${token}`
    this.setState({isAuthenticated: true, auth_header: auth_header})

  }

  handleFileLoadingCallback = (csvParsed, sendCompleted, checkCompleted, error, columnFields) => {
    console.log(`Column Fields: ${columnFields}`);
    this.setState({sendCompleted: sendCompleted, checkCompleted: checkCompleted, error: error, csvParsed: csvParsed, columnFields: columnFields})
  }


  updateMsgCallback = (template) => {
    console.log(template)
    this.setState({msg: template, template: template})
  }

  updateDataCallback = (csvData, sendResultsArray) => {
    if(csvData)
      this.setState({csvData: csvData, dataUpdated: true})
    if(sendResultsArray){
      this.setState({sendResultsArray: sendResultsArray})
    }
   
  }

  updateChannelSelectionCallback = (radioSelection) => {
    this.setState({radioSelection: radioSelection})
  }

  updateSelectedColumn = (column) => {
    console.log(`Selected column: ${column}`)
    this.setState({selectedColumn: column})
  }


 
  checkEmptyNumbers = () => {
    

    for(let i = 0; i < this.state.csvData.length; i++){
      if(this.state.csvData[i][this.state.selectedColumn].length === 0){
        this.setState({emptyNumbersArray: this.state.emptyNumbersArray.push(i)})
      }
    }
    if(this.state.emptyNumbersArray.length > 0){
      this.setState({logs: this.updateLogs("emptyNumbersError")});
      this.setState({emptyNumbersArray: []})
      return true;
    }
    else {
      return false;
    }
  }

  updateLogs = (source) => {
    let date = new Date(Date.now());
    date.setUTCSeconds(0);
    let checkLog = ""
    checkLog = `Date: ${date.toString()}`
    let arr = []

    if(source === "check"){
      checkLog += `\nAction: Checked Number Format`
      checkLog += "\nTotal numbers having valid format: " + this.state.checkedSuccess
      this.state.invalidNumbers_ID.length > 0 ? checkLog += "\n!!! Total invalid numbers found: " + this.state.invalidNumbers_ID.length + " ==> Check rows: " + JSON.stringify(this.state.invalidNumbers_ID) + "\n==> Please fix these errors to be able to send messages" : checkLog += "\nNo invalid numbers found"
      if(this.state.carrierSwitch){
        checkLog += "\nAction: Checked Carrier Type"     
        this.state.nonmobileNumbers_ID.length > 0 ? checkLog += "\n!!! Total non-mobile numbers found: " + this.state.nonmobileNumbers_ID.length + " ==> Check rows: " + JSON.stringify(this.state.nonmobileNumbers_ID) : checkLog += "\nNo non-mobile numbers found"      
      }
      if(this.state.optOutNumbers_ID.length > 0){
        checkLog += "\nAction: Checked Opt Out numbers" 
        checkLog += "\n!!! Total opt-out numbers found: " + this.state.optOutNumbers_ID.length + " ==> Check rows: " + JSON.stringify(this.state.optOutNumbers_ID)
      }
      
    }
    else if(source === "checkError"){
      checkLog += `\nAction: Checked Numbers`
      checkLog += `\n!!! Error: ${this.state.errorMsg}`
    }

    else if(source === "sendError"){
      checkLog += `\nAction: Send Messages`
      checkLog += `\n!!! Error: ${this.state.errorMsg}`
    }

    else if(source === "send"){
      checkLog += `\nAction: Send Messages`
      checkLog += `\nNumber of messages created successfully: ${this.state.smsSent}`
      if(this.state.sendResultsArray.length > 0){
        this.state.sendResultsArray.forEach((message,index) => {
          if (message.status === "undelivered" || message.status === "failed")
            arr.push(index)
        })
      }
      arr.length > 0 || this.state.smsErrors > 0 ? checkLog += `\n!!! Total numbers sent with errors: ${this.state.smsErrors} ==> Check rows: ${JSON.stringify(arr)}` : checkLog += "\nNo errored messages found"
      checkLog += `\nPLEASE CLICK ON 'CHECK STATUS' FOR FINAL STATUS OF SENT MESSAGES AND TO REFRESH THE GRAPHS`
    }

    else if(source=== "emptyNumbersError"){
      checkLog += `\n!!! Error: Numbers can't be empty ==> Check rows: ${JSON.stringify(this.state.emptyNumbersArray)}`
    }

    else if(source=== "getMessageStatus"){
      checkLog += '\nCurrent Messages Status:';
      let delivered = []
      let failed = []
      let in_progress = []
      let read = []
      for(let i = 0; i < this.state.sendResultsArray.length; i++){
        if(this.state.sendResultsArray[i].status === "delivered")delivered.push(i)
        else if (this.state.sendResultsArray[i].status === "read")read.push(i)
        else if(this.state.sendResultsArray[i].status === "undelivered")failed.push(i)
        else if(this.state.sendResultsArray[i].status === "failed")failed.push(i)
        else in_progress.push(i)
      }
      checkLog += "\n===> Delivered: " + JSON.stringify(delivered)
      if(this.state.radioSelection === "Whatsapp")checkLog += "\n===> Read: " + JSON.stringify(read)
      checkLog += "\n===> Failed/Undelivered: " + JSON.stringify(failed)
      checkLog += "\n===> In-Progress: " + JSON.stringify(in_progress)

    }
    else if (source === "send-notify"){
      checkLog += `\nAction: Sent with Notify\nPLEASE CLICK ON 'CHECK STATUS' FOR FINAL STATUS OF SENT MESSAGES AND TO REFRESH THE GRAPHS`
    }

    return this.state.logs ? checkLog + "\n\n" + this.state.logs : checkLog
    
  }


  handleCarrierSwitch = (carrierSwitchFromChild) => {
    this.setState({carrierSwitch: carrierSwitchFromChild})
  }

  handleSelectService = (event) => {
    this.setState({selectedService: event.target.value})
  }


  handleMsgServiceSwitch = (msgServiceSwitchFromChild) => {
    this.setState({msgServiceSwitch: msgServiceSwitchFromChild})
    if(!this.state.msgServiceSwitch){
      this.loadMessagingServices()
    }
    else{
      this.setState({getServicesCompleted: false, services_array: [], selectedService: ""})
    }
  }

  loadMessagingServices(){

    this.setState({ submitting: true, getServicesCompleted: false, error: false, showServicesLoadingIcon: true });
    fetch(`${global.config.url}get-services`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.state.auth_header
      }
    })
      .then((res) => res.json())
      .then((data) => {

        this.setState({
          submitting: false,
          showServicesLoadingIcon: false,
          getServicesCompleted: true,
          services_array: data.data.services_array
        });
      })
      .catch((error) => {
        console.log(error);
        this.setState({ submitting: false, error: true, errorMsg: error, showSendLoadingIcon: false });
      });
  }

  onMsgChange(event) {
    this.setState({
      msg: event.target.value,
    });
  }

  onSenderChange(event) {
    let sender = event.target.value
    this.setState({
      sender: sender,
    });
  }

  onMediaURLChange(event) {
    let mediaURL = event.target.value
    let check_https = this.isValidUrl(mediaURL)
    this.setState({
      mediaURL: mediaURL,
      check_https: check_https
    });
  }

  onOptOutURLChange(event) {
    let optOutURL = event.target.value
    let check_https = this.isValidUrl(optOutURL)
    this.setState({
      optOutURL: optOutURL,
      check_https_opt: check_https
    });
  }


  isValidUrl(mediaURL){
    let url;
    try {
      url = new URL(mediaURL);
      console.log(url)
    } catch (e) { return false; }
    return /https/.test(url.protocol);
  }


  onRadioChange(event){
    this.setState({
      radioSelection: event.target.value
    })
  }

  onHeaderClick(event){
    this.setState({
      msg: this.state.msg+ '{{' + event + '}}',
    });
  }

  skipCheckBoxChange(){
    this.setState({skipChecked: !this.state.skipChecked})
  }

  /*
  *
  *  Building Promises
  * 
  */

  calculatePromiseGroups(service){
    let divider = service === "notify" ? global.config.notify_divider : global.config.divider
    let pr_groups = Math.ceil(this.state.csvData.length/divider)
    let start, end;
    let groups = []

    for(let i = 0; i < pr_groups; i++){
      start = i * divider
      end = (i * divider + divider > this.state.csvData.length ? (i * divider) + (this.state.csvData.length - (i * divider))  : (i * divider) + divider)
      groups.push({"start": start, "end": end})
    }

    return groups;
  }

  async getSinglePromise(data, action){
    return await expbackoff(async () => {return fetch(`${global.config.url}${action}`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.state.auth_header
      },
      body: JSON.stringify(data),
      }).then(response => {return response.json()})})
  }

  preparePromiseData(groups, action, extraSendData){
    let start, end;
    let promises = []
    let data = {}
    for(let i = 0; i < groups.length; i++){
      
      start = groups[i].start
      end = groups[i].end

      if(action === "check-numbers"){
          data = {
          'csvData': this.state.csvData.slice(start, end),
          'selectedPhoneNumberColumn': this.state.selectedColumn,
          'radioSelection': this.state.radioSelection,
          'carrierSwitch': this.state.carrierSwitch,
          'start': start
          }
      }
      else if (action === "get-message-status"){
          data = {
            'sendResultsArray':this.state.sendResultsArray.slice(start,end)
          }
      }
      else if (action === "send" && extraSendData){

        data = {
          //'textmsg':this.state.msg,
          'template': this.state.template,
          'mediaURL': this.state.mediaURL,
          'sender': extraSendData.sender,
          'csvData':this.state.csvData.slice(start, end),
          'selectedPhoneNumberColumn': this.state.selectedColumn,
          'channel':this.state.radioSelection,
          'isMsgService': extraSendData.isMsgService,
          'sendResultsArray': this.state.sendResultsArray.slice(start, end),
          'start': start,
          'optOutSwitch': this.state.optOutSwitch,
          'optOutNumbers': (this.state.twilioOptOutExists ? this.state.optOutNumbers : []),
          'sendDate': this.state.sendDate,
          'sendASAP': this.state.sendASAP
        }
      }
      else if(action === "send-notify" && extraSendData){
        data = {
          'textmsg':this.state.msg,
          'notifyServiceSid': extraSendData.notifyServiceSid,
          'csvData':this.state.csvData.slice(start, end),
          'channel':this.state.radioSelection,
          //'sendResultsArray': this.state.sendResultsArray.slice(start, end),
          'start': start,
        }
      }

      promises.push(this.getSinglePromise(data, action))
    }
    return promises;
  }

  createPromises(action, extraSendData, service){

    let groups = this.calculatePromiseGroups(service)
    console.log(`Groups: ${JSON.stringify(groups)}`)
    return this.preparePromiseData(groups, action, extraSendData)

  }

/*
*
* End of creating promises
*
*
*/

  checkOptOut = (event) => {
    event.preventDefault()
    if(!this.twilioOptOutExists){
      this.checkNumbers()
    }
    else
      this.getOptOutList()
  }

  getOptOutList = () => {
    fetch(`${global.config.url}get-optout-list`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': this.state.auth_header
      }
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(`Checked optout list: ${JSON.stringify(data)}`)

        if(data.data.optOutNumbers.length > 0){
          this.setState({}, () => {
            this.setState({
              twilioOptOutExists: true,
              optOutNumbers: data.data.optOutNumbers
            })   
          })
          this.checkNumbers()
        }
      })
      .catch((error) => {
        console.log(error);
        this.checkNumbers()
      });
  }

  checkNumbers(){

    if(this.checkEmptyNumbers())return;
    
    console.log(`Opt out list length: ${this.state.optOutNumbers.length}`)

    this.setState({ submitting: true, checkCompleted: false, error: false, showCheckLoadingIcon: true });

    let checkedSuccess = 0;
    let nonmobileNumbers_ID = []
    let invalidNumbers_ID = []
    let nonmobileNumbers = []
    let invalidNumbers = []

    let promises = []
    promises = this.createPromises("check-numbers")

    Promise.allSettled(promises).then((result) => {

      for (const [index, r] of result.entries()) {
  
        console.log(r)
        if (r.status === "rejected") {
          console.log(`Promise no ${index} rejected with reason: ${r.reason}`)
        }
        else if (r.status === "fulfilled") {
          
          console.log(`Promise no ${index} checked numbers: ${r.value.data.checkedSuccess}`)
          checkedSuccess += r.value.data.checkedSuccess;
          invalidNumbers_ID = invalidNumbers_ID.concat(r.value.data.invalidNumbers_ID)
          nonmobileNumbers_ID = nonmobileNumbers_ID.concat(r.value.data.nonmobileNumbers_ID)
          invalidNumbers = invalidNumbers.concat(r.value.data.invalidNumbers)
          nonmobileNumbers = nonmobileNumbers.concat(r.value.data.nonmobileNumbers)

        }    
      }
      
      console.log(`Results to be submitted:\nChecked Success:${checkedSuccess}
      \nNon Mobile Numbers ID: ${JSON.stringify(nonmobileNumbers_ID)}
      \nNon mobile Numbers UniqueID: ${JSON.stringify(nonmobileNumbers)}
      \nInvalid Numbers ID: ${JSON.stringify(invalidNumbers_ID)}
      \nInvalid Numbers UniqueID: ${JSON.stringify(invalidNumbers)}
      `)
      this.setState({
        submitting: false,
        checkedSuccess: checkedSuccess,
        nonmobileNumbers_ID: nonmobileNumbers_ID,
        invalidNumbers_ID: invalidNumbers_ID,
        nonmobileNumbers: nonmobileNumbers,
        invalidNumbers: invalidNumbers,
        invalidNumbersCheck: true,
        checkCompleted: true,
        showCheckLoadingIcon: false,
        tempCheckIndex: 0
      });
      this.setState({logs: this.updateLogs("check")})
      console.log("done");
    })
    
  }



  checkMessageBeforeSending = () => {

    var re = new RegExp('\{{[^)]*\}}');
      if(re.test(this.state.msg) && this.state.notifySwitch){
        this.setState({showNotifyTemplateWarning: true})
      }
      else{
        this.setState({showNotifyTemplateWarning: false})
        this.state.notifySwitch ? this.sendWithNotify() : this.sendMsg()
      }
  }

  async sendWithNotify() {
    
    this.setState({ submitting: true, sendCompleted: false, error: false, showSendLoadingIcon: true, firstTimeSend: true, sentWithNotify: false});
    
    let checkNotifyService = await this.getSinglePromise({selectedService: this.state.selectedService}, "create-notify-service")
    let notifyServiceSid = checkNotifyService.data.notifyServiceSid

    let promises = []
    promises = this.createPromises("send-notify", {notifyServiceSid: notifyServiceSid}, "notify")

    Promise.allSettled(promises).then((result) => {

      for (const [index, r] of result.entries()) {
  
        if (r.status === "rejected") {
          console.log(`Promise no ${index} rejected with reason: ${r.reason}`)
          //this.getSinglePromise(data, "send").then(result => console.log("Result of promise: " + result))
        }
        else if (r.status === "fulfilled") {
  
          console.log(`Promise no ${index} success`)

        }    
      }
      
      this.setState({
        submitting: false,
        sendCompleted: true,
        showSendLoadingIcon: false,
        enableGraph: true,
        sentWithNotify: true
      });
      this.setState({logs: this.updateLogs("send-notify")})
      console.log("done");
    })


  }

  sendMsg() {

    if(this.checkEmptyNumbers())return;

    this.getOptOutList()

    console.log(`Opt out list length: ${this.state.optOutNumbers.length}`)
    
    this.setState({ submitting: true, sendCompleted: false, error: false, showSendLoadingIcon: true, firstTimeSend: true});

    let sender = this.state.selectedService !== "" ? this.state.selectedService : this.state.sender
    let isMsgService = this.state.selectedService !== "" ? true : false

    let sendResultsArray = []
    let smsSent = 0
    let smsErrors = 0

    let promises = []
    promises = this.createPromises("send", {sender: sender, isMsgService: isMsgService})

    Promise.allSettled(promises).then((result) => {

      for (const [index, r] of result.entries()) {
  
        if (r.status === "rejected") {
          console.log(`Promise no ${index} rejected with reason: ${r.reason}`)
          this.getSinglePromise(data, "send").then(result => console.log("Result of promise: " + result))
        }
        else if (r.status === "fulfilled") {
  
          console.log(`Promise no ${index} success: ${r.value.data.sentSuccess}`)
          console.log(`Promise no ${index} errors: ${r.value.data.sentErrors}`)
          smsSent += r.value.data.sentSuccess;
          smsErrors += r.value.data.sentErrors;
          sendResultsArray = sendResultsArray.concat(r.value.data.sendResultsArray)

        }    
      }
      
      console.log(`Sends:\nSent successfully:${smsSent}
      \nSent with errors: ${smsErrors}
      \nSend Results Size: ${sendResultsArray.length}
      `)
      this.setState({
        submitting: false,
        smsSent: smsSent,
        smsErrors: smsErrors,
        sendCompleted: true,
        showSendLoadingIcon: false,
        sendResultsArray: sendResultsArray,
        enableGraph: true
      
      });
      this.setState({logs: this.updateLogs("send")})
      console.log("done");
    })
  }

  getMessageStatus = async () => {

    this.setState({ submitting: true, error: false, showStatusLoadingIcon: true });
    
    let sendResultsArray = [];
    

    if(this.state.notifySwitch){
      let response = await this.getSinglePromise({}, "get-sync-data")

      console.log(`Before notify data: ${JSON.stringify(this.state.sendResultsArray)}`)
      console.log(`Before notify data: ${JSON.stringify(response.data)}`)
      let updatedResultsArray = []
      updatedResultsArray= this.state.sendResultsArray.map((item) => { 
        
        for(let i = 0 ; i < response.data.length; i++){
          for (const [key, value] of Object.entries(response.data[i])) {
            if(key === item.UniqueID){
              console.log("Found common key: " + item.UniqueID)
              item.sid = value
              return item;
            }
          }
        }
   
      })

      console.log(`After notify data: ${JSON.stringify(updatedResultsArray)}`)

      this.setState({sendResultsArray: updatedResultsArray})
      

    }

    let promises = this.createPromises("get-message-status")

    Promise.allSettled(promises).then((result) => {

      for (const [index, r] of result.entries()) {
  
        console.log(r)
        if (r.status === "rejected") {
          console.log(r.reason)
        }
        else if (r.status === "fulfilled") {
          sendResultsArray = sendResultsArray.concat(r.value.data.sendResultsArray)
        }    
      }
      
      this.setState({
        submitting: false,
        sendResultsArray: sendResultsArray,
        showStatusLoadingIcon: false,
        sentWithNotify: false
      });
      this.setState({logs: this.updateLogs("getMessageStatus")})
      console.log("done");
    })

  }

  handleOnSchedule = (date, sendASAP) => {
    this.setState({sendDate: date, sendASAP: sendASAP})
    console.log(`date is ${date} and send asap is ${sendASAP}`)
  }

  render() {
    return (

      <Container style={{
        minWidth: "100%",
        height: "100vh",
      }}>
        <AppBar></AppBar>
      <Box sx={{ my: 4 }}>
        <Box sx={{ p: 1 }}></Box>
        <Grid container spacing={3}>
          <Grid item xs={4}>
            <FormControl fullWidth className="mb-3">

              <Authentication
              handleAuthSuccessCallback={this.handleAuthSuccessCallback}
              />
              
              <FileLoader
              handleFileLoadingCallback={this.handleFileLoadingCallback}
              isAuthenticated={this.state.isAuthenticated}
              sendResultsArray={this.state.sendResultsArray}
              updateDataCallback={this.updateDataCallback}
              csvData={this.state.csvData}
              />

              {this.state.columnFields.length > 0 ?
              
              (<NumberColumnSelection
                columnFields={this.state.columnFields}
                updateSelectedColumn={this.updateSelectedColumn}
              />): ""
              }
              
              <ChannelSelection
              updateChannelSelectionCallback={this.updateChannelSelectionCallback}
              isAuthenticated={this.state.isAuthenticated}
              />

             <FormControl fullWidth component="fieldset" margin="normal">
             <Typography variant="h5" component="h1" gutterBottom>
                Sender and Message
              </Typography>

              <WhatsappOptions
              radioSelection={this.state.radioSelection}
              auth_header={this.state.auth_header}
              updateMsgCallback={this.updateMsgCallback}
              />

              

              {this.state.services_array.length > 0 ?
                (
                  <FormControl fullWidth component="fieldset" margin="normal">
                  <InputLabel id="messaging-service-select-label">Select Messaging Service</InputLabel>
                  <Select labelId="messaging-service-select-label"
                  value={this.selectedService}
                  onChange={this.handleSelectService}
                  >
                  {this.state.services_array.map((service,index) =>
                    <MenuItem key={index} value={service.sid}>{service.name}</MenuItem>
                  )}
                  </Select>
                  </FormControl>
                )
                :
                (<TextField
                  id="sender"
                  name="sender"
                  value={this.state.sender}
                  onChange={this.onSenderChange}
                  margin="normal"
                  required
                  placeholder="Sender"
                />)
              }

              {this.state.template && <ContentTemplateRenderer template={this.state.template}/>}

              {/*<TextField
                id="msgContent"
                name="myMsg"
                value={this.state.msg}
                onChange={this.onMsgChange}
                rows={3}
                margin="normal"
                multiline
                required
                placeholder="Message"
            />*/}

              {this.state.mediaSwitch?
              (
                <TextField
                id="mediaURL"
                name="mediaURL"
                value={this.state.mediaURL}
                onChange={this.onMediaURLChange}
                margin="normal"
                placeholder="Media URL"
              />
              )
              : ""         
              }

              {
                this.state.showNotifyTemplateWarning ? 
                (
                  <Typography style={{color:"red"}} variant="subtitle1"  gutterBottom>
                    You can't send messages with variables when using Notify. Please either remove the variables or disable the "Use Notify" option
                  </Typography>
                ) : ""
              }
              
       
              <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
              <Grid item xs={6}>
              <Button fullWidth
                variant="contained"
                onClick={this.checkOptOut}
                disabled={
                  !this.state.csvParsed ||
                  this.state.submitting ||
                  !this.state.selectedColumn ||
                  this.state.skipChecked
                }
                margin="normal"
                component="label"
              >
                Check Numbers
              </Button>
              </Grid>
              <Grid item xs={6}>
              <Button fullWidth
                variant="contained"
                onClick={this.sendMsg}
                disabled={
                  (!this.state.csvParsed ||
                  this.state.submitting ||
                  this.state.msg.length == 0 ||
                  !this.state.invalidNumbersCheck ||
                  this.state.invalidNumbers.length > 0 ||
                  (this.state.sender.length == 0 && this.state.selectedService === "") ||
                  (this.state.mediaSwitch && !this.state.check_https) ||
                  !this.state.selectedColumn) &&
                  !this.state.skipChecked
                }
                margin="normal"
                component="label"
              >
                Send messages
              </Button>
              </Grid>
              <Grid item xs={12}>
              <FormGroup>
                {/*<Box>
                <FormControlLabel 
                    control={<Checkbox disabled = {!this.state.csvParsed}
                    checked={this.state.skipChecked}
                    onChange={this.skipCheckBoxChange} />} 
                    label="Skip Numbers Check"/>
              </Box>*/}
            </FormGroup>
            <FormGroup>
                <Box>
                <MessageScheduler onSchedule={this.handleOnSchedule}/>
                </Box>
            </FormGroup>
              </Grid>
              <Grid item xs={12}>
              {
                this.state.showCheckLoadingIcon ?

                (<>
                  
                  <Typography gutterBottom>
                    Checking numbers, please wait...
                    <CircularProgress size={20}/>
                  </Typography>
                  

                </>) : ""
              }
              {
                this.state.showSendLoadingIcon ?

                (<>
                  
                  <Typography gutterBottom>
                    Sending messages, please wait...
                    <CircularProgress size={20}/>
                  </Typography>
                  
                </>) : ""
              }
              {

                this.state.showStatusLoadingIcon ?

                (<>
                  
                  <Typography gutterBottom>
                    Checking message statuses, please wait...
                    <CircularProgress size={20}/>
                  </Typography>
                  
                </>) : ""
              }
              </Grid>
              </Grid>
              </FormControl>

              <Settings 
                channelRadioButton={this.state.radioSelection} 
                updateSettingsCallback={this.updateSettingsCallback}
                showServicesLoadingIcon={this.state.showServicesLoadingIcon}
                showNotifyLoadingIcon={this.state.showNotifyLoadingIcon}
                isAuthenticated={this.state.isAuthenticated}
                optOutHost={window.location.origin}
              />
                         
            </FormControl>
            </Grid>
            {this.state.csvParsed ? (
              <Grid item xs={8} >
                <Logs
                  logs={this.state.logs}
                  sendResultsArray={this.state.sendResultsArray}
                  enableGraph={this.state.enableGraph}
                 />
                 <Box mt={2}> 
                  <CampaignTable 
                    csvData={this.state.csvData} 
                    dataUpdated={this.state.dataUpdated}
                    updateDataCallback={this.updateDataCallback}
                    onHeaderClick={this.onHeaderClick} 
                    nonmobileNumbers={this.state.nonmobileNumbers}
                    invalidNumbers={this.state.invalidNumbers}
                    sendResultsArray={this.state.sendResultsArray}
                    getMessageStatus={this.getMessageStatus}
                    firstTimeSend={this.state.firstTimeSend}
                    sentWithNotify={this.state.sentWithNotify}
                    updateFlag={this.updateFlag}
                    phoneNumberColumn={this.state.selectedColumn}
                    optOutNumbers={this.state.optOutNumbers}
                  />
                </Box>
              </Grid>

            ) : (
              ""
            )}

          

        </Grid>

      </Box>
    </Container>

    );
  }
}

export default App;
