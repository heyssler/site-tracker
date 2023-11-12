document.addEventListener('DOMContentLoaded', function () {
  chrome.tabs.query({}, function (tabs) {
    var tabList = document.getElementById('tabList');
    tabs.forEach(function (tab) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      var url = new URL(tab.url);
      a.href = url.origin;
      a.textContent = url.hostname;
      a.target = '_blank'; // Open the link in a new tab
      li.appendChild(a);
      tabList.appendChild(li);
    });
  });
});
