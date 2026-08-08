/* Emmi hero scene: five particle streams, one per channel, converging into a
 * single luminous core. Boots on <canvas id="emmi-stage">.
 *
 * The product page used to share the home page's arcade (scene.js), which made
 * the two heroes near-identical — a visitor clicking through from the home page
 * landed on what looked like the page they had just left. Now the home page
 * keeps the arcade and this page draws Emmi's own claim: each stream carries a
 * channel's colour (dialer green for the phone, neutral white for the web
 * widget, Instagram's pink fading to violet, WhatsApp green, Telegram blue) and
 * every one of them dies into the same core. Five channels, one agent.
 *
 * Plain 2D canvas with additive blending and pre-rendered glow sprites — no
 * Three.js, so this page also drops the ~600KB CDN dependency the shared scene
 * needed. Ported from the React version on emmi-agent.com's landing.
 */
(function () {
  function boot() {
    var cv = document.getElementById("emmi-stage");
    if (!cv) return;
    var ctx = cv.getContext("2d");
    if (!ctx) return; // the section's own background stands in

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Emitters in viewport fractions; colours mirror the channel palette used
    // across the Emmi product. `halo` gives Instagram's sprites their gradient:
    // pink at the heart, violet at the glow's edge.
    var STREAMS = [
      { color: [52, 199, 89], from: [-0.08, 0.1], bend: -0.55 },
      { color: [217, 228, 234], from: [0.5, -0.14], bend: 0.0 },
      { color: [221, 42, 123], halo: [129, 52, 175], from: [-0.1, 0.62], bend: 0.5 },
      { color: [37, 211, 102], from: [1.1, 0.58], bend: -0.5 },
      { color: [42, 171, 238], from: [1.08, 0.08], bend: 0.55 },
    ];
    var CORE = [0.5, 0.42];
    var PER_STREAM = 110;

    var W = 0, H = 0;
    function size() {
      var dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      W = cv.clientWidth;
      H = cv.clientHeight;
      cv.width = Math.floor(W * dpr);
      cv.height = Math.floor(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    size();
    window.addEventListener("resize", size);

    // One glow sprite per stream, drawn once and stamped hundreds of times.
    // Per-particle gradients every frame are what make canvas glows slow.
    function sprite(rgb, halo) {
      var s = document.createElement("canvas");
      s.width = s.height = 64;
      var c = s.getContext("2d");
      var h = halo || rgb;
      var g = c.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, "rgba(255,255,255,.9)");
      g.addColorStop(0.25, "rgba(" + rgb[0] + "," + rgb[1] + "," + rgb[2] + ",.65)");
      g.addColorStop(0.6, "rgba(" + h[0] + "," + h[1] + "," + h[2] + ",.3)");
      g.addColorStop(1, "rgba(" + h[0] + "," + h[1] + "," + h[2] + ",0)");
      c.fillStyle = g;
      c.fillRect(0, 0, 64, 64);
      return s;
    }
    var sprites = STREAMS.map(function (s) { return sprite(s.color, s.halo); });
    var coreSprite = sprite([120, 225, 250]);

    function spawn(t) {
      return {
        t: t,
        speed: 0.05 + Math.random() * 0.06,
        phase: Math.random() * Math.PI * 2,
        freq: 5 + Math.random() * 7,
        amp: 6 + Math.random() * 22,
        size: 5 + Math.random() * 13,
      };
    }
    var particles = STREAMS.map(function () {
      var arr = [];
      for (var i = 0; i < PER_STREAM; i++) arr.push(spawn(Math.random()));
      return arr;
    });

    var tx = 0, ty = 0, px = 0, py = 0;
    window.addEventListener("pointermove", function (e) {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });

    var alive = true, onScreen = true, raf = 0;
    document.addEventListener("visibilitychange", function () {
      alive = !document.hidden;
      if (alive && onScreen && !reduce) raf = requestAnimationFrame(frame);
    });
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) {
        onScreen = es[0].isIntersecting;
        if (onScreen && alive && !reduce) raf = requestAnimationFrame(frame);
      }, { threshold: 0 }).observe(cv);
    }

    var t0 = performance.now(), last = t0;
    function frame() {
      if (!alive || !onScreen) return;
      var now = performance.now();
      var dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      draw((now - t0) / 1000, dt);
      if (!reduce) raf = requestAnimationFrame(frame);
    }

    function draw(time, dt) {
      px += (tx - px) * 0.04;
      py += (ty - py) * 0.04;
      ctx.clearRect(0, 0, W, H);

      var cx = CORE[0] * W + px * 26;
      var cy = CORE[1] * H + py * 16;

      ctx.globalCompositeOperation = "lighter";

      var breath = 1 + 0.1 * Math.sin(time * 0.9);
      var coreR = Math.min(W, H) * 0.16 * breath;
      ctx.globalAlpha = 0.5;
      ctx.drawImage(coreSprite, cx - coreR, cy - coreR, coreR * 2, coreR * 2);
      ctx.globalAlpha = 0.35;
      var inner = coreR * 0.45;
      ctx.drawImage(coreSprite, cx - inner, cy - inner, inner * 2, inner * 2);

      for (var s = 0; s < STREAMS.length; s++) {
        var st = STREAMS[s];
        var ex = st.from[0] * W + px * 55;
        var ey = st.from[1] * H + py * 34;

        // Control point: the chord's midpoint pushed along its normal, so each
        // stream arrives on its own swooping curve rather than a straight run.
        var dx = cx - ex, dy = cy - ey;
        var len = Math.sqrt(dx * dx + dy * dy) || 1;
        var nx = -dy / len, ny = dx / len;
        var bend = st.bend * len * 0.28;
        var cpx = (ex + cx) / 2 + nx * bend;
        var cpy = (ey + cy) / 2 + ny * bend;

        var spr = sprites[s], ps = particles[s];
        for (var i = 0; i < ps.length; i++) {
          var p = ps[i];
          p.t += p.speed * dt;
          if (p.t >= 1) { ps[i] = spawn(0); p = ps[i]; }
          var t = p.t, u = 1 - t;
          var bx = u * u * ex + 2 * u * t * cpx + t * t * cx;
          var by = u * u * ey + 2 * u * t * cpy + t * t * cy;
          // Wobble along the normal, pinned at both ends so streams leave the
          // emitter and enter the core cleanly.
          var env = Math.sin(Math.PI * t);
          var wob = Math.sin(p.phase + t * p.freq + time * 1.6) * p.amp * env;
          var x = bx + nx * wob, y = by + ny * wob;
          var fade = t < 0.08 ? t / 0.08 : t > 0.92 ? (1 - t) / 0.08 : 0.55 + t * 0.45;
          var sz = p.size * (1 - t * 0.35);
          ctx.globalAlpha = 0.5 * fade;
          ctx.drawImage(spr, x - sz / 2, y - sz / 2, sz, sz);
        }
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }

    if (reduce) {
      draw(6, 0.016); // one still frame: the streams shown mid-flow
    } else {
      raf = requestAnimationFrame(frame);
    }
  }

  if (document.readyState === "complete") boot();
  else window.addEventListener("load", boot);
})();
