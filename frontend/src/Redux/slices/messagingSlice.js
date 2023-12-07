import {createSlice} from '@reduxjs/toolkit';
import { MESSAGING_TYPES } from '../../Utils/variables';

  const initialState = {
    channelSelection: "SMS",
    messageTypeSelection: "Custom",
    senderTypeSelection: "Single",
    selectedService: null,
    selectedSingleSender: null,
    selectedTemplate: null,
    templateVariables: {},
    customMessage: "",
    customMediaURL: "",
    scheduledDate: "",
    sendResultsArray: []
  };
  
  const messagingSlice = createSlice({
    name: 'messagingStructure',
    initialState,
    reducers: {
      updateMessagingState: (state, action) => {
        switch(action.payload.type){
            case MESSAGING_TYPES.CHANNEL_SELECTION:
                state.channelSelection = action.payload.value
                break;
            case MESSAGING_TYPES.SELECTED_TEMPLATE:
                state.selectedTemplate = action.payload.value
                break;
            case MESSAGING_TYPES.SELECTED_SERVICE:
                state.selectedService = action.payload.value
                break;
            case MESSAGING_TYPES.SELECTED_SINGLE_SENDER:
              state.selectedSingleSender = action.payload.value
              break;
            case MESSAGING_TYPES.MESSAGE_TYPE_SELECTION:
                state.messageTypeSelection = action.payload.value
                break;
            case MESSAGING_TYPES.SENDER_TYPE_SELECTION:
                state.senderTypeSelection = action.payload.value
                break;
            case MESSAGING_TYPES.TEMPLATE_VARIABLES:
                state.templateVariables = action.payload.value
                break;
            case MESSAGING_TYPES.CUSTOM_MESSAGE:
                state.customMessage = action.payload.value
                break;
            case MESSAGING_TYPES.CUSTOM_MEDIA_URL:
                state.customMediaURL = action.payload.value
                break;
            case MESSAGING_TYPES.SCHEDULED_DATE:
                state.scheduledDate = action.payload.value
                break;
            case MESSAGING_TYPES.SEND_RESULTS_ARRAY:
              state.sendResultsArray = action.payload.value
              break;
              
            case MESSAGING_TYPES.UPDATE_SEND_RESULTS_ARRAY_AFTER_SEND:
              const { messageReceiptsArray, failedReceiptsArray } = action.payload.value;

              console.log(failedReceiptsArray)

              state.sendResultsArray = state.sendResultsArray.map(row => {
                let result = messageReceiptsArray.find(r => r.csvRowID === row.csvRowID);
                if (result){
                  return { ...row, messageSid: result.messageSid }
                }
                else {
                  result = failedReceiptsArray.find(r => r.csvRowID === row.csvRowID);
                  console.log(result)
                  if (result) 
                    return { 
                      ...row, 
                      error: {...row.error, errorCode: result.errorCode, errorMessage: result.errorMessage},
                      status: "failed"
                    }
                }
                return row;
              });
              break;
        }
      }
    },
  });

  export const { updateMessagingState} = messagingSlice.actions;
  export default messagingSlice.reducer;