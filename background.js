// Initialze imgs array
window.imgs = [];

// Deconstruct Methods
const { query, sendMessage, create } = chrome.tabs;

chrome.browserAction.onClicked.addListener(tab => {
    query({active: true, currentWindow: true}, tabs => {
        // Creates the popup page and sends image data
        sendMessage(tabs[0].id, 'bck-tabby', res => {
            window.imgs = res;
            create({url: './popup/index.html'})
        });
    });
});
