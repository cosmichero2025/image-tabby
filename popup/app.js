// Gets images from the backgroundPage
const bg = chrome.extension.getBackgroundPage();
const imgs = bg.imgs;
// Controls the current view is either 'gallery' or 'tile'
let currentView = 'gallery';
// Sets the default inital view to gallery
switchView(currentView);
callLoader(); // (disabled for development)

// Common function used for download of files in application
function download(img) {
  chrome.downloads.download({
    url: img,
    saveAs: true
  });
}

var fullEvent = new CustomEvent('fullscreenPop');

/*
  Context Menu Code
*/

const contextGal = document.querySelector('.context-gallery');
const contextTile = document.querySelector('.context-tile');

const toggleMenu = cmd => {
  if(cmd === 'none') {
    contextTile.style.display = cmd;
  } else if(cmd === 'block') {
    currentView === 'gallery' ? contextGal.style.display = cmd : contextTile.style.display = cmd;
  } else {
    console.error('Only parameters "none" and "block" are permitted for toggleMenu()')
  }
}

const setPosition = ({ top, left }) => {
  if(currentView === 'gallery') {
    contextGal.style.left = `${left}px`;
    contextGal.style.top = `${top}px`;
  } else {
    contextTile.style.left = `${left}px`;
    contextTile.style.top = `${top}px`;
  }

  toggleMenu('block');
}

window.addEventListener('click', () => {
  toggleMenu('none');
});

function switchView(view) {
  const galleryView = document.querySelector('.gallery-container');
  const tileView = document.querySelector('.tile-view');

  if (view === 'tile') {
    currentView = 'tile';
    galleryView.classList.add('hidden');
    tileView.classList.remove('hidden');
    handleTileView();
  } else if (view === 'gallery') {
    currentView = 'gallery';
    galleryView.classList.remove('hidden');
    tileView.classList.add('hidden');
    handleGalleryView();
  } else {
    console.error('Rendering a view that doesnt exist!');
  }
}

/*
  Tile View
*/
function handleTileView() {
  const viewContainer = document.querySelector('.tile-view');
  const tileContainer = document.querySelector('.tile-grid');

  // For the meta container collapse
  const collapseToggle = document.querySelector('.meta-nav-toggle');
  collapseToggle.addEventListener('click', () => viewContainer.classList.toggle('tile-view--full'));

  tileContainer.innerHTML = '';

  imgs.forEach(img => {
    if (!img.url) return;
    const div = document.createElement('div');
    div.classList.add('tile');

    // Checks to see if its an image, gif or webm element

    const ext = img.url.split('.').pop().toLowerCase();

    if (ext === 'webm') {
      const videoEl = document.createElement('video');
      videoEl.setAttribute('controls', false);
      videoEl.setAttribute('name', 'media');
      videoEl.setAttribute('loop', true);
      videoEl.classList.add('tile-image');

      const sourceEl = document.createElement('source');
      sourceEl.setAttribute('src', img.url);
      sourceEl.setAttribute('type', 'video/webm');
      videoEl.appendChild(sourceEl);

      div.appendChild(videoEl);
    } else {
      const imgEl = document.createElement('img');
      imgEl.setAttribute('src', img.url);
      imgEl.setAttribute('alt', img.fs);
      imgEl.classList.add('tile-image');
      div.appendChild(imgEl);
    }

    div.addEventListener('contextmenu', e => {
      e.preventDefault();

      const origin = {
        top: e.pageY,
        left: e.pageX
      }
      
      setPosition(origin);
    });

    tileContainer.appendChild(div);
  });

  const gotoOption = document.querySelector('.menu-option--goto');

  gotoOption.addEventListener('click', () => { 
    switchView('gallery');
  });

  const galReturn = document.querySelector('.gallery-return');
  galReturn.addEventListener('click', () => switchView('gallery'));

  const tiles = document.querySelectorAll('.tile');

  setTimeout(() => {
    
    const firstImg = tiles[0].firstChild
    const firstSrc = firstImg.src;

    const metaData = {
      location: firstSrc,
      size: firstImg.alt,
      name: firstSrc
      .split('/')
      .pop()
      .split('/')
      .pop()
      .split('.')[0],
      ext: firstSrc
      .split('.')
      .pop()
      .toLowerCase(),
      width: firstImg.naturalWidth,
      height: firstImg.naturalHeight
    }

    changeMeta(metaData);
  }, 5);


  const totalSelection = document.querySelector('.selected-num');

  function getTotalSelected() {
    let totalSelection = 0;
    tiles.forEach(tile => {
      const isSelected = tile.classList.contains('tile--active');
      if (isSelected) totalSelection++;
    });

    return totalSelection;
  }

  function changeMeta ({location, size, name, ext, width, height}) {
    const imgPreview = document.querySelector('.meta-image');
    imgPreview.src = location;

    const imgLocation = document.querySelector('.img-origin').children[0];
    imgLocation.href = location;
    imgLocation.innerHTML = location;

    const imgSize = document.querySelector('.img-size');
    imgSize.innerHTML = size;

    const imgName = document.querySelector('.img-name');
    imgName.innerHTML = `${name}.${ext}`;

    const imgDim = document.querySelector('.img-dim');
    imgDim.innerHTML = `${width} x ${height}`;
  }

  const tileRange = document.querySelector('.tile-range');
  tileRange.addEventListener('change', e => {
    console.log('Tile range has been changed');
    const rangeVal = parseInt(e.target.value);

    tileContainer.classList.remove('tile-grid--1', 'tile-grid--2', 'tile-grid--3', 
    'tile-grid--4', 'tile-grid--5')

    switch (rangeVal) {
      case 1:
        tileContainer.classList.add('tile-grid--1');
        break;

      case 2:
        tileContainer.classList.add('tile-grid--2');
        break;

      case 3:
        tileContainer.classList.add('tile-grid--3');
        break;

      case 4:
        tileContainer.classList.add('tile-grid--4');
        break;
      case 5:
        tileContainer.classList.add('tile-grid--5');
        break;
      default:
        console.log('error');
    }
  });

  let isSelectAll = false;
  const selectAll = document.querySelector('.select-all');
  selectAll.addEventListener('click', () => {
    isSelectAll = !isSelectAll;
    selectAll.classList.toggle('i--active');

    if (isSelectAll) {
      tiles.forEach(tile => {
        const isSelected = tile.classList.contains('tile--active');
        if (!isSelected) {
          tile.classList.add('tile--active');
        }
      });
    } else {
      tiles.forEach(tile => {
        tile.classList.remove('tile--active');
      });
    }

    totalSelection.innerHTML = getTotalSelected();
  });

  tiles.forEach(tile => {
    tile.addEventListener('click', e => {
      if(e.shiftKey) {
        tile.classList.toggle('tile--active');
      }

      const imgEl = tile.children[0];
      const src = imgEl.src;

      const metaData = {
        location: src,
        size: imgEl.alt,
        name: src
        .split('/')
        .pop()
        .split('/')
        .pop()
        .split('.')[0],
        ext: src
        .split('.')
        .pop()
        .toLowerCase(),
        width: imgEl.naturalWidth,
        height: imgEl.naturalHeight
      }

      changeMeta(metaData);

      totalSelection.innerHTML = getTotalSelected();
    });
  });

  const metaBtn = document.querySelector('.meta-btn');

  metaBtn.addEventListener('click', () => {
    const currentImages = document.querySelectorAll('.tile--active');
    if (!currentImages) return;

    currentImages.forEach(img => {
      let image = img.children[0].src;
      download(image);
    });
  });

  const totalSpan = document.querySelector('.selected-total');
  totalSpan.innerHTML = tiles.length++;
}

