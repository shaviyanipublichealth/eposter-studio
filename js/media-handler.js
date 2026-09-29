export function initMediaHandler(canvas, callbacks) {
  let isDragging = false;
  let startX = 0, startY = 0;
  let initialPinchDist = null;
  let initialScale = 1;

  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      startX = e.touches[0].clientX - callbacks.getOffsetX();
      startY = e.touches[0].clientY - callbacks.getOffsetY();
      initialPinchDist = null;
    } else if (e.touches.length === 2) {
      isDragging = false;
      initialPinchDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      initialScale = callbacks.getScale();
    }
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    if (isDragging && e.touches.length === 1) {
      callbacks.setOffset(e.touches[0].clientX - startX, e.touches[0].clientY - startY);
      callbacks.scheduleDraw();
    } else if (e.touches.length === 2 && initialPinchDist !== null) {
      const currentDist = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      let newScale = Math.max(0.5, Math.min(3.0, initialScale * (currentDist / initialPinchDist)));
      callbacks.setScale(newScale);
      callbacks.scheduleDraw();
    }
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    if (e.touches.length < 2) initialPinchDist = null;
    if (e.touches.length === 0) isDragging = false;
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX - callbacks.getOffsetX();
    startY = e.clientY - callbacks.getOffsetY();
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    callbacks.setOffset(e.clientX - startX, e.clientY - startY);
    callbacks.scheduleDraw();
  });

  window.addEventListener('mouseup', () => { isDragging = false; });
}
