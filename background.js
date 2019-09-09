// Initialze global images array
window.imgs = [];

const { query, sendMessage, create } = chrome.tabs;

chrome.browserAction.onClicked.addListener(tab => {
    query({active: true, currentWindow: true}, tabs => {
        // Creates the popup page and sends image data
        sendMessage(tabs[0].id, 'bck-tabby', res => {
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
