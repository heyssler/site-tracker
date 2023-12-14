/*
      Display functions
*/

async function updateContent(){
  const numEntries = 10;
  const { data } = await getStorageData('data');
  const topEntriesByDate = await getTopEntriesByDate(data, numEntries, DATE_NOW);

  const liElements = document.querySelectorAll('li');

  i = 0;

  // update the current list elements with the top entries
  liElements.forEach(li => {
    const a = li.querySelector('a');
    const span = li.querySelector('span');

    let entry = topEntriesByDate[i];

    a.textContent = entry;
    a.href = 'http://' + entry;

    const totalTime = convertTime(data[DATE_NOW][entry]);
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

    const totalTime = convertTime(data[DATE_NOW][entry]);
    const totalTimeString = displayTime(totalTime);
    span.textContent = totalTimeString;
    span.id = entry;

    li.appendChild(a);
    li.appendChild(span);

    entryList.append(li);
  }

  updateTotalTime(data);
}

async function drawContent(){
  const numEntries = 10;
  const { data } = await getStorageData('data');
  const topEntriesByDate = await getTopEntriesByDate(data, numEntries, DATE_NOW);

  if (topEntriesByDate) {
    var entryList = document.getElementById('entryList');

    topEntriesByDate.forEach(entry => {
      if (!(entry === "")){
        var li = document.createElement('li');
        var a = document.createElement('a');
        var span = document.createElement('span');
        

        a.textContent = entry;
        a.href = 'http://' + entry;

        const totalTime = convertTime(data[DATE_NOW][entry]);
        const totalTimeString = displayTime(totalTime);
        span.textContent = totalTimeString;
        span.id = entry;
  
        li.appendChild(a);
        li.appendChild(span);

        entryList.append(li);
    } else {
      console.error("Found blank entry! This may lead to issues.");
    }
    });
    
    if (topEntriesByDate.length === 0){
      var infoDiv = document.getElementById('entryList');
      infoDiv.textContent = "Start browsing the web to see data!";
    } else {
      console.debug(`[popup]\n${DATE_NOW}] Top ${numEntries} entries: ${topEntriesByDate}`);
      updateTotalTime(data);
    }
  } else {
      console.error('No data found. This may be an issue with initialization.');
  }
}

async function updateTotalTime(data){
  const totalTimeElement = document.getElementById('totalTime');

  const dataArray = Object.entries(data[DATE_NOW]).sort((a, b) => b[1] - a[1]);
  const total = dataArray.map(entry => entry[0]).reduce((acc, entry) => acc + data[DATE_NOW][entry], 0);

  const totalFormatted = displayTime(convertTime(total));
  totalTimeElement.textContent = `${totalFormatted}`;
}

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

async function handleButton(){
  // Get the button element by its ID
  const button = document.getElementById('developerButton');

  // Add an onclick event handler to the button
  button.onclick = async function() {
    browser.tabs.create({ url: '/details/details.html' });
  }
}

/*
      Globals
*/

const DATE_NOW = getDateFormatted(new Date());

/*
      Listeners
*/

document.addEventListener('DOMContentLoaded', async function() {
  drawContent();
  drawPieChart();
  handleButton();
  setInterval(updateContent, 1000);
});

/*
      Debug
*/

async function loadRandomData(){
  const { data } = await getStorageData('data');

  // get a random day.
  for (i = 2; i < 9; i++){
    date = `01/0${i}/1997`;
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