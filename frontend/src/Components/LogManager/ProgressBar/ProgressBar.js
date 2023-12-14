import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { LinearProgress, Box, Typography } from '@mui/material';
import throttle from 'lodash/throttle';

const ProgressBar = () => {
    
  const csvDataLength = useSelector((state) => state.csvDataStructure.csvData.length);
  const progressBarCount = useSelector((state) => state.actionStructure.progressBarCount);
  const [completionPercentage, setCompletionPercentage] = useState(0);

  const throttledSetCompletionPercentage = useCallback(throttle((percentage) => {
    setCompletionPercentage(percentage);
  }, 100), []);

  useEffect(() => {
    const newPercentage = csvDataLength > 0 
      ? (progressBarCount / csvDataLength) * 100 
      : 0;
    throttledSetCompletionPercentage(newPercentage);
  }, [progressBarCount, csvDataLength, throttledSetCompletionPercentage]);
  
    return (
      <Box display="flex" alignItems="center">
        <Box width="100%" mr={1}>
          <LinearProgress variant="determinate" value={completionPercentage} sx= {{ height: '10px'}} />
        </Box>
        <Box minWidth={35}>
          <Typography variant="body2" color="textSecondary">{`${Math.round(completionPercentage)}%`}</Typography>
        </Box>
      </Box>
    );
  }

  export default ProgressBar;
  