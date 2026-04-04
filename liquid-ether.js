/**
 * LiquidEther — mouse trail effect only
 * Pure WebGL, no dependencies. Cursor leaves glowing trails that fade.
 * Usage: initLiquidEther(selector, { colors })
 */
function initLiquidEther(selector, opts) {
  var container = document.querySelector(selector);
  if (!container) return;

  var cfg = Object.assign({
    colors: ['#5227FF', '#FF9FFC', '#B19EEF'],
    trailDecay: 0.965,
    brushSize: 0.08,
    trailIntensity: 5.0
  }, opts || {});

  function hexToVec3(hex) {
    hex = hex.replace('#', '');
    return [
      parseInt(hex.substring(0, 2), 16) / 255,
      parseInt(hex.substring(2, 4), 16) / 255,
      parseInt(hex.substring(4, 6), 16) / 255
    ];
  }

  var c1 = hexToVec3(cfg.colors[0]);
  var c2 = hexToVec3(cfg.colors[1]);
  var c3 = hexToVec3(cfg.colors[2]);

  var canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;';
  container.style.position = container.style.position || 'relative';
  container.insertBefore(canvas, container.firstChild);

  var gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false });
  if (!gl) return;

  var extFloat = gl.getExtension('OES_texture_float');
  var texType = extFloat ? gl.FLOAT : gl.UNSIGNED_BYTE;

  var quadVs = 'attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0,1);}';

  // Pass 1: Accumulate mouse force into trail buffer, decay previous
  var trailFs = [
    'precision highp float;',
    'varying vec2 v;',
    'uniform sampler2D prev;',
    'uniform vec2 mPos;',
    'uniform vec2 mVel;',
    'uniform float decay;',
    'uniform float aspect;',
    'uniform float brushSize;',
    'uniform float trailIntensity;',
    '',
    'void main(){',
    '  vec4 old=texture2D(prev,v)*decay;',
    '',
    '  vec2 uv=v;',
    '  uv.x*=aspect;',
    '  vec2 mp=mPos;',
    '  mp.x*=aspect;',
    '',
    '  float d=length(uv-mp);',
    '  float brush=exp(-d*d/(brushSize*brushSize*2.));',
    '  float vel=length(mVel);',
    '',
    '  // xy = accumulated velocity direction, z = heat/glow',
    '  vec2 force=mVel*brush*trailIntensity;',
    '  float heat=brush*min(vel*12.,1.);',
    '',
    '  gl_FragColor=vec4(old.xy*.98+force, old.z*.97+heat*.4, 1.);',
    '}'
  ].join('\n');

  // Pass 2: Render trails as colored glow on dark background
  var renderFs = [
    'precision highp float;',
    'varying vec2 v;',
    'uniform sampler2D trail;',
    'uniform vec3 c1,c2,c3;',
    '',
    'void main(){',
    '  vec4 tr=texture2D(trail,v);',
    '  float heat=tr.z;',
    '  float vel=length(tr.xy);',
    '',
    '  // Color based on velocity direction + heat',
    '  float angle=atan(tr.y,tr.x)*0.3183+.5;',
    '  vec3 col=mix(c1,c2,smoothstep(.0,.5,heat));',
    '  col=mix(col,c3,smoothstep(.3,.8,vel));',
    '',
    '  // Glow intensity',
    '  float glow=heat*.7+vel*.4;',
    '  glow=smoothstep(0.,.15,glow)*glow;',
    '',
    '  col*=glow;',
    '',
    '  // Subtle vignette',
    '  col*=1.-dot(v-.5,v-.5)*1.2;',
    '',
    '  gl_FragColor=vec4(col,1.);',
    '}'
  ].join('\n');

  function makeShader(type, src) {
    var s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('Shader:', gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  }

  function makeProgram(vsSrc, fsSrc) {
    var vv = makeShader(gl.VERTEX_SHADER, vsSrc);
    var ff = makeShader(gl.FRAGMENT_SHADER, fsSrc);
    if (!vv || !ff) return null;
    var pp = gl.createProgram();
    gl.attachShader(pp, vv);
    gl.attachShader(pp, ff);
    gl.linkProgram(pp);
    if (!gl.getProgramParameter(pp, gl.LINK_STATUS)) {
      console.error('Link:', gl.getProgramInfoLog(pp));
      return null;
    }
    return pp;
  }

  var trailProg = makeProgram(quadVs, trailFs);
  var renderProg = makeProgram(quadVs, renderFs);
  if (!trailProg || !renderProg) return;

  var buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);

  var fboW = 512, fboH = 512;

  function makeFBO() {
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, fboW, fboH, 0, gl.RGBA, texType, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    var fbo = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { tex: tex, fbo: fbo };
  }

  var fbo0 = makeFBO();
  var fbo1 = makeFBO();
  var ping = 0;

  var mx = 0.5, my = 0.5, smx = 0.5, smy = 0.5, pmx = 0.5, pmy = 0.5;
  document.addEventListener('mousemove', function(e) {
    mx = e.clientX / window.innerWidth;
    my = 1 - e.clientY / window.innerHeight;
  });

  function resize() {
    var dpr = Math.min(window.devicePixelRatio, 1.5);
    var scale = 0.5;
    canvas.width = window.innerWidth * dpr * scale;
    canvas.height = window.innerHeight * dpr * scale;
  }
  window.addEventListener('resize', resize);
  resize();

  // Cache uniform locations
  var trailLocs = {};
  ['prev','mPos','mVel','decay','aspect','brushSize','trailIntensity'].forEach(function(n) {
    trailLocs[n] = gl.getUniformLocation(trailProg, n);
  });
  var renderLocs = {};
  ['trail','c1','c2','c3'].forEach(function(n) {
    renderLocs[n] = gl.getUniformLocation(renderProg, n);
  });

  var animId;
  function frame() {
    animId = requestAnimationFrame(frame);

    smx += (mx - smx) * 0.12;
    smy += (my - smy) * 0.12;
    var vx = smx - pmx;
    var vy = smy - pmy;
    pmx = smx;
    pmy = smy;

    var src = ping === 0 ? fbo0 : fbo1;
    var dst = ping === 0 ? fbo1 : fbo0;
    ping = 1 - ping;

    var aspect = canvas.width / canvas.height;

    // --- Trail update ---
    gl.bindFramebuffer(gl.FRAMEBUFFER, dst.fbo);
    gl.viewport(0, 0, fboW, fboH);
    gl.useProgram(trailProg);
    var aP = gl.getAttribLocation(trailProg, 'p');
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(aP);
    gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, src.tex);
    gl.uniform1i(trailLocs.prev, 0);
    gl.uniform2f(trailLocs.mPos, smx, smy);
    gl.uniform2f(trailLocs.mVel, vx, vy);
    gl.uniform1f(trailLocs.decay, cfg.trailDecay);
    gl.uniform1f(trailLocs.aspect, aspect);
    gl.uniform1f(trailLocs.brushSize, cfg.brushSize);
    gl.uniform1f(trailLocs.trailIntensity, cfg.trailIntensity);
    gl.drawArrays(gl.TRIANGLES, 0, 6);

    // --- Screen render ---
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(renderProg);
    aP = gl.getAttribLocation(renderProg, 'p');
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.enableVertexAttribArray(aP);
    gl.vertexAttribPointer(aP, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, dst.tex);
    gl.uniform1i(renderLocs.trail, 0);
    gl.uniform3fv(renderLocs.c1, c1);
    gl.uniform3fv(renderLocs.c2, c2);
    gl.uniform3fv(renderLocs.c3, c3);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  animId = requestAnimationFrame(frame);

  return function destroy() {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', resize);
    if (canvas.parentElement) canvas.parentElement.removeChild(canvas);
  };
}
