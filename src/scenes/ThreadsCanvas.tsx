import { Color, Mesh, Program, Renderer, Triangle } from 'ogl'
import { useEffect, useRef } from 'react'

/* Emmi's background: a straight port of React Bits' `Threads`
 * (`reactbits get_component Threads`, Backgrounds category) — same
 * "ready-made component, not another hand-drawn scene" directive that put
 * OGL's `Aurora` behind the home hero (see `AuroraCanvas.tsx`'s own header
 * and `task-14b-aurora-report.md`). This one is a second, independent
 * verbatim port: the vertex/fragment shaders and the render loop's math
 * (Perlin2D noise, the per-line `lineFn` displacement/falloff, the additive
 * line-count loop in `mainImage`) are byte-for-byte from
 * `reactbits get_component_demo Threads`.
 *
 * What changed from the original:
 *  - TypeScript types.
 *  - `color` default is Emmi's own light-cyan glow (`#78e1fa`) instead of
 *    React Bits' demo white (`[1, 1, 1]`) — a recolor, not a shader edit:
 *    `uColor` was already a uniform the stock component exposed. That exact
 *    hex is not a new invention: it's `ConvergenceScene.tsx`'s own
 *    `CORE_COLOR`, the scene this one replaces — reused here so Emmi's
 *    "glowing cyan" identity survives the swap instead of drifting to a
 *    fresh, unvalidated tone. The page's own `--page-accent`
 *    (`#0891B2`, darker/more saturated) is what tints the rest of the UI;
 *    this lighter sibling is what actually reads as thin glowing lines
 *    against `#04060d` rather than muddy teal.
 *  - `dpr` is now a prop instead of left at OGL's `Renderer` default (no
 *    `dpr` key at all in the stock component, i.e. OGL's own default of 1 —
 *    no retina upscaling) — `ThreadsBackground` sets it from
 *    `graphicsTier()`, same pattern as `AuroraCanvas`.
 *  - `paused` is additive: the rAF chain stops rescheduling itself entirely
 *    while paused (same fix `AuroraCanvas` needed — `requestAnimationFrame`
 *    still fires, throttled, on a backgrounded/offscreen tab, and this
 *    scene can sit paused for most of a visit) and a second effect restarts
 *    it the instant `paused` flips back to false, without tearing down and
 *    rebuilding the WebGL context. Nothing about the shader or the noise
 *    math changes.
 * The cleanup this component tears down with (`cancelAnimationFrame`,
 * listener removal, canvas removal guarded by `.contains`,
 * `WEBGL_lose_context`) was already present in React Bits' own `Threads` —
 * unlike Aurora's original, which needed that guard added — so it's kept
 * verbatim here too.
 */

const VERT = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const FRAG = `
precision highp float;

uniform float iTime;
uniform vec3 iResolution;
uniform vec3 uColor;
uniform float uAmplitude;
uniform float uDistance;
uniform vec2 uMouse;

#define PI 3.1415926538

const int u_line_count = 40;
const float u_line_width = 7.0;
const float u_line_blur = 10.0;

float Perlin2D(vec2 P) {
    vec2 Pi = floor(P);
    vec4 Pf_Pfmin1 = P.xyxy - vec4(Pi, Pi + 1.0);
    vec4 Pt = vec4(Pi.xy, Pi.xy + 1.0);
    Pt = Pt - floor(Pt * (1.0 / 71.0)) * 71.0;
    Pt += vec2(26.0, 161.0).xyxy;
    Pt *= Pt;
    Pt = Pt.xzxz * Pt.yyww;
    vec4 hash_x = fract(Pt * (1.0 / 951.135664));
    vec4 hash_y = fract(Pt * (1.0 / 642.949883));
    vec4 grad_x = hash_x - 0.49999;
    vec4 grad_y = hash_y - 0.49999;
    vec4 grad_results = inversesqrt(grad_x * grad_x + grad_y * grad_y)
        * (grad_x * Pf_Pfmin1.xzxz + grad_y * Pf_Pfmin1.yyww);
    grad_results *= 1.4142135623730950;
    vec2 blend = Pf_Pfmin1.xy * Pf_Pfmin1.xy * Pf_Pfmin1.xy
               * (Pf_Pfmin1.xy * (Pf_Pfmin1.xy * 6.0 - 15.0) + 10.0);
    vec4 blend2 = vec4(blend, vec2(1.0 - blend));
    return dot(grad_results, blend2.zxzx * blend2.wwyy);
}

float pixel(float count, vec2 resolution) {
    return (1.0 / max(resolution.x, resolution.y)) * count;
}

float lineFn(vec2 st, float width, float perc, float offset, vec2 mouse, float time, float amplitude, float distance) {
    float split_offset = (perc * 0.4);
    float split_point = 0.1 + split_offset;

    float amplitude_normal = smoothstep(split_point, 0.7, st.x);
    float amplitude_strength = 0.5;
    float finalAmplitude = amplitude_normal * amplitude_strength
                           * amplitude * (1.0 + (mouse.y - 0.5) * 0.2);

    float time_scaled = time / 10.0 + (mouse.x - 0.5) * 1.0;
    float blur = smoothstep(split_point, split_point + 0.05, st.x) * perc;

    float xnoise = mix(
        Perlin2D(vec2(time_scaled, st.x + perc) * 2.5),
        Perlin2D(vec2(time_scaled, st.x + time_scaled) * 3.5) / 1.5,
        st.x * 0.3
    );

    float y = 0.5 + (perc - 0.5) * distance + xnoise / 2.0 * finalAmplitude;

    float line_start = smoothstep(
        y + (width / 2.0) + (u_line_blur * pixel(1.0, iResolution.xy) * blur),
        y,
        st.y
    );

    float line_end = smoothstep(
        y,
        y - (width / 2.0) - (u_line_blur * pixel(1.0, iResolution.xy) * blur),
        st.y
    );

    return clamp(
        (line_start - line_end) * (1.0 - smoothstep(0.0, 1.0, pow(perc, 0.3))),
        0.0,
        1.0
    );
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    vec2 uv = fragCoord / iResolution.xy;

    float line_strength = 1.0;
    for (int i = 0; i < u_line_count; i++) {
        float p = float(i) / float(u_line_count);
        line_strength *= (1.0 - lineFn(
            uv,
            u_line_width * pixel(1.0, iResolution.xy) * (1.0 - p),
            p,
            (PI * 1.0) * p,
            uMouse,
            iTime,
            uAmplitude,
            uDistance
        ));
    }

    float colorVal = 1.0 - line_strength;
    fragColor = vec4(uColor * colorVal, colorVal);
}

void main() {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`

