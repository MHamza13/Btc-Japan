import PropTypes from 'prop-types';
import { useState } from 'react';
import { useSelector } from 'react-redux';

// material-ui
import { useTheme } from '@mui/material/styles';
import { Grid, Typography } from '@mui/material';

// third-party
// import ApexCharts from 'apexcharts';
import Chart from 'react-apexcharts';

// project imports
import SkeletonTotalGrowthBarChart from 'ui-component/cards/Skeleton/TotalGrowthBarChart';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';
import DateRangePicker from '@wojtekmaj/react-daterange-picker';
import '@wojtekmaj/react-daterange-picker/dist/DateRangePicker.css';
import 'react-calendar/dist/Calendar.css';

// chart data
// import chartData from './chart-data/total-growth-bar-chart';



// ==============================|| DASHBOARD DEFAULT - TOTAL GROWTH BAR CHART ||============================== //

const TotalGrowthBarChart = (props, { isLoading }) => {
  const theme = useTheme();
  // const customization = useSelector((state) => state.customization);
  const perChartList = useSelector((state) => state.dashboard.sChartList);
  const currentYear = new Date().getFullYear(); // Get the current year
  // Set startDate to the first month of the current year
  const initialStartDate = new Date(currentYear, 0);
  // Set endDate to the last month of the next year
  const initialEndDate = new Date(currentYear, 11);
  const [datevalue, setDateValue] = useState([initialStartDate, initialEndDate]);

  const dateHandelChange = (e) =>{
    setDateValue(e);
    props.setSalesChartDate(e);
  }
  // console.log(datevalue)


  // const { navType } = customization;
  const { primary } = theme.palette.text;
  // const darkLight = theme.palette.dark.light;
  const grey200 = theme.palette.grey[200];
  const grey500 = theme.palette.grey[500];

  const primary200 = theme.palette.primary[200];
  const primaryDark = theme.palette.primary.dark;
  const secondaryMain = theme.palette.secondary.main;
  const secondaryLight = theme.palette.secondary.light;

  const totalPurchasesArray = perChartList.map(item => item.totalSales.toString());
  const purchaseMonthArray = perChartList.map(item => {
  const date = new Date(item.saleMonth);
  const month = new Intl.DateTimeFormat('en', { month: 'short' }).format(date);
    return month;
  });

  const chartData = {
    height: 480,
      type: 'bar',
      options: {
        chart: {
          id: 'bar-chart',
          stacked: true,
          toolbar: {
            show: true
          },
          zoom: {
            enabled: true
          }
        },
        responsive: [
          {
            breakpoint: 480,
            options: {
              legend: {
                position: 'bottom',
                offsetX: -10,
                offsetY: 0
              }
            }
          }
        ],
        plotOptions: {
          bar: {
            horizontal: false,
            columnWidth: '50%'
          }
        },
        xaxis: {
          type: 'category',
          categories: purchaseMonthArray
        },
        legend: {
          show: true,
          fontSize: '14px',
          fontFamily: `'Roboto', sans-serif`,
          position: 'bottom',
          offsetX: 20,
          labels: {
            useSeriesColors: true
          },
          markers: {
            width: 16,
            height: 16,
            radius: 5
          },
          itemMargin: {
            horizontal: 15,
            vertical: 8
          }
        },
        fill: {
          type: 'solid'
        },
        dataLabels: {
          enabled: false
        },
        grid: {
          show: true
        }
      },
      series: [
        {
          name: 'Sales',
          data: totalPurchasesArray
        }
      ],
      colors: [primary200, primaryDark, secondaryMain, secondaryLight],
      xaxis: {
        labels: {
          style: {
            colors: [primary, primary, primary, primary, primary, primary, primary, primary, primary, primary, primary, primary]
          }
        }
      },
      yaxis: {
        labels: {
          style: {
            colors: [primary]
          }
        }
      },
      grid: {
        borderColor: grey200
      },
      tooltip: {
        theme: 'light'
      },
      legend: {
        labels: {
          colors: grey500
        }
      }
  };


  return (
    <>
      {isLoading ? (
        <SkeletonTotalGrowthBarChart />
      ) : (
        <MainCard>
          <Grid container spacing={gridSpacing}>
            <Grid item xs={12}>
              <Grid container alignItems="center" justifyContent="space-between">
                <Grid item>
                  <Grid container direction="column" spacing={1}>
                    <Grid item>
                      <Typography variant="h2">Sales</Typography>
                    </Grid>
                    <Grid item>
                      {/* <Typography variant="h3">$2,324.00</Typography> */}
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item style={{position: 'relative'}}>
                  <DateRangePicker onChange={dateHandelChange} value={datevalue} />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Chart {...chartData} />
            </Grid>
          </Grid>
        </MainCard>
      )}
    </>
  );
};

TotalGrowthBarChart.propTypes = {
  isLoading: PropTypes.bool,
  setSalesChartDate: PropTypes
};

export default TotalGrowthBarChart;
