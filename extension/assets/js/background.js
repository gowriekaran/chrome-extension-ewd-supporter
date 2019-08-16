//To allow user to turn on/off plugin just by clicking the extension.
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