import { loadConfig, saveConfig } from './config.js';
import { initCanvasEngine } from './canvas-engine.js';
import { initMediaHandler } from './media-handler.js';

(function() {
  "use strict";

  const config = loadConfig();

  // Secure Dev Modal UI binding
  const isDevAuthenticated = sessionStorage.getItem('is_authenticated_dev') === 'true';
  const devModal = document.getElementById('devModal');
  if (isDevAuthenticated) devModal.classList.add('active');

  document.getElementById('devLockBtn').addEventListener('click', () => {
    sessionStorage.removeItem('is_authenticated_dev');
    devModal.classList.remove('active');
    alert('Developer session locked successfully.');
  });

  document.getElementById('devTitle1').value = config.title1;
  document.getElementById('devTitle2').value = config.title2;
  document.getElementById('devDateText').value = config.dateText;
  document.getElementById('devHashtags').value = config.hashtags.join(', ');
  document.getElementById('devSlogans').value = config.slogans.join('\n');

  const canvas = document.getElementById('creatorCanvas');
  const canvasEngine = initCanvasEngine(canvas, config);

  const state = {
    config,
    currentMode: 'image',
    userImage: null,
    userVideo: null,
    photoScale: 1,
    photoOffsetX: 0,
    photoOffsetY: 0,
    currentSloganIndex: Math.floor(Math.random() * config.slogans.length)
  };

  document.getElementById('devSaveBtn').addEventListener('click', () => {
    config.title1 = document.getElementById('devTitle1').value;
    config.title2 = document.getElementById('devTitle2').value;
    config.dateText = document.getElementById('devDateText').value;
    config.hashtags = document.getElementById('devHashtags').value.split(',').map(s => s.trim());
    config.slogans = document.getElementById('devSlogans').value.split('\n').map(s => s.trim()).filter(Boolean);

    const backdropFileInput = document.getElementById('devBackdropInput');
    if (backdropFileInput.files && backdropFileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function(e) {
        config.customBackdropDataUrl = e.target.result;
        canvasEngine.updateBackdrop(config.customBackdropDataUrl);
        saveConfig(config);
        devModal.classList.remove('active');
        scheduleDraw();
      };
      reader.readAsDataURL(backdropFileInput.files[0]);
    } else {
      saveConfig(config);
      devModal.classList.remove('active');
      scheduleDraw();
    }
  });

  // UI Elements
  let drawScheduled = false;
  function scheduleDraw() {
    if (drawScheduled) return;
    drawScheduled = true;
    requestAnimationFrame(() => {
      drawScheduled = false;
      canvasEngine.render(state);
    });
  }

  initMediaHandler(canvas, {
    getOffsetX: () => state.photoOffsetX,
    getOffsetY: () => state.photoOffsetY,
    getScale: () => state.photoScale,
    setOffset: (x, y) => { state.photoOffsetX = x; state.photoOffsetY = y; },
    setScale: (s) => { 
      state.photoScale = s; 
      document.getElementById('zoomRange').value = s;
      document.getElementById('zoomValue').textContent = s.toFixed(1) + '×';
    },
    scheduleDraw
  });

  // Shuffle button
  document.getElementById('shuffleSloganBtn').addEventListener('click', () => {
    let newIndex;
    do { newIndex = Math.floor(Math.random() * config.slogans.length); }
    while (newIndex === state.currentSloganIndex && config.slogans.length > 1);
    state.currentSloganIndex = newIndex;
    scheduleDraw();
  });

  // Media Inputs
  const cameraInput = document.getElementById('cameraInput');
  const galleryInput = document.getElementById('galleryInput');
  const zoomRange = document.getElementById('zoomRange');
  const zoomValue = document.getElementById('zoomValue');
  const muteToggleBtn = document.getElementById('muteToggleBtn');

  zoomRange.addEventListener('input', (e) => {
    state.photoScale = parseFloat(e.target.value);
    zoomValue.textContent = state.photoScale.toFixed(1) + '×';
    scheduleDraw();
  });

  document.getElementById('cameraBtn').addEventListener('click', () => cameraInput.click());
  document.getElementById('galleryBtn').addEventListener('click', () => galleryInput.click());

  cameraInput.addEventListener('change', handleMedia);
  galleryInput.addEventListener('change', handleMedia);

  function handleMedia(e) {
    const file = e.target.files[0];
    if (!file) return;
    state.photoOffsetX = 0; state.photoOffsetY = 0; zoomRange.value = 1; state.photoScale = 1; zoomValue.textContent = '1.0×';
    
    const isVideo = file.type.startsWith('video/') || /\.(mp4|mov|m4v|3gp|avi|mkv)$/i.test(file.name);
    if (isVideo) {
      if (state.userVideo) { state.userVideo.pause(); state.userVideo = null; }
      const videoUrl = URL.createObjectURL(file);
      state.userVideo = document.createElement('video');
      state.userVideo.src = videoUrl; state.userVideo.loop = true; state.userVideo.muted = true; state.userVideo.playsInline = true;
      state.userVideo.crossOrigin = 'anonymous'; state.userVideo.load();
      state.userVideo.onloadeddata = () => state.userVideo.play().catch(()=>{});
      state.userImage = null;
      muteToggleBtn.classList.add('visible');
    } else {
      if (state.userVideo) { state.userVideo.pause(); state.userVideo = null; }
      muteToggleBtn.classList.remove('visible');
      const reader = new FileReader();
      reader.onload = (ev) => {
        state.userImage = new Image();
        state.userImage.onload = () => scheduleDraw();
        state.userImage.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Mode Switching
  document.getElementById('modeImageBtn').addEventListener('click', () => switchMode('image'));
  document.getElementById('modeVideoBtn').addEventListener('click', () => switchMode('video'));

  function switchMode(mode) {
    state.currentMode = mode;
    document.getElementById('modeImageBtn').classList.toggle('active', mode === 'image');
    document.getElementById('modeVideoBtn').classList.toggle('active', mode === 'video');
    document.getElementById('mediaTypeBadge').textContent = mode === 'image' ? 'Photo' : 'Video';
    if (mode === 'image' && state.userVideo) state.userVideo.pause();
    scheduleDraw();
  }

  // Share button
  document.getElementById('actionShareBtn').addEventListener('click', async () => {
    if (state.currentMode === 'image') {
      const dataUrl = canvas.toDataURL('image/png');
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], 'poster-story.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ title: 'ePoster', text: 'Check out my story!', files: [file] }); } catch (err) {}
      } else {
        const link = document.createElement('a'); link.download = 'poster-story.png'; link.href = dataUrl; link.click();
      }
    }
  });

  document.getElementById('headerRefreshBtn').addEventListener('click', () => window.location.reload());

  window.addEventListener('load', () => scheduleDraw());
})();
