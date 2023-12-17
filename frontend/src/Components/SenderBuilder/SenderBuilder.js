import React from 'react';
import { FormControl, TextField } from '@mui/material';
import SenderTypeSelection from './SenderTypeSelection/SenderTypeSelection';
import MessagingServiceSelection from './MessagingServiceSelection/MessagingServiceSelection';
import { useSelector, useDispatch } from 'react-redux';
import { MESSAGING_TYPES } from '../../Utils/variables';
import { updateMessagingState } from '../../Redux/slices/messagingSlice';
const SenderBuilder = () => {

    const dispatch = useDispatch()
    const senderTypeSelection = useSelector(state => state.messagingStructure.senderTypeSelection)
    const sender = useSelector(state => state.messagingStructure.selectedSingleSender)

    const handleSetSender = (event) => {
        dispatch(updateMessagingState({
            type: MESSAGING_TYPES.SELECTED_SINGLE_SENDER,
            value: event.target.value
        }))
    }
    return (
        <>
        <FormControl fullWidth>
        <SenderTypeSelection/>
        {
            senderTypeSelection === "Single" && (
                <TextField
                id="sender"
                name="singleSender"
                value={sender}
                onChange={handleSetSender}
                margin="normal"
                placeholder="Type Sender"
                ></TextField>
            )
        }
        {
            senderTypeSelection === "Messaging Service" && <MessagingServiceSelection/>
        }
        </FormControl>
        </>
    )

}

export default SenderBuilder;