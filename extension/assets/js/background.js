/*
    Purpose: to allow the user to enable/disable the extension
*/
chrome.browserAction.onClicked.addListener(function (tab) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {
            run_ewdSupporter: 1
        });
    });
});