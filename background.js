/*
     Storage
*/

chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    chrome.storage.sync.get('siteData', function(result) {
      if (!result.siteData) {
        console.log("Installing for the first time!");
        chrome.storage.sync.set({ siteData: {} });
      }
    });
  }
});

function getSiteData(callback) {
  chrome.storage.sync.get('siteData', function(result) {
    console.log(`Result is ${result}`);
    result ? siteData = result.siteData : siteData = {};
    //const siteData = result.siteData || {};
    callback(siteData);
  });
}


var prevTimestamp = null;
var prevDomain = null;

/*
      Helpers
*/

// Function to convert seconds to days, hours, minutes, and seconds
function convertTime(seconds) {
  const d = Math.floor(seconds / (24 * 3600));
  const h = Math.floor((seconds % (24 * 3600)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return { d, h, m, s };
}

/*
     Main Function
*/

// Function to log information about the active tab with a timestamp
function logActiveTabInfo(tabId) {
  getSiteData(function(siteData) {
    console.log("----- NEW TAB -----");
    // Get the updated tab information
    browser.tabs.get(tabId, function (tab) {
      if (tab) {
        // Generate a timestamp. This represents the visit time to this site.
        var currTimestamp = new Date();

        // Get the full domain (hostname) from the URL
        var url = new URL(tab.url);
        var domain = url.hostname;

        // This means that we are in an 
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

        if ((prevTimestamp === currTimestamp) || (prevDomain === domain)){
          // These conditions indicate the first session
          chrome.storage.sync.set({ siteData: siteData });
          return;
        }
        
        // Handle sessions after the first
        // Update the time spent on the site
        const timeDifference = currTimestamp - prevTimestamp;

        if (siteData[prevDomain]){
          siteData[prevDomain] = siteData[prevDomain] + timeDifference;
        } else{
          siteData[prevDomain] = timeDifference;
        }

        const sessionTime = convertTime(Math.floor(timeDifference / 1000));
        console.log(`Session time for ${prevDomain}: ${sessionTime.d}d${sessionTime.h}h${sessionTime.m}m${sessionTime.s}s`);
        
        const totalTime = convertTime(Math.floor(siteData[prevDomain] / 1000));
        console.log(`Total time spent on ${prevDomain}: ${totalTime.d}d${totalTime.h}h${totalTime.m}m${totalTime.s}s`);

        // Update pointers
        prevTimestamp = currTimestamp;
        prevDomain = domain;
        chrome.storage.sync.set({ siteData: siteData });

      } else {
        console.log("No active tabs found.");
      }
    });
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

// Log information about the active tab when the extension is first loaded
browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  if (tabs.length > 0) {
    logActiveTabInfo(tabs[0].id);
  } else {
    console.log("No active tabs found.");
  }
});
