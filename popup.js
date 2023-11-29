document.addEventListener('DOMContentLoaded', async function() {
  const numEntries = 10;

  async function updateContent(){
    const { data } = await getStorageData('data');
    const { domain } = await getStorageData('domain');

    // Find the <span> element corresponding to the domain
    for (const span of document.querySelectorAll("span")) {
      if (span.id === (`${domain}`)) {
        span.textContent = displayTime(convertTime(data[domain]));
      }
    }

    // Update the total time counter
    const pieInfo = document.getElementById('pieInfo');
    // Get an array of the top N values
    const dataArray = Object.entries(data).sort((a, b) => b[1] - a[1]);
    const topEntries = dataArray.slice(0, numEntries).map(entry => entry[0]);
    const total = topEntries.reduce((acc, entry) => acc + data[entry], 0);
    const totalFormatted = displayTime(convertTime(total));
    pieInfo.textContent = `${totalFormatted}`;
  }

  async function drawContent(){
    const { data } = await getStorageData('data');
    var entryList = document.getElementById('entryList');
    if (data) {
      // Convert the object to an array of [key, value] pairs
      const dataArray = Object.entries(data);
      // Sort the array based on the values in descending order
      dataArray.sort((a, b) => b[1] - a[1]);
      // Extract the top entries
      const topEntries = dataArray.slice(0, numEntries).map(entry => entry[0]);
  
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
      }
    } else {
        console.error('No data found.');
    }
  }

  async function drawPieChart(){
    // Override global numEntries
    const numEntries = 5;

    const { data } = await getStorageData('data');
    const dataArray = Object.entries(data);
    const topEntries = dataArray.slice(0, numEntries).map(entry => entry[0]);

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
      type: "pie",
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
          display: false
        }
      }
    });

    // update footer
    const total = topEntries.reduce((acc, entry) => acc + data[entry], 0);
    const totalFormatted = displayTime(convertTime(total));
    pieInfo.textContent = `${totalFormatted}`;
  }
  

  /*
        Function calls
  */


  drawContent();
  drawPieChart();
  setInterval(updateContent, 1000);

});