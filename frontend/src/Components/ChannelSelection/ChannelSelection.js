import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import { MESSAGING_TYPES } from '../../Utils/variables';
import { updateMessagingState } from '../../Redux/slices/messagingSlice';

const ChannelSelection = () => {

	const channelSelection = useSelector((state) => state.messagingStructure.channelSelection)
	const dispatch = useDispatch()
	
	const onRadioChange = (event) => {
		dispatch(updateMessagingState({
			type: MESSAGING_TYPES.CHANNEL_SELECTION,
			value: event.target.value
		}))
	}

	return (

		<>
          <RadioGroup aria-label="channel" name="channel" value={channelSelection} onChange={onRadioChange} row>
            <FormControlLabel value="SMS" control={<Radio />} label="SMS" style={{ marginRight: '50px' }}  />
            <FormControlLabel value="Whatsapp" control={<Radio />} label="Whatsapp" style={{ marginRight: '50px' }}   />
			<FormControlLabel value="FBM" control={<Radio />} label="Facebook Messenger" />
          </RadioGroup>
        </>

	)

}

export default ChannelSelection