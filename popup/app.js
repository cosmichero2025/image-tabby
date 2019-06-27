document.addEventListener('DOMContentLoaded', () => {
  // gives you access to the background variables
  const bg = chrome.extension.getBackgroundPage();
  const imgs = bg.imgs;

  // Controls the current view is either 'gallery' or 'tile'
  let currentView = 'gallery';
  const galleryView = document.querySelector('.gallery-container');
  const tileView = document.querySelector('.tile-view');

  // callLoader(); // (disabled for development)

  // Start of gallery view
  const gallery = document.querySelector('.gallery-images');
  const prev = document.querySelector('.prev');
  const next = document.querySelector('.next');

  imgs.forEach(img => {
    const imgEl = document.createElement('img');
    imgEl.setAttribute('src', `http:${img.url}`);
    imgEl.setAttribute('alt', img.fs);
    gallery.appendChild(imgEl);
  });

  let slideIndex = 1;
  genImage(slideIndex);

  function changeImg(n) {
    genImage((slideIndex += n));
  }

  prev.addEventListener('click', () => changeImg(1));
  next.addEventListener('click', () => changeImg(-1));

  function genImage(idx) {
    const galleryImages = document.querySelectorAll('.gallery-images img');

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

  const fullIcon = document.querySelector('.fullscreen-icon');
  const saveIcon = document.querySelector('.save-icon');
  const tileIcon = document.querySelector('.tile-icon');

  function toggleFullScreen() {
    const galleryImages = document.querySelectorAll('.gallery-images img');
    const galleryControls = document.querySelectorAll('.controls-container');

    galleryImages.forEach(img => img.classList.toggle('fullscreen'));
    galleryControls.forEach(control => control.classList.toggle('hidden'));

    let fullText = fullIcon.textContent.replace(/\s/g, '');

    if (fullText === 'fullscreen') {
      fullIcon.textContent = 'fullscreen_exit';
    } else {
      fullIcon.textContent = 'fullscreen';
    }
  }

  fullIcon.addEventListener('click', () => toggleFullScreen());

  function download(img) {
    chrome.downloads.download({
      url: img,
      saveAs: true
    });
  }

  saveIcon.addEventListener('click', () =>
    download(document.querySelectorAll('.gallery-images img')[slideIndex - 1].src)
  );

  // End of gallery view

  function switchView(view) {
    if (view === 'tile') {
      currentView = 'tile';
      galleryView.classList.add('hidden');
      tileView.classList.remove('hidden');

      const tileContainer = document.querySelector('.tile-grid');

      tileContainer.innerHTML = '';

      imgs.forEach(img => {
        if (!img.url) return;
        const div = document.createElement('div');
        div.classList.add('tile');

        // Checks to see if its an image, gif or webm element

        const ext = img.url
          .split('.')
          .pop()
          .toLowerCase();

        if (ext === 'jpg' || ext === 'png' || ext === 'gif' || ext === 'jpeg') {
          const imgEl = document.createElement('img');
          imgEl.setAttribute('src', `http:${img.url}`);
          imgEl.setAttribute('alt', img.fs);
          imgEl.classList.add('tile-image');
          div.appendChild(imgEl);
        } else {
          const videoEl = document.createElement('video');
          videoEl.setAttribute('controls', false);
          videoEl.setAttribute('name', 'media');
          videoEl.setAttribute('loop', true);
          videoEl.classList.add('tile-image');

          const sourceEl = document.createElement('source');
          sourceEl.setAttribute('src', `http:${img.url}`);
          sourceEl.setAttribute('type', 'video/webm');
          videoEl.appendChild(sourceEl);

          div.appendChild(videoEl);
        }

        tileContainer.appendChild(div);
      });

      const galReturn = document.querySelector('.gallery-return');
      galReturn.addEventListener('click', () => switchView('gallery'));

      const tiles = document.querySelectorAll('.tile');

      const totalSelection = document.querySelector('.selected-num');
      function getTotalSelected() {
        let totalSelection = 0;
        tiles.forEach(tile => {
          const isSelected = tile.classList.contains('tile--active');
          if(isSelected) totalSelection++;
        });

        return totalSelection;
      }


      const tileRange = document.querySelector('.tile-range');
      tileRange.addEventListener('input', e => {
        const rangeVal = parseInt(e.target.value);

        switch (rangeVal) {
          case 1:
            console.log('case 1');
            break;

          case 2:
            console.log('case 2');
            break;

          case 3:
            console.log('case 3');
            break;

          case 4:
            console.log('case 4');
            break;
          case 5:
            console.log('case 5');
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



      let location = '';
      let size = 0;
      let name = '';
      let ext = '';
      let width = 0;
      let height = 0;

      tiles.forEach(tile => {
        tile.addEventListener('click', () => {
          tile.classList.toggle('tile--active');

          const imgEl = tile.children[0];
          const src = imgEl.src;

          location = imgEl.src;
          size = imgEl.alt;
          name = src
            .split('/')
            .pop()
            .split('/')
            .pop()
            .split('.')[0];
          ext = src
            .split('.')
            .pop()
            .toLowerCase();

          width = imgEl.naturalWidth;
          height = imgEl.naturalHeight;

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


          
          totalSelection.innerHTML = getTotalSelected();
        });
      });

      const metaBtn = document.querySelector('.meta-btn');

      metaBtn.addEventListener('click', () => {
        const currentImages = document.querySelectorAll('.tile--active');
        if (!currentImages) return;

        currentImages.forEach(img => {
          const image = img.children[0].src;
          download(image);
        });
      });

      const totalSpan = document.querySelector('.selected-total');
      totalSpan.innerHTML = tiles.length++;


    } else if (view === 'gallery') {
      currentView = 'gallery';
      galleryView.classList.remove('hidden');
      tileView.classList.add('hidden');
    } else {
      console.error('Rendering a view that doesnt exist!');
    }
  }

  tileIcon.addEventListener('click', () => switchView('tile'));

  document.addEventListener('keyup', e => {
    // Checks to see if its the gallery view
    if (currentView === 'tile') return;

    const key = e.keyCode;
    if (key === 39) {
      changeImg(1);
    } else if (key === 37) {
      changeImg(-1);
    } else {
      return;
    }
  });

  function callLoader() {
    const loader = document.querySelector('.loader');
    loader.style.display = 'block';
    setTimeout(() => {
      if (loader.style.display) {
        loader.style.display = 'none';
      }
    }, 3000);
  }

  /*  
    EASTER EGG CODE
  */

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
