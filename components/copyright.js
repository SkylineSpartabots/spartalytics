import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

function Copyright() {
    return (
      <Typography variant="body2" color="textSecondary" align="center">
        {'Copyright © '}
        <Link color="inherit" href="https://spartabots.org/" target="_blank">Spartabots <strong>2976</strong></Link> | Dashboard made with ❤ by Jake Harper
      </Typography>
    );
  }

export default Copyright;