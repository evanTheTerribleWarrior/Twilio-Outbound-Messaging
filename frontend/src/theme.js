import { red } from '@mui/material/colors';
import { createTheme } from '@mui/material/styles';
import { spacing } from '@mui/system';

// A custom theme for this app
const theme = createTheme({
  palette: {
    primary: {
      main: '#556cd6',
    },
    secondary: {
      main: '#19857b',
    },
    error: {
      main: red.A400,
    },
  },

  
});

export default theme;
