import {createSlice} from '@reduxjs/toolkit'
import { SETTINGS_TYPES, COMMON } from '../../Utils/variables';

  const initialState = {
    checkLineType: false,
    checkMediaURL: false,
    checkOptOutURL: false,
    checkMessagingService: false,
    checkScheduleMessages: false,
    checkBroadcastAPI: false,
    checkLinkShortening: false,
    enableGraph: false,
    limits: {
      lookupChunkSize: 50,
      broadcastChunkSize: 100,
      standardAPIChunkSize: 50,
      browserConcurrency: 5,
      getStatusChunkSize: 50
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
            case SETTINGS_TYPES.LINK_SHORTENING:
              state.checkLinkShortening = action.payload.value
              break;
            case SETTINGS_TYPES.ENABLE_GRAPH:
                state.enableGraph = action.payload.value
                break;
                case SETTINGS_TYPES.LIMITS:
                state.limits = action.payload.value
                break;
                case COMMON.RESET_STATE:
                  return initialState
        }
      }
    },
  });

  export const { updateSettingsState } = settingsSlice.actions;
  export default settingsSlice.reducer;