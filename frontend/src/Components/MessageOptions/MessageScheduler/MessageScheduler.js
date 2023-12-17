import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, FormControlLabel, Switch, Alert, IconButton } from '@mui/material';
import { addMinutes, addDays, addHours, parse, format, formatISO } from 'date-fns';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { useSelector, useDispatch } from 'react-redux';
import { updateSettingsState } from '../../../Redux/slices/settingsSlice';
import { updateMessagingState } from '../../../Redux/slices/messagingSlice';
import { SETTINGS_TYPES, MESSAGING_TYPES } from '../../../Utils/variables';

const MessageScheduler = () => {
  const [days, setDays] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [hours, setHours] = useState(0);
  const [formattedDate, setFormattedDate] = useState('');
  const [scheduleAlert, setScheduleAlert] = useState(false);

  const checkScheduleMessages = useSelector(state => state.settingsStructure.checkScheduleMessages)
  const scheduledDate = useSelector(state => state.messagingStructure.scheduledDate)

  const dispatch = useDispatch()

  useEffect(() => {
    const targetDate = addMinutes(addHours(addDays(new Date(), days), hours), minutes);
    const minDate = addMinutes(new Date(), 15);
    const maxDate = addDays(new Date(), 7);
    const newFormattedDate = format(targetDate, "yyyy-MM-dd HH:mm:ss");
    const form = "yyyy-MM-dd HH:mm:ss"
    const parsedDate = parse(newFormattedDate, form, new Date());
    const isoFormattedDate = formatISO(parsedDate);
    dispatch(updateMessagingState({
      type: MESSAGING_TYPES.SCHEDULED_DATE,
      value: isoFormattedDate
    }))
  }, [days, minutes, hours ]);

  const handleScheduleSwitchChange = (e) => {
    dispatch(updateSettingsState({
      type: SETTINGS_TYPES.SCHEDULE_SWITCH,
      value: e.target.checked
    }))

    if (!e.target.checked){
      dispatch(updateMessagingState({
        type: MESSAGING_TYPES.SCHEDULED_DATE,
        value: ""
      }))
    }
  }

  return (
    <Box mt={1}>
        <FormControlLabel control={<Switch checked={checkScheduleMessages} onChange={handleScheduleSwitchChange} />} label="Schedule Message" />
        <IconButton onClick={() => setScheduleAlert(scheduleAlert ? false : true)}>
            <HelpOutlineIcon/>
          </IconButton>
          { scheduleAlert &&
            (<Alert severity="info">
            You can schedule the time to send the messages within specific time ranges. Learn more <a href="https://www.twilio.com/docs/messaging/features/message-scheduling" target="_blank">here</a>
            </Alert>)
          }
        {checkScheduleMessages && (
          <div>
            <TextField
              label="Days"
              type="number"
              value={days}
              onChange={(e) => setDays(parseInt(e.target.value))}
            />
            <TextField
              label="Hours"
              type="number"
              value={hours}
              onChange={(e) => setHours(parseInt(e.target.value))}
            />
            <TextField
              label="Minutes"
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(parseInt(e.target.value))}
            />
            <TextField
              label="Date to send"
              value={scheduledDate}
              InputProps={{
                readOnly: true,
              }}
            />
          </div>
        )}
    </Box>
  );
};

export default MessageScheduler;
