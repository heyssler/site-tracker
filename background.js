/*
     Storage
*/

chrome.runtime.onInstalled.addListener(async details => {
  // Check if the extension was just installed
  if (details.reason === 'install') {
    try {
      // Set the initial data when the extension is installed
      await setStorageData({ data: {} });
      console.log('Extension installed. Initial data set.');
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

var prevTimestamp = null;
var prevDomain = null;

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
     Main Function
*/

// Function to log information about the active tab with a timestamp
async function logActiveTabInfo(tabId) {
  const { data } = await getStorageData('data');

  console.log("----- NEW TAB -----");
  // Get the updated tab information
  browser.tabs.get(tabId, async function (tab) {
    if (tab) {
      // Generate a timestamp. This represents the visit time to this site.
      var currTimestamp = new Date();

      // Get the full domain (hostname) from the URL
      var url = new URL(tab.url);
      var domain = url.hostname;

      // This means that we are in a new tab, without a URL
      // i.e. 'about:newtab', or 'about:debugging'
      if (domain.length === 0){
        domain = "Blank Page"
      }

      console.log(`Active Tab: ${domain}`);

      if (!prevTimestamp){
        console.log(`prevTimestamp is NULL`);
      } else {
        console.log(`prevTimestamp: ${prevTimestamp.toLocaleString()}`);
      }
      console.log(`currTimestamp: ${currTimestamp.toLocaleString()}`);

      // Handle the first session
      if (!prevTimestamp){
        prevTimestamp = currTimestamp;
      }

      if (!prevDomain){
        prevDomain = domain;
      }

      // These conditions indicate the first session
      if ((prevTimestamp === currTimestamp) || (prevDomain === domain)){
        return;
      }
      
      // Handle sessions after the first
      // Update the time spent on the site
      const timeDifference = currTimestamp - prevTimestamp;

      if (data[prevDomain]){
        data[prevDomain] = data[prevDomain] + timeDifference;
      } else{
        data[prevDomain] = timeDifference;
      }

      const sessionTime = convertTime(Math.floor(timeDifference / 1000));
      console.log(`Session time for ${prevDomain}: ${sessionTime.d}d${sessionTime.h}h${sessionTime.m}m${sessionTime.s}s`);
      
      const totalTime = convertTime(Math.floor(data[prevDomain] / 1000));
      console.log(`Total time spent on ${prevDomain}: ${totalTime.d}d${totalTime.h}h${totalTime.m}m${totalTime.s}s`);

      // Update pointers
      prevTimestamp = currTimestamp;
      prevDomain = domain;

      // Save the data
      await setStorageData({ data: data })

    } else {
      console.log("No active tabs found.");
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