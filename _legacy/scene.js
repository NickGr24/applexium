/* Hero scene: an arcade standing in still water.
 *
 * Shared by index.html and emmi.html. Any page that wants it adds
 * <canvas id="arcade-stage"></canvas> inside a positioned hero wrapper, then
 * loads three.min.js and this file.
 *
 * Built entirely from primitives — an arch is a half-torus on two cylinders,
 * the reflection is the arcade mirrored on Y and dimmed, the water is one
 * plane. Nothing is downloaded beyond the library. Flat geometry plus material
 * instead of imported meshes is the lesson from the Codrops piece on building
 * a 3D world without a single model, and it is the only way this fits a static
 * site with no build step.
 *
 * Every failure path lands on the flat gradient the pages had before: no
 * WebGL, no library, a context that throws.
 */
(function () {
  function boot() {
    var host = document.getElementById("arcade-stage");
    if (!host) return;

    function fallback() {
      host.style.background =
        "radial-gradient(70% 60% at 50% 45%,#16306b,#071116 72%)";
    }
    var reduce = window.matchMedia("(prefers-reduced-motion:reduce)").matches;
    if (!window.THREE) { fallback(); return; }

    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: host, antialias: true, alpha: true });
    } catch (e) { fallback(); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));

    var accent = host.getAttribute("data-accent") || "#1FCDFF";

    var scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x071116, 0.052);
    var camera = new THREE.PerspectiveCamera(46, 1, 0.1, 140);

    scene.add(new THREE.AmbientLight(0x1a2536, 1.0));
    var key = new THREE.PointLight(new THREE.Color(accent), 220, 70);
    key.position.set(-9, 6, 6);
    var fill = new THREE.PointLight(0x245efe, 160, 70);
    fill.position.set(9, 1, 4);
    // A warm source deep in the arcade reads as a doorway at the far end — the
    // thing that turns a colonnade into somewhere you could walk.
    var far = new THREE.PointLight(0xffd9a8, 300, 60);
    far.position.set(0, 1.4, -22);
    var rim = new THREE.PointLight(0x8a6bff, 120, 70);
    rim.position.set(0, 9, -10);
    scene.add(key, fill, far, rim);

    var WATER_Y = -2.6;
    var stone = new THREE.MeshStandardMaterial({ color: 0x141c2b, roughness: 0.82, metalness: 0.05 });

    function arch(x, z, scale) {
      var a = new THREE.Group(), r = 1.25 * scale, h = 2.2 * scale, th = 0.22 * scale;
      var curve = new THREE.Mesh(new THREE.TorusGeometry(r, th, 10, 26, Math.PI), stone);
      curve.position.y = h;
      var pL = new THREE.Mesh(new THREE.CylinderGeometry(th, th, h * 2, 12), stone);
      pL.position.set(-r, 0, 0);
      var pR = pL.clone(); pR.position.set(r, 0, 0);
      a.add(curve, pL, pR);
      a.position.set(x, WATER_Y + h, z);
      return a;
    }

    var arcade = new THREE.Group();
    for (var k = 0; k < 9; k++) {
      arcade.add(arch(-7.4 - k * 0.5, -k * 4.6 - 2, 1 + k * 0.05));
      arcade.add(arch(7.4 + k * 0.5, -k * 4.6 - 2, 1 + k * 0.05));
    }
    scene.add(arcade);

    var water = new THREE.Mesh(
      new THREE.PlaneGeometry(120, 120),
      new THREE.MeshStandardMaterial({ color: 0x060b14, roughness: 0.08, metalness: 0.9 })
    );
    water.rotation.x = -Math.PI / 2;
    water.position.y = WATER_Y;
    scene.add(water);

    // The reflection is the arcade mirrored and dimmed, not a render target —
    // at this darkness the difference is invisible and the cost is nil.
    var mirror = arcade.clone();
    mirror.scale.y = -1;
    mirror.position.y = WATER_Y * 2;
    mirror.traverse(function (o) {
      if (o.isMesh) {
        o.material = new THREE.MeshStandardMaterial({
          color: 0x0e1626, roughness: 0.9, transparent: true, opacity: 0.34
        });
      }
    });
    scene.add(mirror);

    var orb = new THREE.Mesh(
      new THREE.SphereGeometry(1.15, 48, 48),
      new THREE.MeshPhysicalMaterial({
        color: 0xeaf6ff, roughness: 0.06, metalness: 0.1,
        transmission: 0.55, thickness: 1.6, ior: 1.5,
        iridescence: 1, iridescenceIOR: 1.9, iridescenceThicknessRange: [120, 560],
        clearcoat: 1, clearcoatRoughness: 0.05
      })
    );
    orb.position.set(3.1, WATER_Y + 2.5, -4.5);
    scene.add(orb);

    var N = 240, pos = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 26;
      pos[i * 3 + 1] = WATER_Y + Math.random() * 11;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30 - 6;
    }
    var pg = new THREE.BufferGeometry();
    pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(pg, new THREE.PointsMaterial({
      color: 0xbfe6ff, size: 0.045, transparent: true, opacity: 0.5, sizeAttenuation: true
    })));

    function resize() {
      var w = host.clientWidth || window.innerWidth;
      var h = host.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
    window.addEventListener("resize", resize);
    resize();

    var tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener("pointermove", function (e) {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });

    var alive = true, onScreen = true;
    document.addEventListener("visibilitychange", function () {
      alive = !document.hidden;
      if (alive && onScreen) requestAnimationFrame(tick);
    });
    // Once the hero has scrolled away the scene stops costing frames.
    if (window.IntersectionObserver) {
      new IntersectionObserver(function (es) {
        onScreen = es[0].isIntersecting;
        if (onScreen && alive) requestAnimationFrame(tick);
      }, { threshold: 0 }).observe(host);
    }

    var t0 = performance.now();
    function tick() {
      if (!alive || !onScreen) return;
      var t = (performance.now() - t0) / 1000;
      cx += (tx - cx) * 0.045;
      cy += (ty - cy) * 0.045;
      // The camera drifts through the arcade; the world stays put. Rotating the
      // scene instead would betray it as an object on a turntable.
      camera.position.x = cx * 2.8;
      camera.position.y = WATER_Y + 1.15 - cy * 0.9 + Math.sin(t * 0.28) * 0.1;
      camera.position.z = 11.5 - Math.sin(t * 0.16) * 0.8;
      orb.position.y = WATER_Y + 2.5 + Math.sin(t * 0.55) * 0.2;
      orb.rotation.y = t * 0.16;
      camera.lookAt(0, WATER_Y + 1.9, -10);
      renderer.render(scene, camera);
      if (!reduce) requestAnimationFrame(tick);
    }
    tick();
  }

  if (document.readyState === "complete") boot();
  else window.addEventListener("load", boot);
})();
