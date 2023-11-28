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

  console.debug(`${domain} - ${data[domain]}`);
}

// Function to start an interval for the incrementTime() function
async function startTimer() {
  const { domain } = await getStorageData('domain');
  console.debug(`---- ${domain} ----`);
  if (!(domain === "")){
    // clear any previous intervals
    clearInterval(timeInterval);
    // start
    timeInterval = setInterval(incrementTime, 1000);
  } else {
    // don't count empty tabs
    clearInterval(timeInterval);
  }
}

// Function to log information about the active tab with a timestamp
async function logActiveTabInfo(tabId) {  
  chrome.tabs.get(tabId, async function (tab) {
    if (tab) {
      let { domain } = await getStorageData('domain');
      let url = new URL(tab.url);
      let new_domain = url.hostname;
      
      // do operations if and only if the domain has changed
      if (domain !== new_domain){
        console.debug(`${domain} --> ${new_domain}`);
        domain = new_domain;
        await setStorageData({ domain });
        await startTimer(domain);
      } else {
        console.debug(`Domain is ${domain}`);
      }
    }
  });
}

/*
     Listeners
*/

// Listener for tab activation
chrome.tabs.onActivated.addListener(async function (activeInfo) {
  console.debug("----> [Listener] tab activation");
  await logActiveTabInfo(activeInfo.tabId);
});


// Listen for window focus change
chrome.windows.onFocusChanged.addListener(async function(windowId) {
  console.debug("----> [Listener] window focus");

  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    console.log("No focused window.");
  } else {
    // Get the active tab in the focused window
    chrome.tabs.query({ active: true, windowId: windowId }, async function(tabs) {
      if (tabs.length > 0) {
        await logActiveTabInfo(tabs[0].id);
      }
    });
  }
});

// Listener for tab updates
chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo) {
  console.debug("----> [Listener] tab update");
  // Check if the URL has changed
  if (changeInfo.url) {
    // Log information about the updated tab
    await logActiveTabInfo(tabId);
  }
});