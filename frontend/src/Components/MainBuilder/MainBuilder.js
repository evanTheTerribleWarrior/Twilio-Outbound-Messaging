import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Grid, FormControl} from '@mui/material';
import FileLoader from '../FileLoader/FileLoader';
import ChannelSelection from '../ChannelSelection/ChannelSelection';
import NumberColumnSelection from '../NumberColumnSelection/NumberColumnSelection';
import MessageBuilder from '../MessageBuilder/MessageBuilder';
import SenderBuilder from '../SenderBuilder/SenderBuilder';
import Logs from '../LogManager/Logs'
import CampaignTable from '../CampaignTable/CampaignTable';
import CheckAndSend from '../CheckAndSend/CheckAndSend';
import Settings from '../Settings/Settings';
import AccordionTemplate from '../AccordionTemplate/AccordionTemplate';
import ResultsExports from '../ResultsExport/ResultsExport';

const MainBuilder = () => {
  const csvColumnFields = useSelector((state) => state.csvDataStructure.csvColumnFields);
  const csvData = useSelector((state) => state.csvDataStructure.csvData);

  useSelector((state) => console.log(state))

  return (
      <Grid container spacing={3}>
        <Grid item xs={4}>
          <FormControl fullWidth>
            <FileLoader/>
            { csvColumnFields && csvColumnFields.length > 0 && <NumberColumnSelection/> }
            
            <AccordionTemplate title="Select Channel">
              <ChannelSelection/>
            </AccordionTemplate>

            <AccordionTemplate title="Build Message">
              <MessageBuilder/>
            </AccordionTemplate>

            <AccordionTemplate title="Choose Sender">
              <SenderBuilder/>
            </AccordionTemplate>

            <AccordionTemplate title="Settings">
              <Settings/>
            </AccordionTemplate>

            <AccordionTemplate title="Check and Send">
              <CheckAndSend/>
            </AccordionTemplate>

            <AccordionTemplate title="Export Results">
              <ResultsExports/>
            </AccordionTemplate>
      
          </FormControl>
        </Grid>
        <Grid item xs={8}>
          <FormControl fullWidth component="fieldset" margin="normal">
            <Logs/>
            {csvData.length > 0 && <CampaignTable csvData={csvData}/>}
          </FormControl>
        </Grid>
      </Grid>
  );
}

export default MainBuilder;