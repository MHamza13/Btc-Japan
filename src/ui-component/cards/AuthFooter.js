// material-ui
import { Link, Typography, Stack } from '@mui/material';

// ==============================|| FOOTER - AUTHENTICATION 2 & 3 ||============================== //

const AuthFooter = () => (
  <Stack direction="row" justifyContent="space-between">
    <Typography variant="subtitle2" component={Link} href="#" target="_blank" underline="hover">
      ordermanagement.io
    </Typography>
    <Typography variant="subtitle2" component={Link} href="#" target="_blank" underline="hover">
      &copy; ordermanagement.io
    </Typography>
  </Stack>
);

export default AuthFooter;
