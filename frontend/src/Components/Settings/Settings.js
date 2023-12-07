import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TextField, Box, Tooltip } from '@mui/material';
import { updateSettingsState } from '../../Redux/slices/settingsSlice';

const Settings = () => {

    return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
        <Tooltip title="Explanation for Lookup Chunk Size">
            <TextField
            label="Lookup Chunk Size"
            type="number"
            //value={settings.lookupChunkSize}
            //onChange={handleSettingChange('lookupChunkSize')}
            inputProps={{ max: 1000 }} // Set maximum value as needed
            />
        </Tooltip>
      
     
    </Box>
    )

}

export default Settings;