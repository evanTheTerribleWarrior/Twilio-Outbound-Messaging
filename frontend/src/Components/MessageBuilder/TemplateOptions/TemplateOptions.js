import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateMessagingState } from '../../../Redux/slices/messagingSlice';
import { MESSAGING_TYPES } from '../../../Utils/variables';
import Box from "@mui/material/Box";
import FormControl from "@mui/material/FormControl";
import FormGroup from '@mui/material/FormGroup';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import InputLabel from '@mui/material/InputLabel';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Menu from '@mui/material/Menu';
import { fetchTemplates } from '../../../Utils/functions';
import { styled } from '@mui/system';
import AddIcon from '@mui/icons-material/Add';

const StyledMenuItem = styled(MenuItem)({
  whiteSpace: 'normal',
});

const LoadMoreMenuItem = styled(MenuItem)({
  display: 'flex',
  justifyContent: 'center',
  color: '#007BFF',
});

const TemplateOptions = (props) => {
  const dispatch = useDispatch();
  const [templatesArray, setTemplatesArray] = useState([]);
  const [nextPageUrl, setNextPageUrl] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [showLoadingIcon, setShowLoadingIcon] = useState(false);
  const [showLoadingMoreIcon, setShowLoadingMoreIcon] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const contentTypes = {
    'twilio/text': 'Text',
    'twilio/media': 'Media',
    'twilio/call-to-action': 'Call To Action',
    'twilio/quick-reply': 'Quick Reply',
    'twilio/card': 'Card',
    'twilio/list-picker': 'List Picker',
    'whatsapp/authentication': 'Whatsapp Authentication'
  };

  const messageTypeSelection = useSelector(state => state.messagingStructure.messageTypeSelection);
  const channelSelection = useSelector(state => state.messagingStructure.channelSelection);

  useEffect(() => {
    if (messageTypeSelection === "Template") {
      fetchPaginatedTemplates(nextPageUrl, true);
    } else {
      cleanValues();
    }
  }, [messageTypeSelection, channelSelection]);

  const handleSelectedTemplate = (templateSid) => {
    setSelectedTemplate(templateSid);
    const template = templatesArray.find(template => template.sid === templateSid);
    dispatch(updateMessagingState({
      type: MESSAGING_TYPES.SELECTED_TEMPLATE,
      value: template
    }));
    handleClose();
  };

  const fetchPaginatedTemplates = async (url, isInitialFetch = false, keepOpen = false, isLoadMore = false) => {
    if (!url && !isInitialFetch) return;
    if (isLoadMore) {
      setShowLoadingMoreIcon(true);
    } else {
      setShowLoadingIcon(true);
    }
    try {
      const data = await fetchTemplates(channelSelection, url);
      setTemplatesArray((prevTemplates) => [...prevTemplates, ...data.data.templates_array]);
      setNextPageUrl(data.data.nextPageUrl);
      if (keepOpen) {
        setAnchorEl(anchorEl);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setShowLoadingIcon(false);
      setShowLoadingMoreIcon(false);
    }
  };

  const handleLoadMore = (event) => {
    event.stopPropagation();
    fetchPaginatedTemplates(nextPageUrl, false, true, true);
  };

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const cleanValues = () => {
    setTemplatesArray([]);
    setNextPageUrl("");
    setSelectedTemplate("");
    setShowLoadingIcon(false);
    dispatch(updateMessagingState({
      type: MESSAGING_TYPES.SELECTED_TEMPLATE,
      value: null
    }));
  };

  const menuItems = templatesArray.flatMap((template, index) => [
    <StyledMenuItem key={template.sid} onClick={() => handleSelectedTemplate(template.sid)}>
      <Grid container spacing={2}>
        <Grid item>
          <Typography variant="body2"><b>Name:</b> {template.name}</Typography>
        </Grid>
        <Grid item>
          <Typography variant="body2"><b>Language:</b> {template.language}</Typography>
        </Grid>
        <Grid item>
          <Typography variant="body2"><b>Type:</b> {contentTypes[Object.keys(template.content)[0]]}</Typography>
        </Grid>
      </Grid>
    </StyledMenuItem>,
    index < templatesArray.length - 1 && <Divider key={`divider-${template.sid}`} />
  ]).filter(Boolean);

  return (
    <FormGroup>
      <Box>
        {showLoadingIcon && (
          <>
            <CircularProgress size={15} />
            <Typography variant="h6" gutterBottom>
              Loading Templates...
            </Typography>
          </>
        )}
        <FormControl fullWidth component="fieldset" margin="normal">
          <InputLabel id="template-select-label">Select Template</InputLabel>
          <Select
            labelId="template-select-label"
            value={selectedTemplate}
            onClick={handleOpen}
            style={{ minWidth: '400px' }}
            displayEmpty
            inputProps={{ readOnly: true }}
          >
            <MenuItem value="" disabled>Select Template</MenuItem>
            {selectedTemplate && (
              <MenuItem value={selectedTemplate}>
                {templatesArray.find(template => template.sid === selectedTemplate)?.name || selectedTemplate}
              </MenuItem>
            )}
          </Select>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            MenuListProps={{
              onMouseLeave: handleClose
            }}
          >
            {menuItems}
            {nextPageUrl && (
              <LoadMoreMenuItem onClick={handleLoadMore} disabled={showLoadingMoreIcon}>
                {showLoadingMoreIcon ? 'Loading...' : (
                  <>
                    <AddIcon /> Load More
                  </>
                )}
              </LoadMoreMenuItem>
            )}
          </Menu>
        </FormControl>
      </Box>
    </FormGroup>
  );
};

export default TemplateOptions;
