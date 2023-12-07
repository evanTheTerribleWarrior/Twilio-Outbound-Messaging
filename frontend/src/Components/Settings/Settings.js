import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { TextField, Box, Tooltip } from '@mui/material';
import { updateSettingsState } from '../../Redux/slices/settingsSlice';
import { SETTINGS_TYPES } from '../../Utils/variables';

const Settings = () => {

    const dispatch = useDispatch();
    const limits = useSelector(state => state.settingsStructure.limits)

    const handleSettingChange = (type) => event => {
        let newLimits = {
            ...limits,
            [type]: Number(event.target.value)
        }
        dispatch(updateSettingsState({
            type: SETTINGS_TYPES.LIMITS,
            value: newLimits
        }))
    }

    return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 2 }}>
        <Tooltip title="How many concurrent open requests will be sent from the UI. The higher the number, the slower the app will get">
            <TextField
            label="Browser Concurrency Limit"
            type="number"
            value={limits.browserConcurrency}
            onChange={handleSettingChange('browserConcurrency')}
            inputProps={{ max: 20 }}
            />
        </Tooltip>
        <Tooltip title="When you click Check Numbers, this is the number of rows we will add to each batch">
            <TextField
            label="Lookup Chunk Size"
            type="number"
            value={limits.lookupChunkSize}
            onChange={handleSettingChange('lookupChunkSize')}
            inputProps={{ max: 100 }}
            />
        </Tooltip>
        <Tooltip title="When you click Send Messages and select the Broadcast API, this is the number of rows we will add to each batch">
            <TextField
            label="Broadcast API Chunk Size"
            type="number"
            value={limits.broadcastChunkSize}
            onChange={handleSettingChange('broadcastChunkSize')}
            inputProps={{ max: 100 }}
            />
        </Tooltip>
        <Tooltip title="When you click Send Messages and you do not select the Broadcast API, this is the number of rows we will add to each batch">
            <TextField
            label="Messaging API Chunk Size"
            type="number"
            value={limits.standardAPIChunkSize}
            onChange={handleSettingChange('standardAPIChunkSize')}
            inputProps={{ max: 100 }}
            />
        </Tooltip>
        <Tooltip title="When you click Get Message Status, this is the number of rows we will add to each batch">
            <TextField
            label="Message Status Chunk Size"
            type="number"
            value={limits.getStatusChunkSize}
            onChange={handleSettingChange('getStatusChunkSize')}
            inputProps={{ max: 100 }}
            />
        </Tooltip>
     
    </Box>
    )

}

export default Settings;