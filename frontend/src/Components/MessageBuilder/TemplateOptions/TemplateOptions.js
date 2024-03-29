import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateMessagingState } from '../../../Redux/slices/messagingSlice';
import { MESSAGING_TYPES } from '../../../Utils/variables';
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import FormGroup from "@mui/material/FormGroup";
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import { fetchTemplates } from '../../../Utils/functions';

const TemplateOptions = (props) => {
    const dispatch = useDispatch();
    const [templates_array, setTemplatesArray] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState("")
    const [showLoadingIcon, setLoadingIcon] = useState(false)
    const [stateUpdateValues, setStateUpdateValues] = useState({submitting: false, getTemplatesCompleted: false, error: false, showTemplatesLoadingIcon: false})

    const contentTypes = {
      'twilio/text': 'Text',
      'twilio/media': 'Media',
      'twilio/call-to-action': 'Call To Action',
      'twilio/quick-reply': 'Quick Reply',
      'twilio/card': 'Card',
      'twilio/list-picker': 'List Picker'
    }
    const messageTypeSelection = useSelector(state => state.messagingStructure.messageTypeSelection)
    const channelSelection = useSelector(state => state.messagingStructure.channelSelection);

    function handleSelectedTemplate(event) {
        setSelectedTemplate(event.target.value)
        const template = templates_array.find(template => template.sid === event.target.value);
        dispatch(updateMessagingState({
          type: MESSAGING_TYPES.SELECTED_TEMPLATE,
          value: template
        }))
    }

    const listAllTemplates = async () => {

      setLoadingIcon(true)
      setStateUpdateValues({ submitting: true, getTemplatesCompleted: false, error: false, showTemplatesLoadingIcon: true });
      try {
        const data = await fetchTemplates(channelSelection);
        setStateUpdateValues({
          submitting: false,
          showLoadingIcon: false,
          getTemplatesCompleted: true
        });
        setTemplatesArray(data.data.templates_array)
        setLoadingIcon(false)
      } catch (error) {
        console.error('Error fetching templates:', error);
        setStateUpdateValues({
          submitting: false,
          showLoadingIcon: false,
          getTemplatesCompleted: true
        });
      }

    }

    useEffect(() => {
      if(messageTypeSelection === "Template"){
        listAllTemplates();
      }
      else {
        cleanValues()
      }
    }, [messageTypeSelection, channelSelection]);

    const cleanValues = () => {
      setTemplatesArray([])
      setSelectedTemplate("")
      setLoadingIcon(false)
      setStateUpdateValues({getTemplatesCompleted: false})
      dispatch(updateMessagingState({
        type: MESSAGING_TYPES.SELECTED_TEMPLATE,
        value: null
      }))
    }

    return(
    <>
      <FormGroup>
          <Box>
              {
                  showLoadingIcon ?

                  (<>
                    <CircularProgress size={15}/>
                    <Typography variant="h6"gutterBottom>
                      Loading Templates...
                    </Typography>

                  </>) : ""
              }
            {templates_array.length > 0 ?
              (
                <FormControl fullWidth component="fieldset" margin="normal">
                <InputLabel id="template-select-label">Select Template</InputLabel>
                <Select labelId="template-select-label"
                value={selectedTemplate}
                onChange={(event) => {handleSelectedTemplate(event)}}
                >
                {templates_array.map((template,index) =>
                  <MenuItem key={index} id={index} value={template.sid}>
                    <b>Name</b>: {template.name}<br/>
                    <b>{' '}Language</b>: {template.language}<br/>
                    <b>{' '}Type</b>: {contentTypes[Object.keys(template.content)[0]]}
                  </MenuItem>
                )}
                </Select>
                </FormControl>
              )
              :
              ""
            }
          </Box>
      </FormGroup>
    </>
    )
}

export default TemplateOptions;