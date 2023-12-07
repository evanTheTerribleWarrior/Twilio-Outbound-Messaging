import {createSlice} from '@reduxjs/toolkit'
import { SETTINGS_TYPES } from '../../Utils/variables';

  const initialState = {
    checkLineType: false,
    checkMediaURL: false,
    checkOptOutURL: false,
    checkMessagingService: false,
    checkScheduleMessages: false,
    checkBroadcastAPI: false,
    enableGraph: false,
    limits: {
      lookupChunk: 50,
      broadcastChunk: 100,
      standardAPIChunk: 50,
      browserConcurrency: 5,
      getStatusChunk: 50
    }
  };
  
  const settingsSlice = createSlice({
    name: 'settingsStructure',
    initialState,
    reducers: {
      updateSettingsState: (state, action) => {
        switch(action.payload.type){
            case SETTINGS_TYPES.LINE_TYPE_SWITCH:
                state.checkLineType = action.payload.value
                break;
            case SETTINGS_TYPES.MESSAGING_SERVICE_SWITCH:
                state.checkMessagingService = action.payload.value
                break;
            case SETTINGS_TYPES.MEDIA_URL_SWITCH:
                state.checkMediaURL = action.payload.value
                break;
            case SETTINGS_TYPES.OPT_OUT_SWITCH:
                state.checkOptOutURL = action.payload.value
                break;
            case SETTINGS_TYPES.SCHEDULE_SWITCH:
                state.checkScheduleMessages = action.payload.value;
                break;
            case SETTINGS_TYPES.BROADCAST_SWITCH:
                state.checkBroadcastAPI = action.payload.value
                break;
            case SETTINGS_TYPES.ENABLE_GRAPH:
                state.enableGraph = action.payload.value
        }
      }
    },
  });

  export const { updateSettingsState } = settingsSlice.actions;
  export default settingsSlice.reducer;