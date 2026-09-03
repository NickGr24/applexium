import { Color, Mesh, Program, Renderer, Triangle } from 'ogl'
import { useEffect, useRef } from 'react'

/* Precedentia's background: a straight port of React Bits' `Galaxy`
 * (`reactbits get_component Galaxy`, Backgrounds category) — same
 * "ready-made component" directive as `AuroraCanvas.tsx`/`ThreadsCanvas.tsx`.
 * The `RB` suffix on this file (and `GalaxyRBBackground.tsx`) exists only to
 * avoid colliding with the old `GalaxyScene.tsx`/`galaxyCamera.ts` (a
 * three.js reinterpretation of this same React Bits source) while both
 * existed side by side during this migration; the old pair is deleted in
 * this same change.
 *
 * The vertex/fragment shaders and every bit of the render loop's math
 * (`Hash21`, `tri`/`tris`/`trisn`, `hsv2rgb`, the `Star()` cross-flare,
 * `StarLayer()`'s 3x3 hashed grid, the four-layer depth loop in `main()`)
 * are byte-for-byte from `reactbits get_component_demo Galaxy`.
 *
 * What changed from the original:
 *  - TypeScript types.
 *  - `hueShift`/`saturation` defaults recolored to Precedentia's brand:
 *    `#09E1AC` sits at hue ≈165° in HSV, and `uHueShift` is what the
 *    shader's own `StarLayer()` adds to each star's procedural hue before
 *    `hsv2rgb` — a recolor, not a shader edit, same as Aurora's
 *    `colorStops`/Threads' `color`. `saturation` (stock default `0`, which
 *    zeroes out `hueShift`'s effect entirely — see the shader's own
 *    `sat = ... * uSaturation` term) is raised just enough to read as a
 *    mint tint on white stars rather than either flat white (`0`) or a
 *    fully saturated green field (`1`) — "мятно-белые" per the brief, not
 *    "ярко-зелёные". `glowIntensity` nudged up slightly for a brighter
 *    core, matching the old `GalaxyScene`'s bright-core read.
 *  - `dpr` is now a prop instead of left at OGL's `Renderer` default (no
 *    `dpr` key in the stock component) — `GalaxyRBBackground` sets this
 *    from `graphicsTier()`, same as `AuroraCanvas`/`ThreadsCanvas`.
 *  - `paused` is additive, same fix and same reasoning as
 *    `AuroraCanvas`/`ThreadsCanvas`'s own `paused` prop: the rAF chain
 *    stops rescheduling itself entirely while paused instead of merely
 *    skipping the render call, and a second effect restarts it once
 *    `paused` flips back to false without tearing down the WebGL context.
 *  - Cleanup: added the same `ctn.contains(gl.canvas)` guard before
 *    `removeChild` that `ThreadsCanvas`'s original already had (React
 *    Bits' `Galaxy` doesn't) and `AuroraCanvas`'s fix round added —
 *    matches the fix this task was told to mirror.
 */

const VERT = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`

const FRAG = `
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uStarSpeed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform bool uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform bool uTransparent;

varying vec2 vUv;

#define NUM_LAYER 4.0
#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = (0.05 * uGlowIntensity) / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uGlowIntensity;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uGlowIntensity;
  m *= smoothstep(1.0, 0.2, d);
  return m;
}

vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);

  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + vec2(float(x), float(y));
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);

      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));

      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;

      float star = Star(gv - offset - pad, flareSize);
      vec3 color = base;

      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      star *= twinkle;

      col += star * size * color;
    }
  }

  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;

  vec2 mouseNorm = uMouse - vec2(0.5);

  if (uAutoCenterRepulsion > 0.0) {
    vec2 centerUV = vec2(0.0, 0.0); // Center in UV space
    float centerDist = length(uv - centerUV);
    vec2 repulsion = normalize(uv - centerUV) * (uAutoCenterRepulsion / (centerDist + 0.1));
    uv += repulsion * 0.05;
  } else if (uMouseRepulsion) {
    vec2 mousePosUV = (uMouse * uResolution.xy - focalPx) / uResolution.y;
    float mouseDist = length(uv - mousePosUV);
    vec2 repulsion = normalize(uv - mousePosUV) * (uRepulsionStrength / (mouseDist + 0.1));
    uv += repulsion * 0.05 * uMouseActiveFactor;
  } else {
    vec2 mouseOffset = mouseNorm * 0.1 * uMouseActiveFactor;
    uv += mouseOffset;
  }

  float autoRotAngle = uTime * uRotationSpeed;
  mat2 autoRot = mat2(cos(autoRotAngle), -sin(autoRotAngle), sin(autoRotAngle), cos(autoRotAngle));
  uv = autoRot * uv;

  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;

  vec3 col = vec3(0.0);

  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
    float depth = fract(i + uStarSpeed * uSpeed);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    col += StarLayer(uv * scale + i * 453.32) * fade;
  }

  if (uTransparent) {
    float alpha = length(col);
    alpha = smoothstep(0.0, 0.3, alpha); // Enhance contrast
    alpha = min(alpha, 1.0); // Clamp to maximum 1.0
    gl_FragColor = vec4(col, alpha);
  } else {
    gl_FragColor = vec4(col, 1.0);
  }
}
`

export interface GalaxyRBCanvasProps {
  focal?: [number, number]
  rotation?: [number, number]
  starSpeed?: number
  density?: number
  /** Degrees added to each star's procedural hue. `#09E1AC` (Precedentia's
   * brand) sits at ≈165°. */
  hueShift?: number
  disableAnimation?: boolean
  speed?: number
  mouseInteraction?: boolean
  glowIntensity?: number
  /** `0` (stock default) zeroes `hueShift`'s effect out entirely — see file
   * header. */
  saturation?: number
  mouseRepulsion?: boolean
  repulsionStrength?: number
  twinkleIntensity?: number
  rotationSpeed?: number
  autoCenterRepulsion?: number
  transparent?: boolean
  /** Device pixel ratio for the renderer. OGL's own default is 1 (no
   * retina upscaling); `GalaxyRBBackground` sets this from
   * `graphicsTier()`. */
  dpr?: number
  /** True while the container isn't intersecting the viewport. Stops the
   * rAF chain entirely (see file header) instead of merely skipping the
   * draw call. */
  paused?: boolean
}

const PRECEDENTIA_HUE_SHIFT = 165
const PRECEDENTIA_SATURATION = 0.5

// Module-level defaults on purpose: both arrays sit in the main effect's
// dependency list below (ported verbatim from React Bits), so an inline
// `= [0.5, 0.5]` default would be a *new* array on every render and re-run
// the effect — tearing down and rebuilding the whole WebGL context every
// time the parent re-rendered, e.g. on each `paused` toggle from
// GalaxyRBBackground's IntersectionObserver. Caught by the 2026-09 audit
// (a fresh webgl2 context appeared on every scroll past the hero) and
// pinned by tests/scenes.test.tsx.
const DEFAULT_FOCAL: [number, number] = [0.5, 0.5]
const DEFAULT_ROTATION: [number, number] = [1.0, 0.0]

