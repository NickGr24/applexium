import { Color, Mesh, Program, Renderer, Triangle } from 'ogl'
import { useEffect, useRef, type RefObject } from 'react'

/* Hero's background: a straight port of React Bits' `Aurora`
 * (`reactbits get_component Aurora`, Backgrounds category) — the user
 * rejected two rounds of a hand-built hero scene ("отрисовано плохо") and
 * asked for a ready-made component instead of another custom drawing, so
 * this keeps the vertex/fragment shaders and the render loop's math
 * byte-for-byte as shipped: the simplex noise (`snoise`), the color-ramp
 * macro, and the height/intensity function that turns `uv.y` into the
 * glow band. OGL is a new, second WebGL runtime alongside three.js/R3F —
 * everywhere else in `src/scenes/*` a React Bits source gets reinterpreted
 * in three.js instead (`BeamsScene`, `GalaxyScene`), specifically to avoid
 * that — but reinterpreting is exactly what produced the rejected scene,
 * so this one component is the deliberate exception. `ogl` is ~30KB and
 * only this lazy chunk (see `AuroraBackground.tsx`) pays for it.
 *
 * What changed from the original:
 *  - TypeScript types.
 *  - `colorStops` default is the brand gradient (`--brand-deep` /
 *    `--brand-blue` / `--brand-cyan`) instead of React Bits' demo purple/
 *    green — a recolor, not a shader edit: `uColorStops` was already a
 *    uniform the stock component exposed.
 *  - `dpr` is now a prop instead of left at OGL's `Renderer` default (1,
 *    i.e. no retina upscaling at all) — `AuroraBackground` sets it from
 *    `graphicsTier()`.
 *  - `progressRef` and `paused` are additive: read straight off refs inside
 *    the existing `update()` loop (never through React state — same
 *    reasoning as `HeroSection`'s own `progressRef`), feeding the
 *    already-exposed `uAmplitude` uniform and gating the `render()` call.
 *    Nothing about the shader or the noise/color-ramp math changes.
 */

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ),
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) {              \\
  int index = 0;                                            \\
  for (int i = 0; i < 2; i++) {                               \\
     ColorStop currentColor = colors[i];                    \\
     bool isInBetween = currentColor.position <= factor;    \\
     index = int(mix(float(index), float(i), float(isInBetween))); \\
  }                                                         \\
  ColorStop currentColor = colors[index];                   \\
  ColorStop nextColor = colors[index + 1];                  \\
  float range = nextColor.position - currentColor.position; \\
  float lerpFactor = (factor - currentColor.position) / range; \\
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \\
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);

  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);

  float height = snoise(vec2(uv.x * 2.0 + uTime * 0.1, uTime * 0.25)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 2.0 - height + 0.2);
  float intensity = 0.6 * height;

  float midPoint = 0.20;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.5, midPoint + uBlend * 0.5, intensity);

  vec3 auroraColor = intensity * rampColor;

  fragColor = vec4(auroraColor * auroraAlpha, auroraAlpha);
}
`

const BRAND_COLOR_STOPS: [string, string, string] = ['#1C1890', '#245EFE', '#1FCDFF']

export interface AuroraCanvasProps {
  /** Left→right ramp. Ordered deep → blue → cyan, matching `--glow` in
   * tokens.css. */
  colorStops?: [string, string, string]
  /** Base wave amplitude. Effectively fixed for the life of the mount: the
   * effect below lists it as a dependency (ported verbatim — React Bits'
   * own `Aurora` tears down and rebuilds the whole WebGL context whenever
   * this value changes), so callers should pass a value that doesn't churn
   * per-render, e.g. one resolved once from `graphicsTier()`. */
  amplitude?: number
  blend?: number
  speed?: number
  /** Device pixel ratio for the renderer. OGL's own default is 1 (no
   * retina upscaling); `AuroraBackground` sets this from `graphicsTier()`. */
  dpr?: number
  /** 0..1, read every animation frame — never through React state, so a
   * scroll tick never forces a re-render — and folded into `uAmplitude` so
   * the aurora swells gently while the visitor scrolls through the hero
   * track. Omit to leave amplitude at its static value. */
  progressRef?: RefObject<number>
  /** True while the container isn't intersecting the viewport. Stops the
   * rAF chain entirely (see `update()`'s own comment below for why —
   * skipping only the draw call isn't enough) — the OGL equivalent of R3F's
   * `frameloop: 'never'` (what `BeamsRBBackground` uses instead, since it
   * mounts a real `<Canvas>` rather than a raw OGL renderer). Every sibling
   * OGL scene in this directory (`ThreadsCanvas`, `GalaxyRBCanvas`) mirrors
   * this exact fix. */
  paused?: boolean
}

export function AuroraCanvas({
  colorStops = BRAND_COLOR_STOPS,
  amplitude = 1.0,
  blend = 0.5,
  speed = 1.0,
  dpr,
  progressRef,
  paused = false,
}: AuroraCanvasProps) {
  const propsRef = useRef({ colorStops, amplitude, blend, speed })
  propsRef.current = { colorStops, amplitude, blend, speed }

  const pausedRef = useRef(paused)
  pausedRef.current = paused

  const ctnDom = useRef<HTMLDivElement>(null)
  // `update` (defined inside the effect below, since it closes over the
  // renderer/program/mesh that effect creates) and the id of whichever
  // frame is currently scheduled — read from the second effect further
  // down so it can restart the rAF chain once `paused` flips back to
  // false. See that effect's own comment for why a restart hook is needed
  // at all instead of just always rescheduling.
  const updateRef = useRef<((t: number) => void) | null>(null)
  const animateIdRef = useRef(0)

  useEffect(() => {
    const ctn = ctnDom.current
    if (!ctn) return

    const renderer = new Renderer({
      alpha: true,
      premultipliedAlpha: true,
      antialias: true,
      dpr,
    })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.canvas.style.backgroundColor = 'transparent'

    let program: Program | undefined

    function resize() {
      if (!ctn) return
      const width = ctn.offsetWidth
      const height = ctn.offsetHeight
      renderer.setSize(width, height)
      if (program) {
        program.uniforms.uResolution.value = [width, height]
      }
    }
    window.addEventListener('resize', resize)

    const geometry = new Triangle(gl)
    if (geometry.attributes.uv) {
      delete geometry.attributes.uv
    }

    const colorStopsArray = colorStops.map((hex) => {
      const c = new Color(hex)
      return [c.r, c.g, c.b]
    })

    program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uColorStops: { value: colorStopsArray },
        uResolution: { value: [ctn.offsetWidth, ctn.offsetHeight] },
        uBlend: { value: blend },
      },
    })

    const mesh = new Mesh(gl, { geometry, program })
    ctn.appendChild(gl.canvas)

    const update = (t: number) => {
      // Offscreen: stop the rAF chain entirely instead of skipping just the
      // uniform math and draw call — `requestAnimationFrame` still fires on
      // a backgrounded/offscreen tab (throttled, not free), and this scene
      // can sit paused for most of a visit (below-the-fold sections of the
      // hero track, or a backgrounded tab). The chain is restarted by the
      // effect below the moment `paused` flips back to false; nothing here
      // needs to keep polling for that on its own.
      if (pausedRef.current) return
      animateIdRef.current = requestAnimationFrame(update)

      const current = propsRef.current
      const progress = progressRef?.current ?? 0
      // Scroll-through-hero swell: same `uAmplitude`/`uTime` uniforms the
      // stock component already drives every frame, just fed
      // progress-boosted values instead of the static props alone.
      program!.uniforms.uAmplitude.value = current.amplitude * (1 + progress * 0.35)
      program!.uniforms.uTime.value = t * 0.01 * (current.speed * (1 + progress * 0.25)) * 0.1
      program!.uniforms.uBlend.value = current.blend
      program!.uniforms.uColorStops.value = current.colorStops.map((hex) => {
        const c = new Color(hex)
        return [c.r, c.g, c.b]
      })
      renderer.render({ scene: mesh })
    }
    updateRef.current = update
    // Respect an already-paused initial prop rather than always starting —
    // AuroraBackground only mounts this component once its own
    // IntersectionObserver has already fired at least once, so in practice
    // `paused` is false here, but this keeps the effect honest either way.
    if (!pausedRef.current) animateIdRef.current = requestAnimationFrame(update)

    resize()

    return () => {
      cancelAnimationFrame(animateIdRef.current)
      updateRef.current = null
      window.removeEventListener('resize', resize)
      if (ctn && gl.canvas.parentNode === ctn) {
        ctn.removeChild(gl.canvas)
      }
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
    // Ported verbatim: React Bits' own effect only ever re-runs on
    // `amplitude` (see the prop doc above) — `dpr` is included too since
    // it's likewise only meant to be set once, from the resolved tier.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amplitude, dpr])

  // Restarts the rAF chain the instant `paused` flips back to false. The
  // main effect above intentionally does not depend on `paused` (that
  // would tear down and rebuild the whole WebGL context on every
  // pause/resume, not just start/stop a loop), so `update` itself stops
  // rescheduling itself while paused (see its own comment) and nothing else
  // would ever kick it awake again without this.
  useEffect(() => {
    if (paused || !updateRef.current) return
    cancelAnimationFrame(animateIdRef.current)
    animateIdRef.current = requestAnimationFrame(updateRef.current)
  }, [paused])

  return <div ref={ctnDom} style={{ width: '100%', height: '100%' }} />
}
