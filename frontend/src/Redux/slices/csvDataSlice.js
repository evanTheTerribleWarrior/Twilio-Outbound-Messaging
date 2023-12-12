import {createSlice} from '@reduxjs/toolkit'
import { CSVDATA_TYPES, COMMON } from '../../Utils/variables';

  const initialState = {
    csvData: [],
    csvColumnFields: [],
    csvSelectedColumn: ""
  };
  
  const csvDataSlice = createSlice({
    name: 'csvDataStructure',
    initialState,
    reducers: {
      updateCSVState: (state, action) => {
        switch(action.payload.type){
        
          case CSVDATA_TYPES.ALL_CSV_DATA:
            state.csvData = action.payload.value;
            break;
            case CSVDATA_TYPES.UPDATE_DATA_CHUNK:
              state.csvData = state.csvData.concat(action.payload.value);
              break;
          case CSVDATA_TYPES.CSV_COLUMN_FIELDS:
            state.csvColumnFields = action.payload.value
            break;
          case CSVDATA_TYPES.CSV_SELECTED_COLUMN:
            state.csvSelectedColumn = action.payload.value
            break;
          case CSVDATA_TYPES.ADD_ROW:
            state.csvData.unshift(action.payload.value)
            break;
          case CSVDATA_TYPES.DELETE_ROW:
            state.csvData = state.csvData.filter((row, j) => j !== action.payload.value)
            break;
          case CSVDATA_TYPES.UPDATE_ROW:
            const index = state.csvData.findIndex(row => row.UniqueID === action.payload.value.UniqueID);
            console.log(index)
            if (index !== -1) {
              state.csvData[index] = { ...state.csvData[index], ...action.payload.value };
            }
            break;
          case COMMON.RESET_STATE:
            return initialState;
        }
      }
    
    }
  });

  export const { updateCSVState} = csvDataSlice.actions;
  export default csvDataSlice.reducer;