export function GalaxyRBCanvas({
  focal = DEFAULT_FOCAL,
  rotation = DEFAULT_ROTATION,
  starSpeed = 0.5,
  density = 1,
  hueShift = PRECEDENTIA_HUE_SHIFT,
  disableAnimation = false,
  speed = 1.0,
  mouseInteraction = true,
  glowIntensity = 0.35,
  saturation = PRECEDENTIA_SATURATION,
  mouseRepulsion = true,
  repulsionStrength = 2,
  twinkleIntensity = 0.3,
  rotationSpeed = 0.1,
  autoCenterRepulsion = 0,
  transparent = true,
  dpr,
  paused = false,
}: GalaxyRBCanvasProps) {
  const ctnDom = useRef<HTMLDivElement>(null)
  const targetMousePos = useRef({ x: 0.5, y: 0.5 })
  const smoothMousePos = useRef({ x: 0.5, y: 0.5 })
  const targetMouseActive = useRef(0)
  const smoothMouseActive = useRef(0)

  const pausedRef = useRef(paused)
  pausedRef.current = paused
  const updateRef = useRef<((t: number) => void) | null>(null)
  const animateIdRef = useRef(0)

  useEffect(() => {
    const ctn = ctnDom.current
    if (!ctn) return
    const renderer = new Renderer({ alpha: transparent, premultipliedAlpha: false, dpr })
    const gl = renderer.gl

    if (transparent) {
      gl.enable(gl.BLEND)
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
      gl.clearColor(0, 0, 0, 0)
    } else {
      gl.clearColor(0, 0, 0, 1)
    }

    let program: Program | undefined

    function resize() {
      renderer.setSize(ctn!.offsetWidth, ctn!.offsetHeight)
      if (program) {
        program.uniforms.uResolution.value = new Color(
          gl.canvas.width,
          gl.canvas.height,
          gl.canvas.width / gl.canvas.height,
        )
      }
    }
    window.addEventListener('resize', resize, false)
    resize()

    const geometry = new Triangle(gl)
    program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uResolution: {
          value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height),
        },
        uFocal: { value: new Float32Array(focal) },
        uRotation: { value: new Float32Array(rotation) },
        uStarSpeed: { value: starSpeed },
        uDensity: { value: density },
        uHueShift: { value: hueShift },
        uSpeed: { value: speed },
        uMouse: {
          value: new Float32Array([smoothMousePos.current.x, smoothMousePos.current.y]),
        },
        uGlowIntensity: { value: glowIntensity },
        uSaturation: { value: saturation },
        uMouseRepulsion: { value: mouseRepulsion },
        uTwinkleIntensity: { value: twinkleIntensity },
        uRotationSpeed: { value: rotationSpeed },
        uRepulsionStrength: { value: repulsionStrength },
        uMouseActiveFactor: { value: 0.0 },
        uAutoCenterRepulsion: { value: autoCenterRepulsion },
        uTransparent: { value: transparent },
      },
    })

    const mesh = new Mesh(gl, { geometry, program })

    function update(t: number) {
      // See AuroraCanvas.tsx's own `update()` for why the chain fully stops
      // (rather than just skipping the render call) while paused.
      if (pausedRef.current) return
      animateIdRef.current = requestAnimationFrame(update)

      if (!disableAnimation) {
        program!.uniforms.uTime.value = t * 0.001
        program!.uniforms.uStarSpeed.value = (t * 0.001 * starSpeed) / 10.0
      }

      const lerpFactor = 0.05
      smoothMousePos.current.x += (targetMousePos.current.x - smoothMousePos.current.x) * lerpFactor
      smoothMousePos.current.y += (targetMousePos.current.y - smoothMousePos.current.y) * lerpFactor

      smoothMouseActive.current += (targetMouseActive.current - smoothMouseActive.current) * lerpFactor

      program!.uniforms.uMouse.value[0] = smoothMousePos.current.x
      program!.uniforms.uMouse.value[1] = smoothMousePos.current.y
      program!.uniforms.uMouseActiveFactor.value = smoothMouseActive.current

      renderer.render({ scene: mesh })
    }
    updateRef.current = update
    ctn.appendChild(gl.canvas)
    if (!pausedRef.current) animateIdRef.current = requestAnimationFrame(update)

    function handleMouseMove(e: MouseEvent) {
      const rect = ctn!.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = 1.0 - (e.clientY - rect.top) / rect.height
      targetMousePos.current = { x, y }
      targetMouseActive.current = 1.0
    }

    function handleMouseLeave() {
      targetMouseActive.current = 0.0
    }

    if (mouseInteraction) {
      ctn.addEventListener('mousemove', handleMouseMove)
      ctn.addEventListener('mouseleave', handleMouseLeave)
    }

    return () => {
      cancelAnimationFrame(animateIdRef.current)
      updateRef.current = null
      window.removeEventListener('resize', resize)
      if (mouseInteraction) {
        ctn.removeEventListener('mousemove', handleMouseMove)
        ctn.removeEventListener('mouseleave', handleMouseLeave)
      }
      // See file header: React Bits' own Galaxy removes unconditionally,
      // this guard is the same fix ThreadsCanvas's original already had and
      // AuroraCanvas's fix round added.
      if (ctn.contains(gl.canvas)) ctn.removeChild(gl.canvas)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
    // Ported verbatim: React Bits' own effect re-runs on every prop below.
    // `dpr` is included too since it's only ever meant to be set once, from
    // the resolved tier.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    focal,
    rotation,
    starSpeed,
    density,
    hueShift,
    disableAnimation,
    speed,
    mouseInteraction,
    glowIntensity,
    saturation,
    mouseRepulsion,
    twinkleIntensity,
    rotationSpeed,
    repulsionStrength,
    autoCenterRepulsion,
    transparent,
    dpr,
  ])

  // Restarts the rAF chain the instant `paused` flips back to false — see
  // AuroraCanvas.tsx's identical second effect for the full reasoning.
  useEffect(() => {
    if (paused || !updateRef.current) return
    cancelAnimationFrame(animateIdRef.current)
    animateIdRef.current = requestAnimationFrame(updateRef.current)
  }, [paused])

  return <div ref={ctnDom} className="scene-canvas__layer" style={{ width: '100%', height: '100%' }} />
}
