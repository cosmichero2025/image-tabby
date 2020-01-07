// Initialze Global Img Array
window.imgs = [];

const { query, sendMessage, create } = chrome.tabs;

chrome.browserAction.onClicked.addListener(tab => {
    query({active: true, currentWindow: true}, tabs => {
        // Sends a message to content.js and returns img data from current tab
        sendMessage(tabs[0].id, 'GET_IMGS', res => {
            const { imgData } = res;

            window.imgs = imgData;
            window.pageUrl = res.pageUrl;

            // If there is no content on page it will redirect to a warning page!
            if(imgData.length === 0) {
                create({url: './popup/lack.html'});
            } else {
                create({url: './popup/index.html'});
            }
        });
    });
});
