import {createSlice} from '@reduxjs/toolkit';
import { MESSAGING_TYPES, COMMON } from '../../Utils/variables';

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

              case MESSAGING_TYPES.UPDATE_DATA_CHUNK:
              state.sendResultsArray = state.sendResultsArray.concat(action.payload.value);
              break;

              case MESSAGING_TYPES.ADD_ROW:
                state.sendResultsArray.unshift(action.payload.value)
                break;

              case MESSAGING_TYPES.DELETE_ROW:
              state.sendResultsArray = state.sendResultsArray.filter((row, j) => j !== action.payload.value)
              break;
              
            case MESSAGING_TYPES.UPDATE_SEND_RESULTS_ARRAY_AFTER_SEND:
              const { messageReceiptsArray, failedReceiptsArray } = action.payload.value;

              if(messageReceiptsArray.length > 0) {
                messageReceiptsArray.map(row => {
                  let result = state.sendResultsArray.findIndex(r => r.csvRowID === row.csvRowID);
                  if(result !== -1){
                    state.sendResultsArray[result].messageSid = row.messageSid
                    return;
                  }
                  else {
                      let sendResultsObj = {}
                      sendResultsObj["messageSid"] = row.messageSid
                      sendResultsObj["error"] = {}
                      sendResultsObj["error"]["errorCode"] = ""
                      sendResultsObj["error"]["errorMessage"] = ""
                      sendResultsObj["error"]["errorLink"] = ""
                      sendResultsObj["status"] = ""
                      sendResultsObj["csvRowID"] = row.csvRowID

                      state.sendResultsArray.push(sendResultsObj)
                      sendResultsObj = {}
                      return;
                    
                  }
                })
              }

              if(failedReceiptsArray.length > 0) {
                failedReceiptsArray.map(row => {
                  let result = state.sendResultsArray.findIndex(r => r.csvRowID === row.csvRowID);
                  if(result !== -1){
                    state.sendResultsArray[result]["error"].errorCode = row.errorCode
                    state.sendResultsArray[result]["error"].errorMessage = row.errorMessage
                    return;
                  }
                  else {
                      let sendResultsObj = {}
                      sendResultsObj["messageSid"] = ""
                      sendResultsObj["error"] = {}
                      sendResultsObj["error"]["errorCode"] = row.errorCode
                      sendResultsObj["error"]["errorMessage"] = row.errorMessage
                      sendResultsObj["error"]["errorLink"] = ""
                      sendResultsObj["status"] = row.status
                      sendResultsObj["csvRowID"] = row.csvRowID

                      state.sendResultsArray.push(sendResultsObj)
                      sendResultsObj = {}
                      return;
                  }
                })
              }

              break;

              case MESSAGING_TYPES.UPDATE_STATUS_CHUNK:
                if(action.payload.value.length > 0) {
                  action.payload.value.map(row => {
                    let result = state.sendResultsArray.findIndex(r => r.csvRowID === row.csvRowID);
                    if(result !== -1){
                      state.sendResultsArray[result].status = row.status;
                      state.sendResultsArray[result].error.errorCode = row.error.errorCode
                      state.sendResultsArray[result].error.errorMessage = row.error.errorMessage
                      return;    
                    }
                    return;
                  })
                }
                break;
              case COMMON.RESET_STATE:
                return initialState
        }
      }
    },
  });

  export const { updateMessagingState} = messagingSlice.actions;
  export default messagingSlice.reducer;