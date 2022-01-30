console.log('Popup.js Running');

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, { txt: "Popup_Opened" })
})
