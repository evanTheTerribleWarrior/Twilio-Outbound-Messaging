import { FormControl, Grid } from '@mui/material';
import React from 'react';
import { useSelector } from 'react-redux';
import AccordionTemplate from '../AccordionTemplate/AccordionTemplate';
import CampaignTable from '../CampaignTable/CampaignTable';
import ChannelSelection from '../ChannelSelection/ChannelSelection';
import CheckAndSend from '../CheckAndSend/CheckAndSend';
import FileLoader from '../FileLoader/FileLoader';
import Logs from '../LogManager/Logs';
import MessageBuilder from '../MessageBuilder/MessageBuilder';
import MessageOptions from '../MessageOptions/MessageOptions';
import NumberColumnSelection from '../NumberColumnSelection/NumberColumnSelection';
import ResultsExports from '../ResultsExport/ResultsExport';
import SenderBuilder from '../SenderBuilder/SenderBuilder';
import Settings from '../Settings/Settings';

const MainBuilder = () => {
  const csvColumnFields = useSelector((state) => state.csvDataStructure.csvColumnFields);
  const csvData = useSelector((state) => state.csvDataStructure.csvData);

  //useSelector((state) => console.log(state))

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

            <AccordionTemplate title="Message Options">
              <MessageOptions/>
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