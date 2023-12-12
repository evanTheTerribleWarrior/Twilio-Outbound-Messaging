import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Box from '@mui/material/Box';
import Papa from "papaparse";
import { v4 as uuidv4 } from 'uuid';
import { updateCSVState } from '../../Redux/slices/csvDataSlice';
import { ACTION_TYPES, CSVDATA_TYPES, MESSAGING_TYPES, COMMON } from '../../Utils/variables';
import { updateMessagingState } from '../../Redux/slices/messagingSlice';
import { updateActionState } from '../../Redux/slices/actionSlice';
import { updateSettingsState } from '../../Redux/slices/settingsSlice';

const FileLoader = (props) => {

  const [isSelected, setIsSelected] = useState(false);
  const [selectedFile, setSelectedFile] = useState(undefined);
  const [csvParsed, setCSVParsed] = useState(false);
  const [csvErrors, setCSVErrors] = useState(false);
  const [columnCount, setColumnCount] = useState(0);
  const [columnFields, setColumnFields] = useState(null);
  const [sendCompleted, setSendCompleted] = useState(false)
  const [checkCompleted, setCheckCompleted] = useState(false)
  const [error, setError] = useState(false)

  const csvData = useSelector((state) => state.csvDataStructure.csvData);
  const dispatch = useDispatch()

  const resetState = () => {
    dispatch(updateMessagingState({
      type: COMMON.RESET_STATE,
      value: ""
    }))

    dispatch(updateActionState({
      type: COMMON.RESET_STATE,
      value: ""
    }))


    dispatch(updateSettingsState({
      type: COMMON.RESET_STATE,
      value: ""
    }))

    dispatch(updateCSVState({
      type: COMMON.RESET_STATE,
      value: ""
    }))
  }

  useEffect(() => {
    
    if(selectedFile){
      
      resetState()
      Papa.parse(selectedFile, {
          header: true,
          worker: true,
          skipEmptyLines: true,
          dynamicTyping: true,
          chunk: (results) => {
              let newCSVData = []
              setColumnCount(results.meta.fields.length)  
              setColumnFields(results.meta.fields)

              dispatch(updateCSVState({
                type: CSVDATA_TYPES.CSV_COLUMN_FIELDS,
                value: results.meta.fields
              }))

            if (results.errors.length > 0) {
              setCSVParsed(false);
              setCSVErrors(true);
              setIsSelected(false);
              console.error('Errors:', results.errors);
              parser.abort();
              return;
            }

            

            results.data.forEach(row => {
              const UniqueID = uuidv4();

              let csvObj = {}
              csvObj["UniqueID"] = UniqueID
              for (const key in row) {
                csvObj[key] = String(row[key]);
              }

              newCSVData.push(csvObj);
              
            });

            dispatch(updateCSVState({
              type: CSVDATA_TYPES.UPDATE_DATA_CHUNK,
              value: newCSVData
            }))

          },
          complete: () => {
                
          },
      });
      
    }
 
  }, [selectedFile])

  function onFileChange(event) {
    if (event.target.files.length > 0) {
      
      setIsSelected(true)
      setSelectedFile(event.target.files[0])
      setSendCompleted(false)
      setCheckCompleted(false)
      setError(false)
    }
  }

  function truncateString(str, num) {
    if (str.length > num) {
      return str.slice(0, num) + '...';
    } else {
      return str;
    }
  }


  return(
    <>
    <FormControl component="fieldset" margin="normal">
      <Button variant="contained" margin="normal" component="label">
        {isSelected ? truncateString(selectedFile.name, 15) : "Upload file"}{" "}
        <input
          type="file"
          name="myFile"
          accept=".csv"
          onChange={onFileChange}
          hidden
        />
      </Button>
      </FormControl>

      {csvParsed && csvData ? (
        <Box mt={1}>
          <FormLabel>
            <b>Total Rows Count: </b>{csvData.length}<br/>
            <b>Total Columns Count:</b> {columnCount}
          </FormLabel>{" "}
      </Box>
    ) : (
      ""
    )}

    {csvErrors ? (
      <Box mt={1}>
        <FormLabel>
          Errors parsing the CSV file <b>{selectedFile.name}</b>.{" "}
        </FormLabel>{" "}
      </Box>
    ) : (
      ""
    )}
    </>
  )
}

export default FileLoader;