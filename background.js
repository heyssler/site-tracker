/*
     Handle data when extension is first loaded
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

/*
     Main Functionality
*/

// Increment the time spent on a given domain
async function incrementTime(domain) {
  const { data } = await getStorageData('data');

  if (data[domain]){
    data[domain] = data[domain] + 1;
  } else {
    data[domain] = 1;
  }

  await setStorageData({ data: data });

  console.debug(`${domain} - ${data[domain]}`);
}

// Handle the intervals that will be running in the background
async function handleInterval(domain) {
  let { timeIntervalId } = await getStorageData('timeIntervalId');

  if (!(domain === "")){
    // clear the previous interval
    if (timeIntervalId){
      console.debug(`Clearing T[${timeIntervalId}]`);
      clearInterval(timeIntervalId);
    }
    // start
    timeIntervalId = setInterval(incrementTime, 1000, domain);

    await setStorageData({ timeIntervalId  })
    console.debug(`Setting T[${timeIntervalId}]`);
  } else {
    // don't count empty tabs
    if (timeIntervalId){
      clearInterval(timeIntervalId);
    }
  }  
}

// Wrapper function for getting information about the active tab, and setting a time interval
async function handleActiveTab(tabId) {
  try {
    const tab = await getTabInfo(tabId);
    if (tab) {
      let url = new URL(tab.url);
      let domain = url.hostname;
      console.debug(`---- ${domain} ----`);

      await handleInterval(domain);
    }
  } catch (error) {
    console.error("Error occurred while fetching tab info:", error);
  }
}

/*
     Listeners
*/

let currActiveTab;
const tabUpdateQueue = [];
let isProcessingQueue = false;

// Function to handle tab updates
async function processTabUpdate(tabId) {
  console.debug("----> [Listener] tab update");
  // Perform operations here based on the tab update (e.g., call handleActiveTab)
  await handleActiveTab(tabId);

  // Remove the processed tabId from the queue
  const index = tabUpdateQueue.indexOf(tabId);
  if (index > -1) {
    tabUpdateQueue.splice(index, 1);
  }

  // Process the next tab update in the queue, if any
  if (tabUpdateQueue.length > 0) {
    const nextTabId = tabUpdateQueue[0];
    await processTabUpdate(nextTabId);
  } else {
    isProcessingQueue = false;
  }
}

// Listener for tab activation
chrome.tabs.onActivated.addListener(async function (activeInfo) {
  if (currActiveTab !== activeInfo.tabId) {
    currActiveTab = activeInfo.tabId;
    console.debug("----> [Listener] tab activation");
    
    // Add the tabId to the queue
    tabUpdateQueue.push(activeInfo.tabId);

    // If the queue is not being processed, start processing it
    if (!isProcessingQueue) {
      isProcessingQueue = true;
      processTabUpdate(activeInfo.tabId);
    }
  }
});

// Listen for window focus change
chrome.windows.onFocusChanged.addListener(async function (windowId) {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    console.debug("No focused window.");
  } else {
    // Get the active tab in the focused window
    chrome.tabs.query({ active: true, windowId: windowId }, async function (tabs) {
      if (tabs.length > 0) {
        if (currActiveTab !== tabs[0].id) {
          currActiveTab = tabs[0].id;
          console.debug("----> [Listener] window focus");
          
          // Add the tabId to the queue
          tabUpdateQueue.push(tabs[0].id);

          // If the queue is not being processed, start processing it
          if (!isProcessingQueue) {
            isProcessingQueue = true;
            processTabUpdate(tabs[0].id);
          }
        }
      }
    });
  }
});
