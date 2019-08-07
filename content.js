const hostName = window.location.host;
const currentUrl = hostName.substring(hostName.lastIndexOf('.', hostName.lastIndexOf('.') - 1) + 1)

function urlRouter(url) {
  let fn;
  let imgs = [];

  const getImgs = {
    '4chan.org': function() {
      const urlList = document.querySelectorAll('.fileThumb');
      urlList.forEach(img => {
        const imgItem = {
          url: `http:${img.getAttribute('href')}`,
          fs: img.children[0].alt
        };
        imgs.push(imgItem);
      });
    },
    '4channel.org': function() {
      const urlList = document.querySelectorAll('.fileThumb');
      urlList.forEach(img => {
        const imgItem = {
          url: `http:${img.getAttribute('href')}`,
          fs: img.children[0].alt
        };
        imgs.push(imgItem);
      });
    },
    'paheal.net': function() {
        const urlList = document.querySelectorAll('.shm-thumb');

        urlList.forEach(img => {
          const correctUrl = img.children[2].getAttribute('href');
          const imgLink = img.firstChild;
          const imgAlt = imgLink.firstChild.getAttribute('alt');

          const start_pos = imgAlt.indexOf('//') + 15;
          const end_pos = imgAlt.lastIndexOf('//');
          const fs = imgAlt.substring(start_pos, end_pos).trim();

          const imgItem = {
            url: correctUrl,
            fs: fs
          };
          imgs.push(imgItem);
        });
    },
    default: function() {
        /*
            If the site is not on the supported site list it will just
            take all existing imgs src links. This my result in the preview
            thumbnails of images to be taken and some meta information to not be taken
        */
        const urlList = document.querySelectorAll('img');
        
        urlList.forEach(img => {
          // This removes things that are obviously icons
          if(img.naturalHeight <= 40) return;

          const imgItem = {
            url: img.getAttribute('src'),
            fs: 'File Size Not Available'
          };
          imgs.push(imgItem);
        });

        console.log('Default has been used here is the data: ', imgs);
    }
  };

  getImgs[url] ? fn = getImgs[url] : fn = getImgs['default'];

  fn();
  return imgs;
}

chrome.runtime.onMessage.addListener((req, sender, sendRes) => {
    if(req === 'bck-tabby') { 
      const imgData = urlRouter(currentUrl);
      sendRes(imgData);
    }
});