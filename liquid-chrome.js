/**
 * LiquidChrome Background — adapted from ReactBits
 * Pure vanilla JS WebGL implementation (no dependencies)
 *
 * Usage: initLiquidChrome(containerSelector, { baseColor, speed, amplitude })
 */
function initLiquidChrome(selector, options = {}) {
  const container = document.querySelector(selector);
  if (!container) return;

  const {
    baseColor = [0.1, 0.1, 0.1],
    speed = 0.2,
    amplitude = 0.3,
    frequencyX = 3.0,
    frequencyY = 3.0,
    interactive = true
  } = options;

  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;';
  container.style.position = container.style.position || 'relative';
  container.insertBefore(canvas, container.firstChild);

  const gl = canvas.getContext('webgl', { antialias: true, alpha: true });
  if (!gl) return;

  // Vertex shader
  const vs = `
    attribute vec2 a_position;
    varying vec2 vUv;
    void main() {
      vUv = a_position * 0.5 + 0.5;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  // Fragment shader — LiquidChrome distortion
  const fs = `
    precision highp float;
    uniform float uTime;
    uniform vec3 uResolution;
    uniform vec3 uBaseColor;
    uniform float uAmplitude;
    uniform float uFrequencyX;
    uniform float uFrequencyY;
    uniform vec2 uMouse;
    varying vec2 vUv;

    vec4 renderImage(vec2 uvCoord) {
      vec2 fragCoord = uvCoord * uResolution.xy;
      vec2 uv = (2.0 * fragCoord - uResolution.xy) / min(uResolution.x, uResolution.y);

      for (float i = 1.0; i < 10.0; i++) {
        uv.x += uAmplitude / i * cos(i * uFrequencyX * uv.y + uTime + uMouse.x * 3.14159);
        uv.y += uAmplitude / i * cos(i * uFrequencyY * uv.x + uTime + uMouse.y * 3.14159);
      }

      vec3 color = uBaseColor / abs(sin(uTime - uv.y - uv.x));
      return vec4(color, 1.0);
    }

    void main() {
      vec4 col = vec4(0.0);
      int samples = 0;
      for (int i = -1; i <= 1; i++) {
        for (int j = -1; j <= 1; j++) {
          vec2 offset = vec2(float(i), float(j)) * (1.0 / min(uResolution.x, uResolution.y));
          col += renderImage(vUv + offset);
          samples++;
        }
      }
      gl_FragColor = col / float(samples);
    }
  `;

  function createShader(type, source) {
    const s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error(gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  const vertShader = createShader(gl.VERTEX_SHADER, vs);
  const fragShader = createShader(gl.FRAGMENT_SHADER, fs);
  if (!vertShader || !fragShader) return;

  const program = gl.createProgram();
  gl.attachShader(program, vertShader);
  gl.attachShader(program, fragShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error(gl.getProgramInfoLog(program));
    return;
  }
  gl.useProgram(program);

  // Full-screen quad
  const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(program, 'a_position');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  // Uniforms
  const uTime = gl.getUniformLocation(program, 'uTime');
  const uRes = gl.getUniformLocation(program, 'uResolution');
  const uColor = gl.getUniformLocation(program, 'uBaseColor');
  const uAmp = gl.getUniformLocation(program, 'uAmplitude');
  const uFX = gl.getUniformLocation(program, 'uFrequencyX');
  const uFY = gl.getUniformLocation(program, 'uFrequencyY');
  const uMouseLoc = gl.getUniformLocation(program, 'uMouse');

  gl.uniform3fv(uColor, baseColor);
  gl.uniform1f(uAmp, amplitude);
  gl.uniform1f(uFX, frequencyX);
  gl.uniform1f(uFY, frequencyY);
  gl.uniform2fv(uMouseLoc, [0.5, 0.5]);

  let mouseX = 0.5, mouseY = 0.5;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio, 1.5);
    const w = container.offsetWidth;
    const h = container.offsetHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform3fv(uRes, [canvas.width, canvas.height, canvas.width / canvas.height]);
  }

  window.addEventListener('resize', resize);
  resize();

  if (interactive) {
    container.addEventListener('mousemove', function(e) {
      const rect = container.getBoundingClientRect();
      mouseX = (e.clientX - rect.left) / rect.width;
      mouseY = 1 - (e.clientY - rect.top) / rect.height;
    });
  }

  let animId;
  function render(t) {
    animId = requestAnimationFrame(render);
    gl.uniform1f(uTime, t * 0.001 * speed);
    gl.uniform2fv(uMouseLoc, [mouseX, mouseY]);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  animId = requestAnimationFrame(render);

  return function destroy() {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', resize);
    if (canvas.parentElement) canvas.parentElement.removeChild(canvas);
  };
}
