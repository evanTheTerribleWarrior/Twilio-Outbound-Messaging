import React, {useState} from 'react';
import { Button, Box, TextField } from '@mui/material';
import { convertToCSV, downloadCSV } from '../../Utils/functions';
import { useSelector } from 'react-redux';

const ResultsExports = () => {

    const [filename, setFilename] = useState('results.csv');
    const [webhookUrl, setWebhookUrl] = useState('');

    const csvData = useSelector(state => state.csvDataStructure.csvData)
    const lookupData = useSelector(state => state.actionStructure.lookupDataForLogs)
    const checkLineType = useSelector(state => state.settingsStructure.checkLineType)
    const sendResultsArray = useSelector(state => state.messagingStructure.sendResultsArray)

    const capitalizeFirstLetter = (str) => {
        if (!str) return str;
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    const mergedData = csvData.map((row, index) => {
        let lookupValidityStatus = "";
        let lookupLineType = "";
        if (lookupData.checkedSuccess > 0 || lookupData.checkedErrors > 0)  {
            lookupValidityStatus = lookupData.invalidNumbers_ID.includes(index) ? 'Invalid' : 'Valid';
            if(checkLineType) {
                lookupLineType = lookupData.nonmobileNumbers_ID.includes(index) ? 'Non mobile' : 'Mobile';
            }
            else {
                lookupLineType = "Line Type not checked"
            }
        }
        else {
            lookupValidityStatus = "Lookup not done"
        }
        
        const sendResultRowStatus = sendResultsArray.find(result => result.csvRowID === row.UniqueID);
        const messageStatus = sendResultRowStatus ? capitalizeFirstLetter(sendResultRowStatus.status) : 'Status not available';
      
        return {
          ...row,
          "Is the number valid?" : lookupValidityStatus,
          "Is the number mobile?" : lookupLineType,
          "Message Status": messageStatus
        };
    });

    const handleDownload = () => {
        const csvContent = convertToCSV(mergedData);
        downloadCSV(csvContent, filename);
    };

    const handleSendData = () => {
        fetch(webhookUrl, {
            method: 'POST',
            headers: {
            'Content-Type': 'text/plain',
            },
            body: JSON.stringify(mergedData),
        })
            .then(response => response.json())
            .then(data => console.log('Success:', data))
            .catch((error) => console.error('Error:', error));
    };

    return(
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
            <TextField
            label="Filename"
            variant="outlined"
            value={filename}
            onChange={(e) => setFilename(e.target.value)}
            helperText="Enter the filename for the CSV download."
            />
            <Button variant="outlined" onClick={handleDownload}>
            Download CSV
            </Button>
    
            <TextField
            label="Webhook URL"
            variant="outlined"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            helperText="Enter the Webhook URL to send data."
            />
            <Button variant="outlined" onClick={handleSendData}>
            Send Data to Webhook
            </Button>
        </Box>
    )
}

export default ResultsExports;