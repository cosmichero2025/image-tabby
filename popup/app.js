// Gets images from the backgroundPage
const bg = chrome.extension.getBackgroundPage();
const imgs = bg.imgs;
const pageUrl = bg.pageUrl;

window.addEventListener('load', () => {
  // Controls the current view is either 'gallery' or 'tile'
  let currentView = 'gallery';
  let slideIndex = 1;
  const galleryView = document.querySelector('.gallery-container');
  const tileView = document.querySelector('.tile-view');
  // Sets the default inital view to currentView
  switchView(currentView);

  // Calls the loader giving the views time to load the images
  callLoader();

  // Common function used for download of files in application
  function download(img) {
    chrome.downloads.download({
      url: img,
      saveAs: true
    });
  }

  const gallery = document.querySelector('.gallery-images');
  const prev = document.querySelector('.prev');
  const next = document.querySelector('.next');
  const fullIcon = document.querySelector('.fullscreen-icon');
  const saveIcon = document.querySelector('.save-icon');
  const tileIcon = document.querySelector('.tile-icon');

  fullIcon.addEventListener('click', () => toggleFullScreen());
  saveIcon.addEventListener('click', () => download(document.querySelectorAll('.gallery-images img, .gallery-images video source')[slideIndex - 1].src));
  
  imgs.forEach(img => {
    if (!img.url) return;
    const ext = img.url
      .split('.')
      .pop()
      .toLowerCase();
      
    if (ext === 'webm') {
      const target = document.createElement('div');
      target.classList.add('slide');

      const videoEl = document.createElement('video');

      videoEl.setAttribute('controls', false);
      videoEl.setAttribute('name', 'media');
      videoEl.setAttribute('loop', true);
      videoEl.classList.add('tile-image');

      const sourceEl = document.createElement('source');
      sourceEl.setAttribute('src', img.url);
      sourceEl.setAttribute('type', 'video/webm');
      videoEl.appendChild(sourceEl);

      target.appendChild(videoEl);
      gallery.appendChild(target);
    } else {
      const container = document.querySelector('.gallery-images');
      const target = document.createElement('div');
      target.classList.add('slide');

      // If the url doesn't have a an end ext or uses the ::data extension (Might not work)
      const imgEl = document.createElement('img');
      imgEl.setAttribute('src', img.url);
      imgEl.setAttribute('alt', img.fs);

      target.appendChild(imgEl);

      // Zooming Into The Image
      let zoom_point = {x:0,y:0};
      let scale = 1;
      const maxScale = 8;
      const factor = 0.3;
      let pos = {x:0,y:0};
      let zoom_target = {x:0,y:0};

      imgEl.addEventListener('mousewheel', (e) => {
        e.preventDefault();

        // Ensures that zoom doesn't work in fullscreen
        let fullText = fullIcon.textContent.replace(/\s/g, '');
        if (fullText !== 'fullscreen') return;

        if (target.style.display === 'block') {
          const offset = container.getBoundingClientRect();
          zoom_point.x = e.pageX - offset.left;
          zoom_point.y = e.pageY - offset.top;

          let delta = e.deltaY;

          delta = Math.max(-1, Math.min(1, delta)); 

          // determine the point on where the slide is zoomed in
          zoom_target.x = (zoom_point.x - pos.x) / scale;
          zoom_target.y = (zoom_point.y - pos.y) / scale;

          // apply zoom
          scale += delta * factor * scale;
          scale = Math.min(Math.max(1, scale), maxScale);

          // calculate x and y based on zoom
          pos.x = -zoom_target.x * scale + zoom_point.x;
          pos.y = -zoom_target.y * scale + zoom_point.y;

          target.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(${scale}, ${scale})`;
        }
      });

      // Moving The Image Around
      let mousePosition = {};
      let offset = [];
      let isDown = false;

      // If the user fullscreens the image this will reset its offset position
      window.addEventListener('keydown', e => e.code == 'Space' ? offset = [] : null)

      imgEl.addEventListener('mousedown', e => {
          isDown = true;
          offset = [imgEl.offsetLeft - e.clientX, imgEl.offsetTop - e.clientY];
        }, true
      );

      galleryView.addEventListener('mouseup', () => (isDown = false));
      galleryView.addEventListener('mousemove', e => {
          e.preventDefault();

          if (isDown) {
            mousePosition = {
              x: e.clientX,
              y: e.clientY
            };

            imgEl.style.left = `${mousePosition.x + offset[0]}px`;
            imgEl.style.top = `${mousePosition.y + offset[1]}px`;
          }
        },
        true
      );

      gallery.appendChild(target);
    }
  });

  genImage();

  function changeImg(n) {
    const galleryEl = gallery.children[slideIndex - 1].children[0];

    if (galleryEl.nodeName === 'VIDEO') {
      galleryEl.pause();
    }
    slideIndex += n;
    genImage();
  }

  prev.addEventListener('click', () => changeImg(-1));
  next.addEventListener('click', () => changeImg(1));

  function genImage() {
    const galleryImages = document.querySelectorAll('.slide');

    // reset gallery so it can go in both direcitons
    if (slideIndex > galleryImages.length) {
      slideIndex = 1;
    }
    if (slideIndex < 1) {
      slideIndex = galleryImages.length;
    }

    // Remove images from DOM only show when it is its turn
    galleryImages.forEach(img => (img.style.display = 'none'));
    galleryImages[slideIndex - 1].style.display = 'block';
  }

  // Functions arrow animation control
  const functionsContainer = document.querySelector('.functions-container');
  const functionsArrow = document.querySelector('.functions-arrow');

  functionsContainer.addEventListener('mouseover', () => {
    functionsArrow.style.bottom = '-5rem';

    // Fired once to remove the bouncing arrow
    setTimeout(() => (functionsArrow.style.display = 'none'), 300);
  });

  function toggleFullScreen() {
    const galImgs = document.querySelectorAll('.gallery-images img');

    let fullText = fullIcon.textContent.replace(/\s/g, '');

    if (fullText === 'fullscreen') {
      fullIcon.textContent = 'fullscreen_exit';
      [...galImgs].forEach(img => {
        img.style.maxWidth = '97vw';
        img.style.maxHeight = '95vh';
      });
    } else {
      fullIcon.textContent = 'fullscreen';
      [...galImgs].forEach(img => {
        img.style.maxWidth = '50vw';
        img.style.maxHeight = '70vh';
      });
    }

    [...galImgs].forEach(img => {
      img.style.top = '50%';
      img.style.left = '50%';
      img.style.transform = 'translate(-50%, -50%)';

      img.parentElement.style.transform = 'scale(1)';
    });
  }

  tileIcon.addEventListener('click', () => switchView('tile'));

  // Listens for arrow key changes for the gallery view
  document.addEventListener('keyup', e => {
    // Checks to see if its the gallery view
    if (currentView === 'tile') return;

    const key = e.keyCode;
    if (key === 39 || key === 68) {
      // Right arrow & 'D' key
      changeImg(1);
    } else if (key === 37 || key === 65) {
      // Left arrow & 'A' key
      changeImg(-1);
    } else if (key === 32) {
      // Spacebar
      toggleFullScreen();
    } else if (key === 83) {
      // The 'S' key for downloading the current image
      download(
        document.querySelectorAll('.gallery-images img, .gallery-images video source')[slideIndex - 1].src
      )
    } else {return; }
  });

  /*
    Tile View Scripts
  */

  const viewContainer = document.querySelector('.tile-view');
  const tileContainer = document.querySelector('.tile-grid');

  // For the meta container collapse
  const collapseToggle = document.querySelector('.meta-nav-toggle');
  collapseToggle.addEventListener('click', () =>
    viewContainer.classList.toggle('tile-view--full')
  );

  let currentSelection = 1;

  const originalSite = document.querySelector('.original-site');
  originalSite.innerHTML = `${pageUrl} images`;

  imgs.forEach((img, i) => {
    if (!img.url) return;
    const div = document.createElement('div');
    div.classList.add('tile');
    div.setAttribute('data-slideIdx', i + 1);

    // Checks to see if its an image, gif or webm element

    const ext = img.url
      .split('.')
      .pop()
      .toLowerCase();

    if (ext === 'webm') {

      div.style.position = 'relative';

      const videoEl = document.createElement('video');
      videoEl.setAttribute('name', 'media');
      videoEl.setAttribute('loop', true);
      videoEl.setAttribute('alt', img.fs);
      videoEl.classList.add('tile-image');

      const sourceEl = document.createElement('source');
      sourceEl.setAttribute('src', img.url);
      sourceEl.setAttribute('type', 'video/webm');
      videoEl.appendChild(sourceEl);
      

      const controlsContainer = document.createElement('div');
      controlsContainer.classList.add('tile-video-controls');

      const toggleIconContainer = document.createElement('div');
      toggleIconContainer.classList.add('video-toggle');
      toggleIconContainer.setAttribute('data-slideIdx', i + 1);
      toggleIconContainer.setAttribute('alt', img.fs);

      const toggleIcon = document.createElement('i');
      toggleIcon.classList.add('material-icons');
      toggleIcon.textContent = 'play_arrow';
      toggleIcon.setAttribute('data-slideIdx', i + 1);
      toggleIcon.setAttribute('alt', img.fs);

      div.appendChild(videoEl);
      div.appendChild(controlsContainer);
      controlsContainer.appendChild(toggleIconContainer);
      toggleIconContainer.appendChild(toggleIcon);
      
      controlsContainer.addEventListener('click', e => {
        if(e.shiftKey) {return;}

        if(videoEl.paused || videoEl.ended) {
          toggleIcon.textContent = '';
          videoEl.play();
        } else {
          toggleIcon.textContent = 'play_arrow';
          videoEl.pause();
        }
     });
    } else {
      const imgEl = document.createElement('img');
      imgEl.setAttribute('src', img.url);
      imgEl.setAttribute('alt', img.fs);
      imgEl.classList.add('tile-image');
      imgEl.setAttribute('data-slideIdx', i + 1);

      div.appendChild(imgEl);
    }

    div.addEventListener('contextmenu', e => {
      e.preventDefault();

      const origin = {
        top: e.pageY,
        left: e.pageX
      };

      currentSelection = e.target.getAttribute('data-slideIdx');

      setPosition(origin);
    });

    tileContainer.appendChild(div);
  });

  const gotoOption = document.querySelector('.menu-option--goto');

  gotoOption.addEventListener('click', () => {
    slideIndex = Number(currentSelection);
    switchView('gallery', true);
  });

  const saveOption = document.querySelector('.menu-option--save');
  saveOption.addEventListener('click', () => {
    download(imgs[Number(currentSelection) - 1].url)
  })

  const infoOption = document.querySelector('.menu-option--info');
  infoOption.addEventListener('click', e => {

    const t = document.querySelectorAll('.tile .tile-image');

    const tx = t[currentSelection];

    let src = '';

    const isVideo = tx.nodeName === 'VIDEO';

    if(isVideo) {
      src = tx.children[0].src;
    } else {
      src = tx.src;
    }

    const metaData = {
      location: src,
      size: tx.getAttribute('alt'),
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
        width: isVideo ? tx.videoWidth : tx.naturalWidth,
        height: isVideo ? tx.videoHeight : tx.naturalHeight,
        isVideo: isVideo
    }

    changeMeta(metaData);
  })

  const galReturn = document.querySelector('.gallery-return');
  galReturn.addEventListener('click', () => switchView('gallery'));

  const tiles = document.querySelectorAll('.tile');

  // This gets the inital meta data from the first element
  setTimeout(() => {
    const firstImg = tiles[0].firstChild;
    let src = '';

    const isVideo = firstImg.nodeName === 'VIDEO';

    if(isVideo) {
      src = firstImg.children[0].src;
    } else {
      src = firstImg.src;
    }

    const metaData = {
      location: src,
      size: firstImg.getAttribute('alt'),
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
        width: isVideo ? firstImg.videoWidth : firstImg.naturalWidth,
        height: isVideo ? firstImg.videoHeight : firstImg.naturalHeight,
        isVideo: isVideo
    };

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

  function changeMeta({ location, size, name, ext, width, height, isVideo }) {
    const metaContainer = document.querySelector('.meta-image-container');
    metaContainer.innerHTML = '';

    let imgPreview;
    if(isVideo) {
      imgPreview = document.createElement('video');
      imgPreview.controls = false;
      imgPreview.classList.add('meta-image');
      const source = document.createElement('source');
      source.src = location;

      imgPreview.append(source);
    } else {
      imgPreview = document.createElement('img');
      imgPreview.classList.add('meta-image');
      imgPreview.src = location;
    }

    metaContainer.append(imgPreview);

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
  tileRange.addEventListener('input', e => {
    const rangeVal = parseInt(e.target.value);

    tileContainer.classList.remove(
      'tile-grid--1',
      'tile-grid--2',
      'tile-grid--3',
      'tile-grid--4',
      'tile-grid--5'
    );

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

  // For image selection
  let selectFrom = null;
  let selectTo = null;

  tiles.forEach(tile => {
    tile.addEventListener('click', e => {
      if (e.ctrlKey) {
        tile.classList.toggle('tile--active');
      }

      if(e.shiftKey) {
        // Wipes the previous selected
        if(selectFrom != null && selectTo != null) {
          tiles.forEach(tiley => {
            const idx = tiley.children[0].dataset.slideidx;
            if(selectFrom <= selectTo) {
              if(idx >= selectFrom && idx <= selectTo) {
                tiley.classList.remove('tile--active');
              }
            } else {
              if(idx <= selectFrom && idx >= selectTo) {
                tiley.classList.remove('tile--active');
              }
            }
          })

          selectFrom = null;
          selectTo = null;
        }

        if(selectFrom == null) {
          selectFrom = Number(e.target.dataset.slideidx);
          tile.classList.add('tile--active');
        } else {
          selectTo = Number(e.target.dataset.slideidx);

          tile.classList.add('tile--active');

          tiles.forEach(tilex => {
            const idx = tilex.children[0].dataset.slideidx;

            if(selectFrom < selectTo) {
              if(idx >= selectFrom && idx <= selectTo) {
                tilex.classList.add('tile--active');
              }
            } else {
              if(idx <= selectFrom && idx >= selectTo) {
                tilex.classList.add('tile--active');
              }
            }
          })
        }
      }

      const imgEl = tile.children[0];
      let src = '';

      const isVideo = imgEl.nodeName === 'VIDEO';
      if(isVideo) {
        src = imgEl.children[0].src;
      } else {
        src = imgEl.src;
      }

      const metaData = {
        location: src,
        size: imgEl.getAttribute('alt'),
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
        width: isVideo ? imgEl.videoWidth : imgEl.naturalWidth,
        height: isVideo ? imgEl.videoHeight : imgEl.naturalHeight,
        isVideo: isVideo
      };

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

  // Tile View Context Menu

  const contextTile = document.querySelector('.context-tile');

  const toggleMenu = cmd => {
    if (cmd === 'none') {
      contextTile.style.display = cmd;
    } else if (cmd === 'block') {
      contextTile.style.display = cmd;
    } else {
      console.error('Only parameters (none) and (block) are permitted for toggleMenu()');
    }
  };

  const setPosition = ({ top, left }) => {
    contextTile.style.left = `${left}px`;
    contextTile.style.top = `${top}px`;

    toggleMenu('block');
  };

  window.addEventListener('click', () => {
    toggleMenu('none');
  });

  // Switchs between views
  function switchView(view, isUpdate) {
    if (view === 'tile') {
      currentView = 'tile';
      galleryView.classList.add('hidden');
      tileView.classList.remove('hidden');
    } else if (view === 'gallery') {
      currentView = 'gallery';
      galleryView.classList.remove('hidden');
      tileView.classList.add('hidden');

      // If this isn't the first time rendering then it updates the currentImage
      if (isUpdate) {
        genImage();
      }
    } else {
      console.error('Rendering a view that doesnt exist!');
    }
  }

  /*
    Tabby-Loader Code
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
});
