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