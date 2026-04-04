/**
 * Mouse Trail Effect — colored glowing trail following the cursor
 * Pure Canvas 2D, no dependencies, works everywhere.
 * Usage: initMouseTrail(selector, { color: '#8752FA' })
 */
function initMouseTrail(selector, opts) {
  var container = document.querySelector(selector);
  if (!container) return;

  var cfg = Object.assign({
    color: [135, 82, 250],
    maxPoints: 50,
    fadeSpeed: 0.03,
    radius: 4,
    glowRadius: 25,
    glowOpacity: 0.15
  }, opts || {});

  // Parse hex color if string
  if (typeof cfg.color === 'string') {
    var hex = cfg.color.replace('#', '');
    cfg.color = [
      parseInt(hex.substring(0, 2), 16),
      parseInt(hex.substring(2, 4), 16),
      parseInt(hex.substring(4, 6), 16)
    ];
  }

  var canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:1;pointer-events:none;';
  container.appendChild(canvas);

  var ctx = canvas.getContext('2d');
  var points = [];
  var mouseX = -100, mouseY = -100;
  var active = false;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  document.addEventListener('mousemove', function(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    active = true;

    points.push({
      x: mouseX,
      y: mouseY,
      life: 1.0,
      vx: 0,
      vy: 0
    });

    // Keep array bounded
    if (points.length > cfg.maxPoints) {
      points.shift();
    }
  });

  document.addEventListener('mouseleave', function() {
    active = false;
  });

  var r = cfg.color[0], g = cfg.color[1], b = cfg.color[2];

  function frame() {
    requestAnimationFrame(frame);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = points.length - 1; i >= 0; i--) {
      var p = points[i];
      p.life -= cfg.fadeSpeed;

      if (p.life <= 0) {
        points.splice(i, 1);
        continue;
      }

      var alpha = p.life * p.life; // quadratic fade for smoother decay

      // Outer glow
      var grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, cfg.glowRadius * alpha);
      grad.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',' + (cfg.glowOpacity * alpha) + ')');
      grad.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
      ctx.beginPath();
      ctx.arc(p.x, p.y, cfg.glowRadius * alpha, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Inner bright dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, cfg.radius * alpha, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (0.6 * alpha) + ')';
      ctx.fill();
    }

    // Current cursor glow (when mouse is on page)
    if (active && mouseX > 0) {
      var cgrad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 40);
      cgrad.addColorStop(0, 'rgba(' + r + ',' + g + ',' + b + ',0.12)');
      cgrad.addColorStop(0.5, 'rgba(' + r + ',' + g + ',' + b + ',0.04)');
      cgrad.addColorStop(1, 'rgba(' + r + ',' + g + ',' + b + ',0)');
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 40, 0, Math.PI * 2);
      ctx.fillStyle = cgrad;
      ctx.fill();
    }
  }
  requestAnimationFrame(frame);
}
