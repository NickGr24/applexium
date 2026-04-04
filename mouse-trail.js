/**
 * Mouse Trail — smooth fluid-like glow trails
 * Inspired by ReactBits Liquid Ether.
 * Canvas 2D with additive blending and persistent fade buffer.
 */
function initMouseTrail(selector, opts) {
  var container = document.querySelector(selector);
  if (!container) return;

  var cfg = Object.assign({
    color: '#8752FA',
    secondaryColor: null, // auto-derived if not set
    brushSize: 80,
    trailStrength: 0.4,
    fadeSpeed: 0.012,
    interpolationSteps: 4
  }, opts || {});

  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16)
    };
  }

  var col = hexToRgb(cfg.color);
  var col2 = cfg.secondaryColor ? hexToRgb(cfg.secondaryColor) : {
    r: Math.min(255, col.r + 60),
    g: Math.min(255, col.g + 60),
    b: Math.min(255, col.b + 60)
  };

  // Main visible canvas
  var canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;';
  container.appendChild(canvas);
  var ctx = canvas.getContext('2d');

  // Offscreen buffer for persistent trail (fade over time)
  var buffer = document.createElement('canvas');
  var bCtx = buffer.getContext('2d');

  var w, h;
  function resize() {
    var dpr = Math.min(window.devicePixelRatio, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Preserve buffer content on resize
    var oldData = null;
    if (buffer.width > 0 && buffer.height > 0) {
      oldData = bCtx.getImageData(0, 0, buffer.width, buffer.height);
    }
    buffer.width = w;
    buffer.height = h;
    if (oldData) {
      bCtx.putImageData(oldData, 0, 0);
    }
  }
  window.addEventListener('resize', resize);
  resize();

  var mouseX = -200, mouseY = -200;
  var prevX = -200, prevY = -200;
  var velocityX = 0, velocityY = 0;
  var isOnPage = false;

  document.addEventListener('mousemove', function(e) {
    prevX = mouseX;
    prevY = mouseY;
    mouseX = e.clientX;
    mouseY = e.clientY;
    velocityX = mouseX - prevX;
    velocityY = mouseY - prevY;
    isOnPage = true;
  });

  document.addEventListener('mouseleave', function() {
    isOnPage = false;
  });

  function drawBlob(context, x, y, size, r, g, b, alpha) {
    var grad = context.createRadialGradient(x, y, 0, x, y, size);
    grad.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')');
    grad.addColorStop(0.4, 'rgba(' + r + ',' + g + ',' + b + ',' + (alpha * 0.5) + ')');
    grad.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
    context.fillStyle = grad;
    context.beginPath();
    context.arc(x, y, size, 0, Math.PI * 2);
    context.fill();
  }

  function frame() {
    requestAnimationFrame(frame);

    // Fade the buffer slightly each frame
    bCtx.globalCompositeOperation = 'destination-out';
    bCtx.fillStyle = 'rgba(0,0,0,' + cfg.fadeSpeed + ')';
    bCtx.fillRect(0, 0, w, h);
    bCtx.globalCompositeOperation = 'lighter'; // additive blending

    // Draw trail between prev and current mouse positions
    if (isOnPage && prevX > -100) {
      var speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      var strength = Math.min(speed / 30, 1);

      if (strength > 0.02) {
        var steps = cfg.interpolationSteps;
        for (var i = 0; i <= steps; i++) {
          var t = i / steps;
          var x = prevX + (mouseX - prevX) * t;
          var y = prevY + (mouseY - prevY) * t;

          // Size varies with speed
          var size = cfg.brushSize * (0.5 + strength * 0.8);

          // Main trail blob
          drawBlob(bCtx, x, y, size,
            col.r, col.g, col.b,
            cfg.trailStrength * strength
          );

          // Smaller bright core
          drawBlob(bCtx, x, y, size * 0.3,
            col2.r, col2.g, col2.b,
            cfg.trailStrength * strength * 0.6
          );
        }

        // Extra wide ambient blob at cursor
        drawBlob(bCtx, mouseX, mouseY, cfg.brushSize * 1.8,
          col.r, col.g, col.b,
          cfg.trailStrength * strength * 0.15
        );
      }
    }

    // Render buffer to screen
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(buffer, 0, 0);

    // Subtle live cursor glow (always visible when on page)
    if (isOnPage && mouseX > -100) {
      ctx.globalCompositeOperation = 'lighter';
      drawBlob(ctx, mouseX, mouseY, 50,
        col.r, col.g, col.b, 0.06
      );
      drawBlob(ctx, mouseX, mouseY, 15,
        col2.r, col2.g, col2.b, 0.08
      );
      ctx.globalCompositeOperation = 'source-over';
    }
  }
  requestAnimationFrame(frame);
}
