document.addEventListener('DOMContentLoaded', async function() {

  async function updateContent(){
    const { data } = await getStorageData('data');
    const { domain } = await getStorageData('domain');

    // Find the <span> element corresponding to the domain
    for (const span of document.querySelectorAll("span")) {
      if (span.id === (`${domain}`)) {
        span.textContent = displayTime(convertTime(data[domain]));
      }
    }
  }

  async function drawContent(){
    const { data } = await getStorageData('data');
    const numEntries = 10;
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
          // Add a click event listener to open the link in a new tab
          a.addEventListener('click', function () {
            chrome.tabs.create({ url: 'http://' + entry });
          });
    
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
    // Get the data
    const { data } = await getStorageData('data');
    const numEntries = 10;


    // Colors for each slice
    const colors = ['#E0CA3C', '#C8C344', '#AFBC4B', '#97B553', '#7EAE5B', '#66A662', '#4D9F6A', '#359872', '#1C9179', '#048A81'];

    // Get the canvas element
    const canvas = document.getElementById('pieChart');
    const context = canvas.getContext('2d');
    const pieInfo = document.getElementById('pieInfo');

    // Get an array of the top N values
    const dataArray = Object.entries(data).sort((a, b) => b[1] - a[1]);
    const topEntries = dataArray.slice(0, numEntries).map(entry => entry[0]);
    const total = topEntries.reduce((acc, entry) => acc + data[entry], 0);
    const totalFormatted = displayTime(convertTime(total));

    pieInfo.textContent = `${totalFormatted}`;

    let currentAngle = 0;
    let i = 0;
    topEntries.forEach(entry => {
      let portionAngle = (data[entry] / total) * 2 * Math.PI;

      context.beginPath();
      context.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, currentAngle, currentAngle + portionAngle);
      currentAngle += portionAngle;
      context.lineTo(canvas.width / 2, canvas.height / 2);
      // fill in the slices
      context.fillStyle = colors[i];
      //context.closePath();
      context.fill();
      i++;
    });

  }

  /*
        Function calls
  */


  const drawContentPromise = new Promise((resolve) => {
    drawContent();
    drawPieChart();
    resolve();
  });

  await drawContentPromise;

  setInterval(updateContent, 1000);
});