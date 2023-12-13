/*
      Charts
*/

async function drawPieChart(){
  const numEntries = 5;

  const { data } = await getStorageData('data');
  const topEntriesByDate = await getTopEntriesByDate(data, numEntries, DATE_NOW);

  const xValues = [];
  const yValues = [];

  // Populate xValues and yValues arrays
  topEntriesByDate.forEach(entry => {
    xValues.push(entry);
    yValues.push(data[DATE_NOW][entry]);
  });

  const barColors = [
    "#8EC3A7",
    "#DC5356",
    "#F0CB69",
    "#5FB7E5",
    "#AB91C5"
  ];

  new Chart("pieChart", {
    type: "doughnut",
    data: {
      labels: xValues,
      datasets: [{
        backgroundColor: barColors,
        data: yValues
      }]
    },
    options:{
      tooltips: {
        enabled: true
      },
      legend: {
        display: true,
        position: 'right'
      }
    }
  });
}

async function drawExampleChart(){
  const labels = ['January', 'February', 'March', 'April', 'May', 'June', 'July']; // Example labels for months

  const data = {
    labels: labels,
    datasets: [{
      label: 'My First Dataset',
      data: [65, 59, 80, 81, 56, 55, 40],
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };
  
  const config = {
    type: 'line',
    data: data,
  };
  
  // Assuming you have a canvas element with id "myChart" in your HTML
  const ctx = document.getElementById('exampleChart').getContext('2d');
  const myChart = new Chart(ctx, config);
}

/*
      Listeners
*/


document.addEventListener('DOMContentLoaded', async function() {
    console.log("Opened up details.js!");
    drawExampleChart();
    drawPieChart();
});

/*
      Globals
*/

const DATE_NOW = getDateFormatted(new Date());
