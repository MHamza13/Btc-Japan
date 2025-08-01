// material-ui
// import { useTheme } from '@mui/material/styles';

import { Link } from "react-router-dom";





const Logo = () => {
  // const theme = useTheme();
  return (
    <Link to="/">
      <img src="/logo-light.png" alt="Btc Japan Car Management" width={100}/>
    </Link>
  );
};

export default Logo;
