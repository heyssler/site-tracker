/*
      Initialization
*/

chrome.runtime.onInstalled.addListener(async details => {
  // Check if the extension was just installed
  if (details.reason === 'install') {
    try {
      // Set the initial data when the extension is installed
      await setStorageData({ data: {} }); // store domain time data
      await setStorageData({ dQueue: [] }); // store domains in a queue to stage them for evaluation
      console.info('[initialization] Extension installed. Initial data set.');
    } catch (error) {
      console.error('[initialization] Error setting initial data:', error.message);
    }
  }
});

/*
      Time logic
*/

// Increment the time spent on a given domain
async function incrementTime(domain, date) {
  const { data } = await getStorageData('data');

  if (data[date]){
    if (data[date][domain]){
      data[date][domain] = data[date][domain] + 1;
    } else {
      data[date][domain] = 1;
    }
  } else {
    data[date] = {};
  }

  await setStorageData({ data: data });

  console.debug(`[${date}] ${domain} - ${data[date][domain]}`);
}

// Handle the intervals that will be running in the background
async function handleInterval(domain) {
  console.debug(`---- ${domain} ----`);

  let { timeIntervalId } = await getStorageData('timeIntervalId');

  if (!(domain === "")){
    // clear the previous interval
    if (timeIntervalId){
      console.debug(`[handleInterval] clearing T[${timeIntervalId}]`);
      clearInterval(timeIntervalId);
    }
    // start
    timeIntervalId = setInterval(incrementTime, 1000, domain, getDateFormatted(new Date()));

    await setStorageData({ timeIntervalId  })
    console.debug(`[handleInterval] setting T[${timeIntervalId}]`);
  } else {
    // don't count empty tabs
    if (timeIntervalId){
      clearInterval(timeIntervalId);
    }
  }  
}

/*
      Queue logic
*/

// Evaluate each item (domain) in queue sequentially.
async function evaluateQueue(){
  let { dQueue } = await getStorageData('dQueue');

  console.debug(`[evaluateQueue] dQueue.length: ${dQueue.length}`);

  while (dQueue.length > 0){
    var domain = dQueue.shift();
    await handleInterval(domain);
  }

  await setStorageData({ dQueue });
}

// Push a domain to the queue to stage it for evaluation
async function pushDomainToQueue(tabId){
  let { dQueue } = await getStorageData('dQueue');
  const tab = await getTabInfo(tabId);

  if (tab) {
    let url = new URL(tab.url);
    let domain = url.hostname;
    
    dQueue.push(domain);
    await setStorageData({ dQueue });
  }
}

/*
      Listeners
*/

// Listener for tab activation
chrome.tabs.onActivated.addListener(async function (activeInfo) {
    console.debug("[Listener] tab activation");
    //await handleActiveTab(activeInfo.tabId);
    await pushDomainToQueue(activeInfo.tabId);
});


// Listen for window focus change
chrome.windows.onFocusChanged.addListener(async function(windowId) {

  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    console.debug("[Listener] No focused window.");
  } else {
    // Get the active tab in the focused window
    chrome.tabs.query({ active: true, windowId: windowId }, async function(tabs) {
      if (tabs.length > 0) {
        console.debug("[Listener] window focus");
        //await handleActiveTab(tabs[0].id);
        await pushDomainToQueue(tabs[0].id);
      }
    });
  }
});

// Listener for tab updates
chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo) {
  // Check if the URL has changed
  if (changeInfo.url) {
    // Log information about the updated tab
    console.debug("[Listener] tab update");
    //await handleActiveTab(tabId);
    await pushDomainToQueue(tabId);
  }
});

// Evaluate the queue every time it changes
chrome.storage.onChanged.addListener(async function storageChangeHandler(changes, area) {
  for (let key in changes) {
      if (Object.prototype.hasOwnProperty.call(changes, key)) {
          // evaluate only if items were added to queue
          if (key === 'dQueue' && (changes[key].oldValue) && (changes[key].newValue.length > changes[key].oldValue.length)){
            console.debug("[Listener] queue evaluation")
            await evaluateQueue();
          }
      }
  }
});