import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TextField, Grid, InputLabel, Select, MenuItem, FormControl } from '@mui/material';
import { updateMessagingState } from '../../../Redux/slices/messagingSlice';
import { MESSAGING_TYPES } from '../../../Utils/variables';

const TemplateVariablesInput = ({data}) => {

    const columnFields = useSelector(state => state.csvDataStructure.csvColumnFields)
    const values = useSelector(state => state.messagingStructure.templateVariables)
    const dispatch = useDispatch();

    const handleSelectChange = (key, value) => {
        const newValues = { ...values, [key]: value };
        dispatch(updateMessagingState({
          type: MESSAGING_TYPES.TEMPLATE_VARIABLES,
          value: newValues
        }));
    };

    return (
        <>
          {Object.keys(data).map((key) => (
            <Grid container alignItems="center" spacing={2} key={key}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Key"
                  variant="outlined"
                  value={key}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
              <FormControl fullWidth component="fieldset">
                <InputLabel id="column-select-label-template">Select Column</InputLabel>
                  <Select labelId="column-select-label-template"
                  value={values[key] || ''}
                  onChange={(e) => handleSelectChange(key, e.target.value)}
                  >
                  {columnFields.map((column) =>
                  <MenuItem key={column} value={column}>{column}</MenuItem>
                  )}
                  </Select>
                </FormControl>
                </Grid>
              </Grid>

          ))}
        </>
    )

}

export default TemplateVariablesInput;