/*
  End of Tile View
*/

/*
  Gallery View
*/

function handleGalleryView() {
  const gallery = document.querySelector('.gallery-images');
  const prev = document.querySelector('.prev');
  const next = document.querySelector('.next');
  const fullIcon = document.querySelector('.fullscreen-icon');
  const saveIcon = document.querySelector('.save-icon');
  const tileIcon = document.querySelector('.tile-icon');

  /*
    Since I don't reload the dom element I don't want to attach multiple event listeners
    This ensures that only 1 is attached
  */
  if (fullIcon.getAttribute('listener') !== 'true') {
    console.log('This should fire once')
    fullIcon.addEventListener('click', e => {
      const elementClicked = e.target;
      elementClicked.setAttribute('listener', 'true');
      toggleFullScreen();
    });

    saveIcon.addEventListener('click', () => {
      console.log('Save button fired')
      download(document.querySelectorAll('.gallery-images img')[slideIndex - 1].src)
    });
  }

  // Clear the previous images
  gallery.innerHTML = '';

  imgs.forEach(img => {
    if(!img.url) return;
    const ext = img.url.split('.').pop().toLowerCase();

    if (ext === 'webm') {
      const videoEl = document.createElement('video');
      videoEl.setAttribute('controls', false);
      videoEl.setAttribute('name', 'media');
      videoEl.setAttribute('loop', true);
      videoEl.classList.add('tile-image');

      const sourceEl = document.createElement('source');
      sourceEl.setAttribute('src', img.url);
      sourceEl.setAttribute('type', 'video/webm');
      videoEl.appendChild(sourceEl);

      gallery.appendChild(videoEl);
    }  else {
      // If the url doesn't have a an end ext or uses the ::data extension (Might not work)
      const imgEl = document.createElement('img');
      imgEl.setAttribute('src', img.url);
      imgEl.setAttribute('alt', img.fs);

      // Zooming
      let scale = 1;
      // let translateX = 0;
      // let translateY = 0;

      gallery.addEventListener('mousewheel', e => {
        e.preventDefault();
    
        let fullText = fullIcon.textContent.replace(/\s/g, '');
        if(fullText !== 'fullscreen') return;

        if(imgEl.style.display === 'block') {
          scale += e.deltaY * -0.005;
          imgEl.style.width = imgEl.width * scale;
          scale = Math.min(Math.max(1, scale), 6);
          imgEl.style.transform = `scale(${scale}) translate(-50%, -50%)`;

          // const delta = e.wheelDelta / 120;
          // let nextScale = scale + delta * 0.1;
          // nextScale = Math.min(Math.max(1, nextScale), 5);

          // const ratio = 1 - nextScale / scale;

          // translateX += (e.clientX - translateX) * ratio;
          // translateY += (e.clientY - translateY) * ratio;

          // imgEl.style.transform = `translate(${translateX}px, ${translateY}px) scale(${nextScale})`;
          // scale = nextScale;
          // https://jsfiddle.net/zez538L8/13/
        }
      });

      document.addEventListener('fullscreenPop', () => scale = 1);

      // Cursor Moving
      let mousePosition = {};
      let offset = [];
      let isDown = false;

      imgEl.addEventListener('mousedown', e => {
        isDown = true;
        offset = [
          imgEl.offsetLeft - e.clientX,
          imgEl.offsetTop - e.clientY
        ];
      }, true);

      document.addEventListener('mouseup', () => isDown = false);
      document.addEventListener('mousemove', e => {
        e.preventDefault();

        if(isDown) {
          mousePosition = {
            x: e.clientX,
            y: e.clientY
          };

          imgEl.style.left = `${(mousePosition.x + offset[0])}px`;
   
          imgEl.style.top = `${mousePosition.y + offset[1]}px`;
        }
      }, true);

      gallery.appendChild(imgEl);
    }
  });

  let slideIndex = 1;
  genImage(slideIndex);

  function changeImg(n) {
    const galleryEl = gallery.children[slideIndex - 1];
    
    if(galleryEl.nodeName === 'VIDEO') { 
      galleryEl.pause();
    }

    genImage((slideIndex += n));
  }

  prev.addEventListener('click', () => changeImg(1));
  next.addEventListener('click', () => changeImg(-1));

  function genImage(idx) {
    const galleryImages = document.querySelectorAll('.gallery-images img, .gallery-images video');

    // reset gallery so it can go in both direcitons
    if (idx > galleryImages.length) {
      slideIndex = 1;
    }
    if (idx < 1) {
      slideIndex = galleryImages.length;
    }

    // Remove images from DOM only show when it is its turn
    galleryImages.forEach(img => (img.style.display = 'none'));
    galleryImages[slideIndex - 1].style.display = 'block';
  }

  const functionsContainer = document.querySelector('.functions-container');
  const functionsArrow = document.querySelector('.functions-arrow');

  functionsContainer.addEventListener('mouseover', () => functionsArrow.style.display = 'none');

  function toggleFullScreen() {
    const galImgs = document.querySelectorAll('.gallery-images img');

    let fullText = fullIcon.textContent.replace(/\s/g, '');

    if (fullText === 'fullscreen') {
      fullIcon.textContent = 'fullscreen_exit';
      [...galImgs].forEach(img => {
        img.style.maxWidth = '97vw';
        img.style.maxHeight = '95vh';
        img.style.top = '50%';
        img.style.left = '50%';
        img.style.transform = 'scale(1) translate(-50%, -50%)'
      });
    } else {
      fullIcon.textContent = 'fullscreen';
      [...galImgs].forEach(img => {
        img.style.maxWidth = '50vw';
        img.style.maxHeight = '70vh';
        img.style.top = '50%';
        img.style.left = '50%';
      });
    }

    document.dispatchEvent(fullEvent);
  }

  tileIcon.addEventListener('click', () => { 
    switchView('tile');
  });

  // Listens for arrow key changes for the gallery view
  document.addEventListener('keyup', e => {
    // Checks to see if its the gallery view
    if (currentView === 'tile') return;

    const key = e.keyCode;
    if (key === 39) {
      changeImg(1);
    } else if (key === 37) {
      changeImg(-1);
    } else if(key === 32) {
      toggleFullScreen();
    } else if(key === 83) {
      download(document.querySelectorAll('.gallery-images img')[slideIndex - 1].src)
    } else {
      return;
    }
  });
}

/*
  End Of Gallery View
*/

/*  
  Loader View Code
*/

function callLoader() {
  const loader = document.querySelector('.loader');
  loader.style.display = 'block';
  setTimeout(() => {
    if (loader.style.display) {
      loader.style.display = 'none';
    }
  }, 3000);
}

/* EASTER EGG CODE */

// Detects the konami code
function onKonamiCode(callback) {
  let input = '';
  const key = '38384040373937396665';
  document.addEventListener('keydown', e => {
    input += '' + e.keyCode;
    if (input === key) {
      return callback();
    }
    if (!key.indexOf(input)) return;
    input = '' + e.keyCode;
  });
}

// Easter egg Popup
function noahScript() {
  const divEl = document.createElement('div');
  divEl.classList.add('easter-pop');

  const divEl2 = document.createElement('img');
  divEl.append(divEl2);

  // Removes easteregg popup
  divEl2.addEventListener('click', () => {
    divEl2.classList.add('easter-pop--exit');
    setTimeout(() => divEl.remove(), 1500);
  });

  document.body.append(divEl);
}

// Listens for konamicode if triggered shows noah's easter egg
onKonamiCode(() => noahScript());