/** `#78e1fa` normalized — see file header for why this exact hex (not the
 * page's own darker `--page-accent`) is the default. */
const EMMI_THREAD_COLOR: [number, number, number] = [0.4706, 0.8824, 0.9804]

export interface ThreadsCanvasProps {
  /** Normalized RGB triple (0..1 each), fed straight into `uColor` — the
   * stock component's own contract, not a hex string (unlike Aurora's
   * `colorStops`). */
  color?: [number, number, number]
  amplitude?: number
  distance?: number
  enableMouseInteraction?: boolean
  /** Device pixel ratio for the renderer. OGL's own default is 1 (no
   * retina upscaling); `ThreadsBackground` sets this from `graphicsTier()`. */
  dpr?: number
  /** True while the container isn't intersecting the viewport. Stops the
   * rAF chain entirely (see file header) instead of merely skipping the
   * draw call — resumed by the effect below once this flips back to
   * false. */
  paused?: boolean
}

export function ThreadsCanvas({
  color = EMMI_THREAD_COLOR,
  amplitude = 1,
  distance = 0,
  enableMouseInteraction = false,
  dpr,
  paused = false,
}: ThreadsCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const animationFrameId = useRef(0)

  const pausedRef = useRef(paused)
  pausedRef.current = paused
  const updateRef = useRef<((t: number) => void) | null>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const renderer = new Renderer({ alpha: true, dpr })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    container.appendChild(gl.canvas)

    const geometry = new Triangle(gl)
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height),
        },
        uColor: { value: new Color(...color) },
        uAmplitude: { value: amplitude },
        uDistance: { value: distance },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
      },
    })

    const mesh = new Mesh(gl, { geometry, program })

    function resize() {
      const { clientWidth, clientHeight } = container as HTMLDivElement
      renderer.setSize(clientWidth, clientHeight)
      program.uniforms.iResolution.value.r = clientWidth
      program.uniforms.iResolution.value.g = clientHeight
      program.uniforms.iResolution.value.b = clientWidth / clientHeight
    }
    window.addEventListener('resize', resize)
    resize()

    let currentMouse: [number, number] = [0.5, 0.5]
    let targetMouse: [number, number] = [0.5, 0.5]

    function handleMouseMove(e: MouseEvent) {
      const rect = (container as HTMLDivElement).getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = 1.0 - (e.clientY - rect.top) / rect.height
      targetMouse = [x, y]
    }
    function handleMouseLeave() {
      targetMouse = [0.5, 0.5]
    }
    if (enableMouseInteraction) {
      container.addEventListener('mousemove', handleMouseMove)
      container.addEventListener('mouseleave', handleMouseLeave)
    }

    function update(t: number) {
      // See AuroraCanvas.tsx's own `update()` for why the chain fully stops
      // (rather than just skipping the render call) while paused.
      if (pausedRef.current) return
      animationFrameId.current = requestAnimationFrame(update)

      if (enableMouseInteraction) {
        const smoothing = 0.05
        currentMouse[0] += smoothing * (targetMouse[0] - currentMouse[0])
        currentMouse[1] += smoothing * (targetMouse[1] - currentMouse[1])
        program.uniforms.uMouse.value[0] = currentMouse[0]
        program.uniforms.uMouse.value[1] = currentMouse[1]
      } else {
        program.uniforms.uMouse.value[0] = 0.5
        program.uniforms.uMouse.value[1] = 0.5
      }
      program.uniforms.iTime.value = t * 0.001

      renderer.render({ scene: mesh })
    }
    updateRef.current = update
    if (!pausedRef.current) animationFrameId.current = requestAnimationFrame(update)

    return () => {
      cancelAnimationFrame(animationFrameId.current)
      updateRef.current = null
      window.removeEventListener('resize', resize)

      if (enableMouseInteraction) {
        container.removeEventListener('mousemove', handleMouseMove)
        container.removeEventListener('mouseleave', handleMouseLeave)
      }
      if (container.contains(gl.canvas)) container.removeChild(gl.canvas)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
    // Ported verbatim: React Bits' own effect re-runs on every prop below.
    // `dpr` is included too since it's only ever meant to be set once, from
    // the resolved tier (same call as AuroraCanvas).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, amplitude, distance, enableMouseInteraction, dpr])

  // Restarts the rAF chain the instant `paused` flips back to false — see
  // AuroraCanvas.tsx's identical second effect for the full reasoning.
  useEffect(() => {
    if (paused || !updateRef.current) return
    cancelAnimationFrame(animationFrameId.current)
    animationFrameId.current = requestAnimationFrame(updateRef.current)
  }, [paused])

  return <div ref={containerRef} className="scene-canvas__layer" style={{ width: '100%', height: '100%' }} />
}
