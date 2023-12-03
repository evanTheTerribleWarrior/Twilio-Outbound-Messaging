import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import Box from "@mui/material/Box";

import { updateCSVState } from '../../Redux/slices/csvDataSlice';
import { CSVDATA_TYPES } from '../../Utils/variables';

const NumberColumnSelection = () => {

    const columnFields = useSelector(state => state.csvDataStructure.csvColumnFields)
    const selectedColumn = useSelector(state => state.csvDataStructure.csvSelectedColumn)
    const dispatch = useDispatch()

    function handleSelectColumn(event){
        dispatch(updateCSVState({
            type: CSVDATA_TYPES.CSV_SELECTED_COLUMN,
            value: event.target.value
        }))
    }

    return (
        <Box mt={1}>
            <FormControl fullWidth component="fieldset" margin="normal">
                <InputLabel id="column-select-label">Select Phone Numbers Column</InputLabel>
                <Select labelId="column-select-label"
                value={selectedColumn}
                onChange={handleSelectColumn}
                >
                {columnFields.map((column,index) =>
                <MenuItem key={index} value={column}>{column}</MenuItem>
                )}
                </Select>
            </FormControl>
        </Box>
    )

}


export default NumberColumnSelection;