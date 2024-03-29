import {createSlice} from '@reduxjs/toolkit';
import { ACTION_TYPES, COMMON } from '../../Utils/variables';

  const initialState = {
    lookupDataForLogs: {},
    totalLogs: "",
    sendDataForLogs: {},
    getStatusDataForLogs: {},
    emptyNumbersForLogs: {},
    duplicateNumberDataForLogs: {},
    progressBarCount: 0
  };
  
  const actionSlice = createSlice({
    name: 'actionStructure',
    initialState,
    reducers: {
      updateActionState: (state, action) => {
        switch(action.payload.type){
            case ACTION_TYPES.LOOKUP_DATA_FOR_LOGS:
                state.lookupDataForLogs = action.payload.value
                break;
            case ACTION_TYPES.SEND_DATA_FOR_LOGS:
              state.sendDataForLogs = action.payload.value
              break;
            case ACTION_TYPES.GET_STATUS_DATA_FOR_LOGS:
              state.getStatusDataForLogs = action.payload.value
              break;
            case ACTION_TYPES.EMPTY_NUMBERS_FOR_LOGS:
              state.emptyNumbersForLogs = action.payload.value
              break;
              case ACTION_TYPES.DUPLICATE_NUMBERS_FOR_LOGS:
              state.duplicateNumberDataForLogs = action.payload.value
              break;
              case ACTION_TYPES.PROGRESS_BAR_COUNT:
                let currentBarCount = state.progressBarCount;
                const newValue = action.payload.value.newValue;
                const totalData = action.payload.value.totalData;
                if(newValue === 0){
                  state.progressBarCount = 0
                }
                else {
                  const newBarCount = currentBarCount + newValue;
                  state.progressBarCount = newBarCount > totalData ? totalData : newBarCount;
                }
                break;
            case ACTION_TYPES.TOTAL_LOGS:
                state.totalLogs = action.payload.value
                break;
            case COMMON.RESET_STATE:
              return initialState
        }
      }
    },
  });

  export const { updateActionState} = actionSlice.actions;
  export default actionSlice.reducer;