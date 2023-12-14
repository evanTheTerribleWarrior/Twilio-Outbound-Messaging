import React from 'react';
import Box from '@mui/material/Box'
import Button from '@mui/material/Button';
import TextareaAutosize from '@mui/material/TextareaAutosize';

const LogPanel = (props) => {
    
    const { logs } = props;

    const clearLogs = () => {
      props.clearLogs()
    }
  
    return (
      <div
        role="tabpanel"
        id={`simple-tabpanel-logs`}
        aria-labelledby={`simple-tab-logs`}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <TextareaAutosize
            placeholder="All logs will appear here"
            minRows={10}
            maxRows={10}
            style={{width: '100%'}}
            value={logs}
            />
            <Button variant="outlined" onClick={clearLogs}>Clear Logs</Button>
        </Box>
          
         
      </div>
    );
  }

  export default LogPanel;