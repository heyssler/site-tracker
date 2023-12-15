/*
      Charts
*/

async function drawTodaysPieChart(){
  const numEntries = 5;

  const { data } = await getStorageData('data');
  const topEntriesByDate = await getTopEntriesByDate(data, numEntries, DATE_NOW);
  if (!topEntriesByDate){ return; } // exit if no data

  const xValues = [];
  const yValues = [];

  topEntriesByDate.forEach(entry => {
    xValues.push(entry);
    yValues.push(data[DATE_NOW][entry]);
  });

  const chartData = {
    labels: xValues,
    datasets: [{
      backgroundColor: barColors,
      data: yValues
    }]
  };
  
  const chartConfig = {
    type: "doughnut",
    data: chartData,
    options: {
      tooltips: {
        enabled: true,
        callbacks: {
          label: function(tooltipItem, data) {
            let label = displayTime(convertTime(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]));
            return label;
          }
        }
      },
      legend: { display: true, position: 'right' },
      title: { display: true, text: 'Top sites today', fontSize: 30 },
    }
  };
  
  new Chart("todaysPieChart", chartConfig);
}

async function drawMostVisitedSitesChart(){
  const numEntries = 10;

  const { data } = await getStorageData('data');
  // don't try to draw if no data available
  let topSites = {};

  const xValues = [];
  const yValues = [];

  // find top sites of all time
  const dates = Object.keys(data); // return all available dates
  if (dates.length === 0 ){ return; }  // exit if no data available

  dates.forEach( date => { // iterate over each date, and add up time spent for each site
    const sites = data[date];
    for (let site in sites){
      if (topSites[site]){
        topSites[site] += data[date][site];
      } else {
        topSites[site] = data[date][site];
      }
    };
  });
  console.log("these are my topSites", topSites);

  // Convert the object to an array of [key, value] pairs
  let topSitesSortedArray = Object.entries(topSites);
  // Sort the array based on the values in descending order
  topSitesSortedArray.sort((a, b) => b[1] - a[1]);

  console.log("and my topSitesSortedArray", topSitesSortedArray);
  console.log("and my topSitesSortedArray[i][0]", topSitesSortedArray[0][0]);



  for (let i = 0; i < Math.min(numEntries, topSitesSortedArray.length); i++){
    xValues.push(topSitesSortedArray[i][0])
    yValues.push(topSitesSortedArray[i][1])
  }

  const chartData = {
    labels: xValues,
    datasets: [{
      label: '',
      data: yValues,
      fill: false,
      backgroundColor: barColors,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };
  
  const chartConfig = {
    type: 'bar',
    data: chartData,
    options: {
      legend: { display: false },
      title: { display: true, text: 'Most visited sites of all time', fontSize: 30 },
      scales: {
        yAxes: [{
          ticks: {
            callback: function(value) {
              // convert s to hours
              return Math.floor(value / 60 / 60) + 'h';
            }
          },
          scaleLabel: {
            display: true,
            labelString: 'Time Spent (hours)'
          }
        }]
      },
      tooltips: {
        enabled: true,
        callbacks: {
          label: function(tooltipItem, data) {
            let label = displayTime(convertTime(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]));
            return label;
          }
        }
      }
    },
  };
  
  const ctx = document.getElementById('mostVisitedSitesChart').getContext('2d');
  new Chart(ctx, chartConfig);
}

/*
      Listeners
*/


document.addEventListener('DOMContentLoaded', async function() {
    drawMostVisitedSitesChart();
    drawTodaysPieChart();
});

/*
      Globals
*/

const DATE_NOW = getDateFormatted(new Date());

const barColors = [
  "#8EC3A7",
  "#DC5356",
  "#F0CB69",
  "#5FB7E5",
  "#AB91C5",
  "#6A8E9F",
  "#E38A8E",
  "#B5A769",
  "#6E9FCB",
  "#C5ABD3"
];

