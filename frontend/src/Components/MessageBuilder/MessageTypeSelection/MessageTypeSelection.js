import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, Radio, RadioGroup, FormControlLabel } from '@mui/material';
import { MESSAGING_TYPES } from '../../../Utils/variables';
import { updateMessagingState } from '../../../Redux/slices/messagingSlice';

const MessageTypeSelection = () => {

    const messageTypeSelection = useSelector((state) => state.messagingStructure.messageTypeSelection)
	  const dispatch = useDispatch()

    const onRadioChange = (event) => {
        if (event.target.value === "Custom"){
            dispatch(updateMessagingState({
                type: MESSAGING_TYPES.SELECTED_TEMPLATE,
                value: null
            }))
        }
      dispatch(updateMessagingState({
        type: MESSAGING_TYPES.MESSAGE_TYPE_SELECTION,
        value: event.target.value
        }))
	  }

    return (
		<Box mt={2}>
          <RadioGroup aria-label="message" name="message" value={messageTypeSelection} onChange={onRadioChange} row>
            <FormControlLabel value="Custom" control={<Radio />} label="Custom" style={{ marginRight: '50px' }}  />
            <FormControlLabel value="Template" control={<Radio />} label="Template" />
          </RadioGroup>
        </Box>
	)

}

export default MessageTypeSelection;