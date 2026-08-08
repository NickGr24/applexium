import { useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { useEffect, useMemo, useRef } from 'react'
import { AdditiveBlending, Color, type Mesh, PlaneGeometry, ShaderMaterial } from 'three'
import { BEAMS_CAMERA } from './beamsCamera'
import { useSceneTier } from './SceneCanvasInner'

/* Legalia's product scene: a row of strict, vertical light columns — read
 * as "the colonnade of justice" distilled to pure light, rather than the
 * literal stone arches `HeroWorld` already owns.
 *
 * Ported from React Bits' `Beams` (`reactbits get_component Beams`), which
 * displaces a stack of merged planes with 3D Perlin noise and lights them
 * with a full PBR `MeshStandardMaterial` hot-wired onto
 * `THREE.ShaderLib.physical` (string-replacing `#include <...>` chunks
 * inside three's *internal* physical shader — a fragile, version-pinned
 * technique). That also makes the beams bend and wander, the wrong read
 * for "columns of law", which wants rigidity, not organic wobble.
 *
 * This version keeps one piece of the original's shader math — the 2D
 * value-noise function (`random`/`noise`) React Bits stipples into its
 * fragment output as dithering grain — reused below for a subtle flicker
 * layered under a sinusoidal brightness "breath" per column. Everything
 * else is dropped in favour of an unlit, additive `ShaderMaterial`, the
 * same recipe every other glow in this codebase already uses
 * (`ConvergenceScene`'s `Stream`/`Core`, `HeroWorld`'s `Doorway`), instead
 * of a physically-lit material and a directional light.
 */

/** Matches the page background, same rationale as `HeroWorld`'s FOG_COLOR. */
const FOG_COLOR = '#04060d'

/** Legalia's palette (`_legacy/legalia.html`'s `--lg-*`). `HIGHLIGHT` is
 * `--lg-grayblue` pressed into service as a pale column among the violet
 * ones — courthouse marble among the neon. */
const VIVID = '#591EF3' // --lg-vivid
const LIGHT = '#CD83FF' // --lg-light
const HIGHLIGHT = '#E4E7EE' // --lg-grayblue

const BEAMS_HIGH = 18
const BEAMS_LITE = 9 // half, per the lite-tier budget

/** World-unit half-width of the row; columns are spread across
 * [-SPREAD, SPREAD] on x. */
const SPREAD = 10
/** The columns' common footing. Set well below the lens so they read as
 * rising out of frame rather than floating — see `beamsCamera.ts`. */
const BASELINE_Y = -4

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const fragmentShader = `
uniform float uTime;
uniform float uPhase;
uniform float uSpeed;
uniform vec3 uColor;
uniform float uOpacity;
varying vec2 vUv;

// The same 2D value-noise React Bits' Beams uses for its fragment-level
// dithering grain (its module-scope \`noise\` string, verbatim) — reused
// here as a flicker under the sine "breath" below, instead of approximating
// it with a second sine term.
float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}
float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}

void main() {
  // Soft falloff top/bottom and toward each vertical edge — a column of
  // light, not a lit rectangle.
  float vertical = 1.0 - smoothstep(0.15, 0.5, abs(vUv.y - 0.5));
  float horizontal = 1.0 - smoothstep(0.05, 0.5, abs(vUv.x - 0.5));
  float breathe = 0.6 + 0.4 * sin(uTime * uSpeed + uPhase);
  float grain = noise(vUv * 30.0 + uTime * 0.6 + uPhase) * 0.08;
  float alpha = uOpacity * horizontal * vertical * breathe - grain;
  gl_FragColor = vec4(uColor, clamp(alpha, 0.0, 1.0));
}
`

type BeamDef = {
  x: number
  z: number
  width: number
  height: number
  phase: number
  speed: number
  color: Color
}

function buildBeams(count: number): BeamDef[] {
  const vivid = new Color(VIVID)
  const light = new Color(LIGHT)
  const highlight = new Color(HIGHLIGHT)

  return Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0.5 : i / (count - 1)
    const jitter = (Math.random() - 0.5) * (SPREAD / count) * 1.2
    // Every fifth column reads as pale marble among the violet ones.
    const color = i % 5 === 0 ? highlight.clone() : vivid.clone().lerp(light, t)
    return {
      x: (t - 0.5) * SPREAD * 2 + jitter,
      // A little recession toward the edges of the row — not the deep
      // field GalaxyScene owns, just enough to keep the row from reading
      // as a flat cutout.
      z: -(Math.random() * 3 + Math.abs(t - 0.5) * 2.5),
      width: 0.7 + Math.random() * 0.6,
      height: 10 + Math.random() * 4,
      phase: Math.random() * Math.PI * 2,
      speed: 0.3 + Math.random() * 0.35,
      color,
    }
  })
}

