/*
      Logical functions
*/

async function getTopEntries(data, numEntries){  
  if (data) {
    // Convert the object to an array of [key, value] pairs
    const dataArray = Object.entries(data);
    // Sort the array based on the values in descending order
    dataArray.sort((a, b) => b[1] - a[1]);
    // Extract the top entries
    return dataArray.slice(0, numEntries).map(entry => entry[0]);
  } else {
    return null;
  }
}

/*
      Display functions
*/
async function updateContent(){
  const numEntries = 10;
  const { data } = await getStorageData('data');
  const topEntries = await getTopEntries(data, numEntries);

  const liElements = document.querySelectorAll('li');

  i = 0;

  // update the current list elements with the top entries
  liElements.forEach(li => {
    const a = li.querySelector('a');
    const span = li.querySelector('span');

    let entry = topEntries[i];

    a.textContent = entry;
    a.href = 'http://' + entry;

    const totalTime = convertTime(data[entry]);
    const totalTimeString = displayTime(totalTime);
    span.textContent = totalTimeString;
    span.id = entry;
    i++;
  });

  // add more entries if needed
  var entryList = document.getElementById('entryList');
  for (i; i < topEntries.length; i++){
    let entry = topEntries[i];
    var li = document.createElement('li');
    var a = document.createElement('a');
    var span = document.createElement('span');
    

    a.textContent = entry;
    a.href = 'http://' + entry;

    const totalTime = convertTime(data[entry]);
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
  const topEntries = await getTopEntries(data, numEntries);

  if (topEntries) {
    var entryList = document.getElementById('entryList');

    topEntries.forEach(entry => {
      if (!(entry === "")){
        var li = document.createElement('li');
        var a = document.createElement('a');
        var span = document.createElement('span');
        

        a.textContent = entry;
        a.href = 'http://' + entry;

        const totalTime = convertTime(data[entry]);
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
    
    if (topEntries.length === 0){
      var infoDiv = document.getElementById('entryList');
      infoDiv.textContent = "Start browsing the web to see data!";
    } else {
      console.debug(`Top ${numEntries} entries: ${topEntries}`);
      updateTotalTime(data);
    }
  } else {
      console.error('No data found. This may be an issue with initialization.');
  }
}

async function updateTotalTime(data){
  const totalTimeElement = document.getElementById('totalTime');

  const dataArray = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const total = dataArray.map(entry => entry[0]).reduce((acc, entry) => acc + data[entry], 0);

  const totalFormatted = displayTime(convertTime(total));
  totalTimeElement.textContent = `${totalFormatted}`;
}

async function drawPieChart(){
  const numEntries = 5;

  const { data } = await getStorageData('data');
  const topEntries = await getTopEntries(data, numEntries);

  const xValues = [];
  const yValues = [];

  // Populate xValues and yValues arrays
  topEntries.forEach(entry => {
    xValues.push(entry);
    yValues.push(data[entry]);
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
  const { data } = await getStorageData('data');

  // Add an onclick event handler to the button
  button.onclick = async function() {
      // Actions to perform when the button is clicked
      console.log('Button clicked!');
      for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
            const value = data[key];
            console.log(`Key: ${key}, Value: ${value}`);
            data[key] = value + Math.floor(Math.random() * 10000);;
        }
      }
      await setStorageData({ data: data });
      browser.tabs.create({ url: '/details/details.html' });
  };

}

/*
      Listeners
*/

document.addEventListener('DOMContentLoaded', async function() {
  drawContent();
  drawPieChart();
  handleButton();
  setInterval(updateContent, 1000);
});