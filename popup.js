document.addEventListener('DOMContentLoaded', async function () {
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
      var li = document.createElement('li');
      var a = document.createElement('a');
      var span = document.createElement('span');
      
      a.href = entry;
      a.textContent = entry;

      const totalTime = convertTime(Math.floor(data[entry] / 1000));
      const totalTimeString = displayTime(totalTime);
      span.textContent = totalTimeString;

      li.appendChild(a);
      li.appendChild(span);
      entryList.append(li);

    });

    console.log('Top 5 entries based on value:', topEntries);
  } else {
      console.error('No data found in storage for the specified entry');
  }
});
