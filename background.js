/*
     Storage
*/

chrome.runtime.onInstalled.addListener(async details => {
  // Check if the extension was just installed
  if (details.reason === 'install') {
    try {
      // Set the initial data when the extension is installed
      await setStorageData({ data: {} });
      console.info('Extension installed. Initial data set.');
    } catch (error) {
      console.error('Error setting initial data:', error.message);
    }
  }
});

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
      Helpers
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
     Main Functionality
*/

let timeInterval;

// Increment the time given the domain
async function incrementTime() {
  const { domain } = await getStorageData('domain');

  if (domain){
    const { data } = await getStorageData('data');

  
    if (data[domain]){
      data[domain] = data[domain] + 1;
    } else {
      data[domain] = 1;
    }
  
    await setStorageData({ data: data });
    await setStorageData({ domain: [domain] });

    console.debug(`${domain} - ${data[domain]}`);
  } else {
    console.debug("Domain is null!");
  }
}


async function startTimer() {
  // reset 
  clearInterval(timeInterval);

  // start
  timeInterval = setInterval(incrementTime, 1000);
}

// Function to log information about the active tab with a timestamp
async function logActiveTabInfo(tabId) {
  //const { data } = await getStorageData('data');
  browser.tabs.get(tabId, async function (tab) {
    if (tab) {
      let url = new URL(tab.url);
      let domain = url.hostname;

      await setStorageData({ domain: [domain] });

      console.debug(`---- ${domain} ----`);
      startTimer(domain);
    }
  });
}

/*
     Listeners
*/

// Add an event listener for tab activation
browser.tabs.onActivated.addListener(function (activeInfo) {
  // Log information about the newly activated tab
  logActiveTabInfo(activeInfo.tabId);
});

// Add an event listener for tab updates
browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  // Check if the URL has changed
  if (changeInfo.url) {
    // Log information about the updated tab
    logActiveTabInfo(tabId);
  }
});