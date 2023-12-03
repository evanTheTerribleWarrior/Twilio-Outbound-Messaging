import {createSlice} from '@reduxjs/toolkit'
import { CSVDATA_TYPES } from '../../Utils/variables';

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
          case CSVDATA_TYPES.CSV_COLUMN_FIELDS:
            state.csvColumnFields = action.payload.value
            break;
          case CSVDATA_TYPES.CSV_SELECTED_COLUMN:
            state.csvSelectedColumn = action.payload.value
            break;
        }
      }
    
    }
  });

  export const { updateCSVState} = csvDataSlice.actions;
  export default csvDataSlice.reducer;