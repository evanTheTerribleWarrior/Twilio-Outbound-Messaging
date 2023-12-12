import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import { MESSAGING_TYPES } from '../../../Utils/variables';
import { updateMessagingState } from '../../../Redux/slices/messagingSlice';

const SenderTypeSelection = () => {

    const senderTypeSelection = useSelector((state) => state.messagingStructure.senderTypeSelection)
	const dispatch = useDispatch()

    const onRadioChange = (event) => {
		dispatch(updateMessagingState({
			type: MESSAGING_TYPES.SENDER_TYPE_SELECTION,
			value: event.target.value
	    }))
	}

    return (
		<Box mt={2}>
          <RadioGroup aria-label="sender" name="sender" value={senderTypeSelection} onChange={onRadioChange} row>
            <FormControlLabel value="Single" control={<Radio />} label="Single" style={{ marginRight: '50px' }}  />
            <FormControlLabel value="Messaging Service" control={<Radio />} label="Messaging Service" />
          </RadioGroup>
        </Box>
	)

}

export default SenderTypeSelection;