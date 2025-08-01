import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Divider, List, Typography } from '@mui/material';

// project imports
import NavItem from '../NavItem';
import NavCollapse from '../NavCollapse';
import { useSelector } from 'react-redux';

// ==============================|| SIDEBAR MENU LIST GROUP ||============================== //

const NavGroup = ({ item }) => {
  const theme = useTheme();
  const userData = useSelector((state) => state.user.user);

  // menu list collapse & items
  const items = item.children?.map((menu) => {
    switch (menu.type) {
      case 'collapse':
        return <NavCollapse key={menu.id} menu={menu} level={1} />;
      case 'item':
        return <NavItem key={menu.id} item={menu} level={1} />;
      default:
        return (
          <Typography key={menu.id} variant="h6" color="error" align="center">
            Menu Items Error
          </Typography>
        );
    }
  });

  // Check if userData exists before accessing userRole
  if (!userData) {
    return null; // Or a loading state like <Typography>Loading...</Typography>
  }

  return (
    <>
      {(userData.userRole === item.superAdmin ||
        userData.userRole === item.admin ||
        userData.userRole === item.agentStock ||
        userData.userRole === item.agentSales ||
        userData.userRole === item.mainAdmin) && (
        <>
          <List
            subheader={
              item.title && (
                <Typography variant="caption" sx={{ ...theme.typography.menuCaption }} display="block" gutterBottom>
                  {item.title}
                  {item.caption && (
                    <Typography variant="caption" sx={{ ...theme.typography.subMenuCaption }} display="block" gutterBottom>
                      {item.caption}
                    </Typography>
                  )}
                </Typography>
              )
            }
          >
            {items}
          </List>
          <Divider sx={{ mt: 0.25, mb: 1.25 }} />
        </>
      )}
    </>
  );
};

NavGroup.propTypes = {
  item: PropTypes.object
};

export default NavGroup;
