/*
        Manage Storage
*/

const getStorageData = key =>
  new Promise((resolve, reject) =>
    chrome.storage.sync.get(key, result =>
      chrome.runtime.lastError
        ? reject(Error(chrome.runtime.lastError.message))
        : resolve(result)
    )
  )

const setStorageData = data =>
  new Promise((resolve, reject) =>
    chrome.storage.sync.set(data, () =>
      chrome.runtime.lastError
        ? reject(Error(chrome.runtime.lastError.message))
        : resolve()
    )
  )

/*
        Time conversion
*/

// Convert seconds to days, hours, minutes, and seconds
function convertTime(seconds) {
    const d = Math.floor(seconds / (24 * 3600));
    const h = Math.floor((seconds % (24 * 3600)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
  
    return { d, h, m, s };
}
  
// Display time in a nice format. Expected input is from above function
function displayTime(time) {
    const units = ['d', 'h', 'm', 's'];
    let timeString = '';
  
    for (const unit of units) {
      if (time[unit] > 0 || timeString !== '') {
        timeString += time[unit] + unit;
      }
    }
  
    return timeString;
}

// Ingest a Date(), and return a date string in MM/dd/YYYY format
function getDateFormatted(date){
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // note: Months are zero-indexed (0-11)
  const day = date.getDate();
  const formattedDate = month + '/' + day + '/' + year;

  return formattedDate;
}

/*
        Tab information
*/

function getTabInfo(tabId) {
    return new Promise((resolve, reject) => {
      chrome.tabs.get(tabId, (tab) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve(tab);
        }
      });
    });
}

/*
      Process data
*/

async function getTopEntriesByDate(data, numEntries, date){  
  if (data[date]) {
    // Convert the object to an array of [key, value] pairs
    const dataArray = Object.entries(data[date]);
    // Sort the array based on the values in descending order
    dataArray.sort((a, b) => b[1] - a[1]);
    // Extract the top entries
    return dataArray.slice(0, numEntries).map(entry => entry[0]);
  } else {
    return null;
  }
}