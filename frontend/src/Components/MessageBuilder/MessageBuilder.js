import React, {useState} from 'react';
import { Typography, TextField, Box, FormControl, Switch, FormControlLabel, IconButton, Alert, FormHelperText } from '@mui/material';
import TemplateOptions from './TemplateOptions/TemplateOptions';
import ContentTemplateRenderer from './ContentTemplateRenderer/ContentTemplateRenderer';
import ProTip from '../ProTip/ProTip';
import MessageTypeSelection from './MessageTypeSelection/MessageTypeSelection';
import MessageScheduler from './MessageScheduler/MessageScheduler';
import { useSelector, useDispatch } from 'react-redux';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { updateSettingsState } from '../../Redux/slices/settingsSlice';
import { updateMessagingState } from '../../Redux/slices/messagingSlice';
import { SETTINGS_TYPES, MESSAGING_TYPES } from '../../Utils/variables';

const MessageBuilder = () => {

    const messageTypeSelection = useSelector(state => state.messagingStructure.messageTypeSelection)
    const template = useSelector(state => state.messagingStructure.selectedTemplate)
    const msg = useSelector(state => state.messagingStructure.customMessage)
    //const mediaURL = useSelector(state => state.messagingStructure.customMediaURL)
    const mediaSwitch = useSelector(state => state.settingsStructure.checkMediaURL)

    const dispatch = useDispatch()

    const [mediaAlertClicked, setMediaAlert] = useState(false);
    const [mediaURL, setMediaURL] = useState("")
    const [isValidUrl, setIsValidUrl] = useState(true);

    const handleMediaSwitch = (event) => {
        dispatch(updateSettingsState({
            type: SETTINGS_TYPES.MEDIA_URL_SWITCH,
            value: event.target.checked
        }))
    }

    const handleSetMsg = (event) => {
        dispatch(updateMessagingState({
            type: MESSAGING_TYPES.CUSTOM_MESSAGE,
            value: event.target.value
        }))
    }

    const handleSetMediaURL = (event) => {
        if (validateMediaURL(event.target.value)){
            dispatch(updateMessagingState({
                type: MESSAGING_TYPES.CUSTOM_MEDIA_URL,
                value: event.target.value
            }))
            setMediaURL(event.target.value)
            setIsValidUrl(true)
        }
        else{
            setMediaURL(event.target.value)
            setIsValidUrl(false)
        }
            
        
    }

    const validateMediaURL = (url) => {
        const urlPattern = new RegExp('^(https?:\\/\\/)?' +
          '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' +
          '((\\d{1,3}\\.){3}\\d{1,3}))' + 
          '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' +
          '(\\?[;&a-z\\d%_.~+=-]*)?' +
          '(\\#[-a-z\\d_]*)?$', 'i');
        return !!urlPattern.test(url);
      };

    

    return (
        <Box mt={2}>
        <FormControl fullWidth>
        <Typography variant="h5" component="h1" gutterBottom>
            Message
        </Typography>
        <MessageTypeSelection/>
        {
            messageTypeSelection === "Custom" && (<>
                <TextField
                id="msgContent"
                name="myMsg"
                value={msg}
                onChange={handleSetMsg}
                rows={3}
                margin="normal"
                multiline
                placeholder="Type Message..."
                ></TextField>

                <ProTip message="Click on the column names to add them as parameters in the message"/>

                <Box mt={1}>
                    <FormControlLabel control={<Switch checked={mediaSwitch} onChange={handleMediaSwitch} />} label="Send Media / MMS" />
                    <IconButton onClick={() => setMediaAlert(mediaAlertClicked ? false : true)}>
                        <HelpOutlineIcon/>
                    </IconButton>
                </Box>
                { mediaAlertClicked &&
                (<Alert severity="info">
                If selected, you can set a publicly available Media URL in order to send a media file. You can read more about sending media files in SMS <a href="https://www.twilio.com/docs/messaging/services/tutorials/how-to-send-sms-messages-services" target="_blank">here</a> and Whatsapp <a href="https://www.twilio.com/docs/whatsapp/guidance-whatsapp-media-messages" target="_blank">here</a>
                </Alert>)
                }
                {
                    mediaSwitch && (
                        <>
                        <TextField
                        id="mediaURL"
                        name="mediaURL"
                        value={mediaURL}
                        onChange={handleSetMediaURL}
                        margin="normal"
                        placeholder="Insert Media URL..."
                        ></TextField>
          
                        {!isValidUrl && (
                            <FormHelperText sx={{ color: 'red', fontSize: '1rem' }}>
                              Please enter a valid and publicly accessible URL
                            </FormHelperText>
                          )}
                        </>
                    )
                }
            </>)
        }
        {
            messageTypeSelection === "Template" && <TemplateOptions/>
        }
        { template && <ContentTemplateRenderer template={template}/>}
        <MessageScheduler/>
        </FormControl>
        </Box>
    )
}

export default MessageBuilder;