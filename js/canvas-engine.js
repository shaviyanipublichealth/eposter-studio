export function initCanvasEngine(canvasEl, config) {
  const ctx = canvasEl.getContext('2d');
  
  const PRIMARY_FONT = 'AppSans';
  const SLOGAN_FONT = 'SloganFont';
  const HASHTAG_FONT = 'CustomHandwritten';

  let customBackdropImg = null;
  if (config.customBackdropDataUrl) {
    customBackdropImg = new Image();
    customBackdropImg.src = config.customBackdropDataUrl;
  }

  const newLogoImg = new Image();
  newLogoImg.crossOrigin = 'anonymous';
  newLogoImg.src = 'https://raw.githubusercontent.com/AhmedSharyph/whd-2026/main/shah_whd_logo.png';

  const mascotTrImg = new Image();
  mascotTrImg.crossOrigin = 'anonymous';
  mascotTrImg.src = 'img/mascot_tr.png';

  const ribbonImg = new Image();
  ribbonImg.crossOrigin = 'anonymous';
  ribbonImg.src = 'img/aids_ribbon.png';

  function drawBackdrop(w, h) {
    if (customBackdropImg && customBackdropImg.complete && customBackdropImg.naturalHeight !== 0) {
      ctx.drawImage(customBackdropImg, 0, 0, w, h);
    } else {
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0.00, '#4a0000');
      bgGrad.addColorStop(0.35, '#8b0000');
      bgGrad.addColorStop(1.00, '#380000');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);
    }
  }

  function wrapText(context, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '', currentY = y;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      if (context.measureText(testLine).width > maxWidth && n > 0) {
        context.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else { line = testLine; }
    }
    context.fillText(line, x, currentY);
  }

  return {
    render(state) {
      const w = canvasEl.width;
      const h = canvasEl.height;
      ctx.clearRect(0, 0, w, h);

      // 1. Backdrop
      drawBackdrop(w, h);

      // 2. Dynamic Media Canvas Area (Driven via Config)
      const frameX = state.config.mediaX ?? 610;
      const frameY = state.config.mediaY ?? 55;
      const frameW = state.config.mediaW ?? 535;
      const frameH = state.config.mediaH ?? 515;
      const frameRadius = state.config.mediaRadius ?? 18;
      const fadeDepth = state.config.fadeDepth ?? 55;
      const rgbColor = state.config.fadeColor || "107, 0, 0";

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(frameX, frameY, frameW, frameH, frameRadius);
      ctx.clip();

      if (state.currentMode === 'image') {
        if (state.userImage) {
          const iw = state.userImage.naturalWidth || state.userImage.width;
          const ih = state.userImage.naturalHeight || state.userImage.height;
          const baseScale = Math.max(frameW / iw, frameH / ih);
          let drawWidth = iw * baseScale * state.photoScale;
          let drawHeight = ih * baseScale * state.photoScale;
          const x = frameX + (frameW / 2) - (drawWidth / 2) + state.photoOffsetX;
          const y = frameY + (frameH / 2) - (drawHeight / 2) + state.photoOffsetY;
          ctx.drawImage(state.userImage, x, y, drawWidth, drawHeight);
        } else {
          ctx.fillStyle = '#f5f5f7';
          ctx.fillRect(frameX, frameY, frameW, frameH);
          ctx.fillStyle = '#b30000';
          ctx.font = `bold 22px "${PRIMARY_FONT}", sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('Tap below to add your photo', frameX + frameW / 2, frameY + frameH / 2);
        }
      } else {
        if (state.userVideo && state.userVideo.readyState >= 2) {
          const vw = state.userVideo.videoWidth;
          const vh = state.userVideo.videoHeight;
          if (vw && vh) {
            const baseScale = Math.max(frameW / vw, frameH / vh);
            let drawWidth = vw * baseScale * state.photoScale;
            let drawHeight = vh * baseScale * state.photoScale;
            const vx = frameX + (frameW / 2) - (drawWidth / 2) + state.photoOffsetX;
            const vy = frameY + (frameH / 2) - (drawHeight / 2) + state.photoOffsetY;
            ctx.drawImage(state.userVideo, vx, vy, drawWidth, drawHeight);
          }
        } else {
          ctx.fillStyle = '#f5f5f7';
          ctx.fillRect(frameX, frameY, frameW, frameH);
          ctx.fillStyle = '#8b0000';
          ctx.font = `bold 22px "${PRIMARY_FONT}", sans-serif`;
          ctx.textAlign = 'center';
          ctx.fillText('Tap below to add your video clip', frameX + frameW / 2, frameY + frameH / 2);
        }
      }

      // Dynamic Edge Fade Inflows with Custom Transparency Color
      if (fadeDepth > 0) {
        const topGrad = ctx.createLinearGradient(0, frameY, 0, frameY + fadeDepth);
        topGrad.addColorStop(0, `rgba(${rgbColor}, 0.95)`); topGrad.addColorStop(1, `rgba(${rgbColor}, 0)`);
        ctx.fillStyle = topGrad; ctx.fillRect(frameX, frameY, frameW, fadeDepth);

        const botGrad = ctx.createLinearGradient(0, frameY + frameH - fadeDepth, 0, frameY + frameH);
        botGrad.addColorStop(0, `rgba(${rgbColor}, 0)`); botGrad.addColorStop(1, `rgba(${rgbColor}, 0.95)`);
        ctx.fillStyle = botGrad; ctx.fillRect(frameX, frameY + frameH - fadeDepth, frameW, fadeDepth);

        const leftGrad = ctx.createLinearGradient(frameX, 0, frameX + fadeDepth, 0);
        leftGrad.addColorStop(0, `rgba(${rgbColor}, 0.95)`); leftGrad.addColorStop(1, `rgba(${rgbColor}, 0)`);
        ctx.fillStyle = leftGrad; ctx.fillRect(frameX, frameY, fadeDepth, frameH);

        const rightGrad = ctx.createLinearGradient(frameX + frameW - fadeDepth, 0, frameX + frameW, 0);
        rightGrad.addColorStop(0, `rgba(${rgbColor}, 0)`); rightGrad.addColorStop(1, `rgba(${rgbColor}, 0.95)`);
        ctx.fillStyle = rightGrad; ctx.fillRect(frameX + frameW - fadeDepth, frameY, fadeDepth, frameH);
      }

      ctx.restore();

      // 3. Branding Text
      ctx.save();
      const logoX = 45, logoY = 45, logoTargetHeight = 110;
      if (newLogoImg.complete && newLogoImg.naturalHeight !== 0) {
        const lAspect = newLogoImg.width / newLogoImg.height;
        const logoWidth = logoTargetHeight * lAspect;
        ctx.drawImage(newLogoImg, logoX, logoY, logoWidth, logoTargetHeight);

        const textStartX = logoX + logoWidth + 15;
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';

        ctx.font = `900 24px "${PRIMARY_FONT}", sans-serif`;
        ctx.fillText(state.config.title1, textStartX, logoY + 32);
        ctx.fillText(state.config.title2, textStartX, logoY + 62);

        ctx.font = `800 15px "${PRIMARY_FONT}", sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(state.config.dateText, textStartX, logoY + 90);
      }
      ctx.restore();

      // 4. Slogan
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = `900 32px "${SLOGAN_FONT}", sans-serif`;
      ctx.textAlign = 'left';
      wrapText(ctx, state.config.slogans[state.currentSloganIndex] || "STAY SAFE.", 45, 210, 530, 40);
      ctx.restore();

      // 5. Hashtags
      ctx.save();
      ctx.font = `700 42px "${HASHTAG_FONT}", cursive, sans-serif`;
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
      if (state.config.hashtags[0]) ctx.fillText(state.config.hashtags[0], 45, 360);
      if (state.config.hashtags[1]) ctx.fillText(state.config.hashtags[1], 45, 415);
      ctx.restore();

      // 6. Ribbon & Mascot
      if (ribbonImg.complete && ribbonImg.naturalHeight !== 0) {
        const th = 110, tw = th * (ribbonImg.width / ribbonImg.height);
        ctx.drawImage(ribbonImg, 45, 455, tw, th);
      }
      if (mascotTrImg.complete && mascotTrImg.naturalHeight !== 0) {
        const th = 120, tw = th * (mascotTrImg.width / mascotTrImg.height);
        ctx.drawImage(mascotTrImg, 200, h - th - 25, tw, th);
      }
    },
    updateBackdrop(dataUrl) {
      customBackdropImg = new Image();
      customBackdropImg.src = dataUrl;
    }
  };
}
