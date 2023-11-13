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
  const { data } = await getStorageData('data');


  if (data[domain]){
    data[domain] = data[domain] + 1;
  } else {
    data[domain] = 1;
  }

  await setStorageData({ data: data });
  await setStorageData({ domain });

  console.debug(`${domain} - ${data[domain]}`);
}


async function startTimer() {
  // Create a promise for clearing the interval
  const clearIntervalPromise = new Promise((resolve) => {
    clearInterval(timeInterval);
    resolve();
  });

  // Wait for the interval to be cleared before starting a new one
  await clearIntervalPromise;

  // start
  timeInterval = setInterval(incrementTime, 1000);
}

// Function to log information about the active tab with a timestamp
async function logActiveTabInfo(tabId) {
  //const { data } = await getStorageData('data');
  chrome.tabs.get(tabId, async function (tab) {
    if (tab) {
      let url = new URL(tab.url);
      let domain = url.hostname;

      await setStorageData({ domain });

      console.debug(`---- ${domain} ----`);
      if (!(domain === "")){
        startTimer(domain);
      } else {
        clearInterval(timeInterval);
      }

    }
  });
}

/*
     Listeners
*/

// Listener for tab activation
chrome.tabs.onActivated.addListener(function (activeInfo) {
  // Log information about the newly activated tab
  logActiveTabInfo(activeInfo.tabId);
});

// Listener for tab updates
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
  // Check if the URL has changed
  if (changeInfo.url) {
    // Log information about the updated tab
    logActiveTabInfo(tabId);
  }
});

// Listen for window focus change
chrome.windows.onFocusChanged.addListener(function(windowId) {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    console.log("No focused window.");
  } else {
    // Get the active tab in the focused window
    chrome.tabs.query({ active: true, windowId: windowId }, function(tabs) {
      if (tabs.length > 0) {
        logActiveTabInfo(tabs[0].id);
      }
    });
  }
});
