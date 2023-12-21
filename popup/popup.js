/*
      Display functions
*/

async function updateContent(){
  const numEntries = 10;
  const { data } = await getStorageData('data');
  const topEntriesByDate = await getTopEntriesByDate(data, numEntries, DATE);
  const liElements = document.querySelectorAll('li');

  if (!topEntriesByDate){ 
    console.debug("No Entries Found");

    liElements.forEach(li => {
      li.remove();
    });

    updateTotalTime(null);
    return; 
  }

  i = 0;

  // update the current list elements with the top entries
  liElements.forEach(li => {
    const a = li.querySelector('a');
    const span = li.querySelector('span');

    let entry = topEntriesByDate[i];

    a.textContent = entry;
    a.href = 'http://' + entry;

    const totalTime = convertTime(data[DATE][entry]);
    const totalTimeString = displayTime(totalTime);
    span.textContent = totalTimeString;
    span.id = entry;

    i++;
  });

  // add more entries if needed
  var entryList = document.getElementById('entryList');
  for (i; i < topEntriesByDate.length; i++){
    let entry = topEntriesByDate[i];
    var li = document.createElement('li');
    var a = document.createElement('a');
    var span = document.createElement('span');
    

    a.textContent = entry;
    a.href = 'http://' + entry;

    const totalTime = convertTime(data[DATE][entry]);
    const totalTimeString = displayTime(totalTime);
    span.textContent = totalTimeString;
    span.id = entry;

    li.appendChild(a);
    li.appendChild(span);

    entryList.append(li);
  }

  updateTotalTime(data);
}

async function updateTotalTime(data){
  const totalTimeElement = document.getElementById('totalTime');

  if (!data){
    totalTimeElement.style.display = 'None'
  } else {
    const dataArray = Object.entries(data[DATE]).sort((a, b) => b[1] - a[1]);
    const total = dataArray.map(entry => entry[0]).reduce((acc, entry) => acc + data[DATE][entry], 0);
  
    const totalFormatted = displayTime(convertTime(total));
    totalTimeElement.textContent = `${totalFormatted}`;
    totalTimeElement.style.display = ''
  }
}

/*
      Buttons
*/
async function handleMoreDetailsButton(){
  // Get the button element by its ID
  const button = document.getElementById('developerButton');

  // Add an onclick event handler to the button
  button.onclick = async function() {
    browser.tabs.create({ url: '/details/details.html' });
  }
}

async function handleTimeNavButtons(){
  // Backwards 1 day
  const b_button = document.getElementById('timenav-backward-btn');
  b_button.onclick = async function() {
    DATE = manipulateDate(DATE, "subtract");
    updateTimeNav();
    updateContent();
    updateChart();
  }

  // Forwards 1 day
  const f_button = document.getElementById('timenav-forward-btn');
  f_button.onclick = async function() {
    DATE = manipulateDate(DATE, "add");
    updateTimeNav();
    updateContent();
    updateChart();
  }
}

async function updateTimeNav(){
  const timeNavElement = document.getElementById('timenav-time');
  timeNavElement.textContent = DATE;
}

/*
      Pie Chart
*/

async function updateChart() {
  const numEntries = 5;

  const { data } = await getStorageData('data');
  const topEntriesByDate = await getTopEntriesByDate(data, numEntries, DATE);

  const chart = document.getElementById('pieChart');

  if (!topEntriesByDate){ 
    // don't try to draw/update, just hide and return
    chart.style.display = 'none';
    return; 
  } else {
    // gather data for the chart
    chart.style.display = '';

    const xValues = [];
    const yValues = [];
  
    // Populate xValues and yValues arrays
    topEntriesByDate.forEach(entry => {
      xValues.push(entry);
      yValues.push(data[DATE][entry]);
    });
  
    CHART_DATA = {
      labels: xValues,
      datasets: [{
        backgroundColor: barColors,
        data: yValues
      }]
    };

    if (!CHART){
      // draw the chart for the first time
      CHART = new Chart("pieChart", {
        type: "doughnut",
        data: CHART_DATA,
        options: CHART_OPTIONS,
      });
    } else {
        //update the existing chart
        CHART.data = CHART_DATA;
    }
    CHART.update();
  }
}

/*
      Globals
*/

let DATE = getDateFormatted(new Date());
let CHART = null;
let CHART_DATA = null;
let CHART_OPTIONS = {
  tooltips: {
    enabled: true,
    callbacks: {
      label: function(tooltipItem, data) {
        let label = displayTime(convertTime(data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index]));
        return label;
      }
    }
  },
  legend: { display: true, position: 'right' }
}
const barColors = [
  "#8EC3A7",
  "#DC5356",
  "#F0CB69",
  "#5FB7E5",
  "#AB91C5"
];

/*
      Listeners
*/

document.addEventListener('DOMContentLoaded', async function() {
  updateContent();
  updateChart();

  handleTimeNavButtons();
  updateTimeNav();

  handleMoreDetailsButton();

  setInterval(updateContent, 1000);
});

/*
      Debug
*/

async function loadRandomData(){
  const { data } = await getStorageData('data');

  // get a random day.
  for (i = 2; i < 9; i++){
    date = `12/1${i}/2023`;
    for (j = 40; j < 50; j++){
      domain = `www.somesite.${j}`;
      value = Math.floor(Math.random() * 10000);

      if (!data[date]){
        data[date] = {};
      }

      data[date][domain] = value;

    }
  }
  await setStorageData({ data: data });
  console.log(`[popup]\n[randomizer]`, data);
}