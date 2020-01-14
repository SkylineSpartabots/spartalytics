import { createMuiTheme } from '@material-ui/core/styles';
import { red } from '@material-ui/core/colors';

// Create a theme instance.
const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#335A40',
    },
    secondary: {
      main: '#ffffff',
    },
    error: {
      main: red.A400,
    },
    background: {
      default: '#ffffff',
    },
  },
});

export default theme;
