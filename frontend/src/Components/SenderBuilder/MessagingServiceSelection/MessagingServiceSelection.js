import React, { useState, useEffect } from 'react';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import {CircularProgress} from '@mui/material';
import { MenuItem } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { fetchServices } from '../../../Utils/functions';
import { updateMessagingState } from '../../../Redux/slices/messagingSlice';
import { MESSAGING_TYPES } from '../../../Utils/variables';

  const MessagingServiceSelection = () => {

    const senderTypeSelection = useSelector(state => state.messagingStructure.senderTypeSelection)
    const dispatch = useDispatch()

    const [selectedService, setSelectedService] = useState("")
    const [services_array, setServicesArray] = useState([]);
    const [stateUpdateValues, setStateUpdateValues] = useState({submitting: false, getServicesCompleted: false, error: false, showServicesLoadingIcon: false})
    const [showLoadingIcon, setLoadingIcon] = useState(false)
    const [sender, setSender] = useState("")

    const listAllServices = async () => {

      setLoadingIcon(true)
      setStateUpdateValues({ submitting: true, getServicesCompleted: false, error: false, showServicesLoadingIcon: true });
      try {
        const data = await fetchServices();
        setStateUpdateValues({
          submitting: false,
          showLoadingIcon: false,
          getServicesCompleted: true
        });
        setServicesArray(data.data.services_array)
        setLoadingIcon(false)
      } catch (error) {
        console.error('Error fetching templates:', error);
        setStateUpdateValues({
          submitting: false,
          showLoadingIcon: false,
          getServicesCompleted: true
        });
      }

    }

    useEffect(() => {
      if(senderTypeSelection === "Messaging Service"){
        listAllServices();
      }
      else {
        cleanValues()
      }
    }, [senderTypeSelection]);

    const cleanValues = () => {
      setServicesArray([])
      setSelectedService("")
      setLoadingIcon(false)
      setStateUpdateValues({getServicesCompleted: false})
      dispatch(updateMessagingState({
        type: MESSAGING_TYPES.SELECTED_SERVICE,
        value: null
      }))
    }


    function handleSelectedService(event) {
      setSelectedService(event.target.value)
      dispatch(updateMessagingState({
        type: MESSAGING_TYPES.SELECTED_SERVICE,
        value: event.target.value
      }))
    }

    function handleSetSender(event) {
      setSender(event.target.value)
    }

    return (<>
      {
                  showLoadingIcon ?

                  (<>
                    <CircularProgress size={15}/>
                    <Typography variant="h6"gutterBottom>
                      Loading Services...
                    </Typography>

                  </>) : ""
              }
      {services_array.length > 0 &&
        
          <FormControl fullWidth component="fieldset" margin="normal">
          <InputLabel id="messaging-service-select-label">Select Messaging Service</InputLabel>
          <Select labelId="messaging-service-select-label"
            value={selectedService}
            onChange={handleSelectedService}
          >
          {services_array.map((service,index) =>
            <MenuItem key={index} value={service.sid}>{service.name}</MenuItem>
          )}
          </Select>
          </FormControl>
        }
 
    </>)
}

export default MessagingServiceSelection;