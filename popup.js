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

  
  const drawContentPromise = new Promise((resolve) => {
    drawContent();
    resolve();
  });

  await drawContentPromise;

  setInterval(updateContent, 1000);
});