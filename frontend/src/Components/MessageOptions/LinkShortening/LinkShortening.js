import React, { useState } from 'react';
import { Box, FormControlLabel, Switch, Alert, IconButton } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useSelector, useDispatch } from 'react-redux';
import { updateSettingsState } from '../../../Redux/slices/settingsSlice';
import { SETTINGS_TYPES } from '../../../Utils/variables';

const LinkShortening = () => {

  const [linkShorteningAlert, setLinkShorteningAlert] = useState(false);
  const checkLinkShortening = useSelector(state => state.settingsStructure.checkLinkShortening)
  const dispatch = useDispatch()

  const handleLinkShorteningSwitchChange = (e) => {
    dispatch(updateSettingsState({
      type: SETTINGS_TYPES.LINK_SHORTENING,
      value: e.target.checked
    }))
  }

  return (
    <Box mt={1}>
        <FormControlLabel control={<Switch checked={checkLinkShortening} onChange={handleLinkShorteningSwitchChange} />} label="Link Shortening" />
        <IconButton onClick={() => setLinkShorteningAlert(linkShorteningAlert ? false : true)}>
            <HelpOutlineIcon/>
          </IconButton>
          { linkShorteningAlert &&
            (<Alert severity="info">
            If you enable this, any long URLs in the message will be shortened using your Twilio-registered shortened domain. Learn more <a href="https://www.twilio.com/docs/messaging/features/link-shortening" target="_blank">here</a>
            </Alert>)
          }
    </Box>
  );
};

export default LinkShortening;