type BeamProps = {
  def: BeamDef
  geometry: PlaneGeometry
}

/** One column: a shared unit quad (see `BeamsScene` below), scaled and
 * positioned per instance, carrying its own `ShaderMaterial` instance so
 * each column's phase/speed/colour uniforms are independent — the same
 * per-instance-material shape `ConvergenceScene`'s `Stream` uses. */
function Beam({ def, geometry }: BeamProps) {
  const material = useMemo(
    () =>
      new ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uPhase: { value: def.phase },
          uSpeed: { value: def.speed },
          uColor: { value: def.color },
          uOpacity: { value: 0.85 },
        },
        transparent: true,
        blending: AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
        fog: false, // a glow standing on its own, not a lit surface — see ConvergenceScene's Stream for the same call
      }),
    [def],
  )
  useEffect(() => () => material.dispose(), [material])

  const meshRef = useRef<Mesh>(null)
  useFrame((state) => {
    material.uniforms.uTime.value = state.clock.elapsedTime
  })

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={[def.x, BASELINE_Y + def.height / 2, def.z]}
      scale={[def.width, def.height, 1]}
    />
  )
}

/** Cursor parallax, `high` tier only — same shape as `ConvergenceScene`'s
 * `CameraRig`: always settles back on `BEAMS_CAMERA.position`. */
function CameraRig({ parallax }: { parallax: boolean }) {
  useFrame((state) => {
    const { camera, pointer } = state
    const [x0, y0, z0] = BEAMS_CAMERA.position
    const targetX = parallax ? x0 + pointer.x * 1.1 : x0
    const targetY = parallax ? y0 + pointer.y * 0.5 : y0

    camera.position.x += (targetX - camera.position.x) * 0.05
    camera.position.y += (targetY - camera.position.y) * 0.05
    camera.position.z = z0
    camera.lookAt(0, 0, -6)
  })

  return null
}

/**
 * Renders inside a `<SceneCanvas camera={BEAMS_CAMERA}>`. Self-contained,
 * like `ConvergenceScene` — no props, the row just stands there and
 * breathes.
 */
export function BeamsScene() {
  const tier = useSceneTier()
  const high = tier === 'high'
  const count = high ? BEAMS_HIGH : BEAMS_LITE

  // One shared unit quad — every column scales it, rather than each
  // getting its own 4-vertex geometry for no reason (same call as
  // ConvergenceScene's shared spriteQuad).
  const geometry = useMemo(() => new PlaneGeometry(1, 1), [])
  useEffect(() => () => geometry.dispose(), [geometry])

  const beams = useMemo(() => buildBeams(count), [count])

  return (
    <>
      <fogExp2 attach="fog" args={[FOG_COLOR, 0.05]} />

      {beams.map((def, index) => (
        <Beam key={index} def={def} geometry={geometry} />
      ))}

      <CameraRig parallax={high} />

      {high && (
        <EffectComposer>
          <Bloom intensity={1.1} luminanceThreshold={0.12} mipmapBlur radius={0.5} />
        </EffectComposer>
      )}
    </>
  )
}
