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