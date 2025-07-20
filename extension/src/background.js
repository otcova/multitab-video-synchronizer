let activated = true;
function configGetActivated() {
  chrome.storage.local.get("activated").then(result => {
    activated = !!result.activated ?? false;
  });
  return activated;
}


function urlMatch(a, b) {
  let url_a = new URL(a);
  let url_b = new URL(b);
  return url_a.origin == url_b.origin && url_a.pathname == url_b.pathname;
}

let tab_list = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.log) {
    console.log(message.log);
    return;
  }

  if (message.listTabs) {
    sendResponse(tab_list);
    return;
  }

  if (!configGetActivated()) return;

  chrome.tabs.query({}, (tabs) => {
    tab_list = [];
    for (let tab of tabs) {
      if (urlMatch(sender.tab.url, tab.url)) {
        tab_list.push(tab.url.toString());
        message.response = tab.id !== sender.tab.id;
        chrome.tabs.sendMessage(tab.id, message).catch(() => { });
      }
    }
  });
});
