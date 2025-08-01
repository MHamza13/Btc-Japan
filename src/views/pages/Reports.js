import React, {useState} from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import TabContext from '@mui/lab/TabContext';
import TabList from '@mui/lab/TabList';
import TabPanel from '@mui/lab/TabPanel';
import CustomerReport from './CustomerReport';
import VendorReport from './VendorReport';
import AvailabilityReport from './AvailabilityReport';
import PurchaseCountryReport from './PurchaseCountryReport';
import SaleCountryReport from './SaleCountryReport';
// import logo from './../../assets/images/logo.png';








function Reports(){
    const [value, setValue] = useState('1');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return(<>
        <h1>Reports</h1>
        <Box className='tab-box' sx={{ width: '100%', typography: 'body1' }}>
            <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList onChange={handleChange} aria-label="lab API tabs example">
                        <Tab label="By Customer" value="1" />
                        <Tab label="By Vendor" value="2" />
                        <Tab label="By Purchase Country" value="3" />
                        <Tab label="By Sales Country " value="4" />
                        {/* <Tab label="By Purchase Currency" value="5" />
                        <Tab label="By Sales Currency" value="6" /> */}
                        <Tab label="By Availability" value="7" />
                    </TabList>
                </Box>
                <TabPanel value="1" style={{padding: 0}}>
                    <CustomerReport />
                </TabPanel>
                <TabPanel value="2" style={{padding: 0}}>
                    <VendorReport />
                </TabPanel>
                <TabPanel value="3" style={{padding: 0}}>
                    <PurchaseCountryReport />
                </TabPanel>
                <TabPanel value="4" style={{padding: 0}}>
                    <SaleCountryReport />
                </TabPanel>
                {/* <TabPanel value="5" style={{padding: 0}}>Item Three</TabPanel>
                <TabPanel value="6" style={{padding: 0}}>Item Three</TabPanel> */}
                <TabPanel value="7" style={{padding: 0}}>
                    <AvailabilityReport />
                </TabPanel>
            </TabContext>
        </Box>
    </>);
}





export default Reports;