const urlList = document.querySelectorAll('.fileThumb');

// Get all the hrefs from the img anchor tags
function getImgs() {
    let imgs = [];
    urlList.forEach(img => { 
        const imgItem = {
            url: img.getAttribute('href'),
            fs: img.children[0].alt
        }
        imgs.push(imgItem);
    });

    return imgs;
}

// If the icon is clicked send all the pages images
chrome.runtime.onMessage.addListener((req, sender, sendRes) => {
    if(req === 'bck-tabby') sendRes(getImgs());
});
