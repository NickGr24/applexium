import { useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { useEffect, useMemo, useRef } from 'react'
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Color,
  type Group,
  type PointsMaterial as PointsMaterialType,
  SRGBColorSpace,
} from 'three'
import { frameLerp } from './frameLerp'
import { GALAXY_CAMERA } from './galaxyCamera'
import { useSceneTier, type SceneTier } from './SceneCanvasInner'

/* Precedentia's product scene: a deep field of particles standing in for
 * case law — every point a precedent, arranged in spiral arms winding
 * slowly around a bright core, the opposite character from BeamsScene's
 * rigid, close-up columns.
 *
 * Ported from React Bits' `Galaxy` (`reactbits get_component Galaxy`),
 * which is a full-viewport OGL fragment shader: four layers of
 * hash-noise star fields, each with its own per-pixel flare (`Star()`'s
 * `rays` term) and hue-shifted colour, raymarched fresh every pixel every
 * frame. That's a different renderer (OGL, not three.js) doing a
 * different job (a screen-space backdrop with no depth), and re-deriving
 * it as an on-screen shader here would fight this scene's actual need —
 * real depth, so the field can sit behind and around whatever a product
 * page composes in front of it, and a slow group rotation the camera can
 * parallax against.
 *
 * What's kept: the *shape* of `Star()`'s cross-flare (its `rays` term
 * reads as a four-point glint, not a plain soft disc) baked once into a
 * shared sprite texture instead of computed per-pixel, and per-particle
 * colour drawn from precedent age — bright core fading through
 * Precedentia's brand green to its indigo accent at the rim — standing in
 * for `Galaxy`'s per-layer hue shift.
 */

/** Matches the page background, same rationale as every other scene here. */
const FOG_COLOR = '#04060d'

/** Precedentia's palette (`_legacy/precedentia.html`'s `--pr-*`): a bright
 * mint-white core (freshest precedent), through brand green, out to the
 * cooler indigo accent at the rim (oldest). */
const CORE_COLOR = '#E0FFE9' // --pr-brand-light
const MID_COLOR = '#09E1AC' // --pr-brand
const OUTER_COLOR = '#3d39cc' // --pr-accent-light

const PARTICLES_HIGH = 12000
const PARTICLES_LITE = 6000 // half, per the lite-tier budget

const ARMS = 3
const SPIRAL_TURNS = 2.4
const CORE_RADIUS = 0.6
const OUTER_RADIUS = 6.5
const DISC_THICKNESS = 0.9
/** rad/s — the brief's own number, not tuned. */
const ROTATION_SPEED = 0.02

/** Three-stop gradient by "age" `t` (0 = core, 1 = rim), written into
 * `out` in place so the build loop below never allocates a `Color` per
 * particle. */
function ageColor(t: number, core: Color, mid: Color, outer: Color, out: Color): Color {
  if (t < 0.5) return out.copy(core).lerp(mid, t / 0.5)
  return out.copy(mid).lerp(outer, (t - 0.5) / 0.5)
}

/**
 * Builds the spiral point cloud: `ARMS` logarithmic-ish arms (angle grows
 * with radius), particles biased toward the core by `t = tRaw^0.65` so the
 * centre reads dense and the rim thins out, plus scatter that widens with
 * radius so the arms fray outward instead of staying knife-edge thin.
 */
function buildGeometry(count: number) {
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)

  const core = new Color(CORE_COLOR)
  const mid = new Color(MID_COLOR)
  const outer = new Color(OUTER_COLOR)
  const scratch = new Color()

  for (let i = 0; i < count; i++) {
    const arm = i % ARMS
    const t = Math.random() ** 0.65
    const radius = CORE_RADIUS + t * (OUTER_RADIUS - CORE_RADIUS)
    const armAngle = (arm / ARMS) * Math.PI * 2
    const angle = armAngle + t * SPIRAL_TURNS * Math.PI * 2

    const scatter = 0.25 + t * 0.65
    const r = radius + (Math.random() - 0.5) * scatter * 0.8
    const a = angle + (Math.random() - 0.5) * scatter

    positions[i * 3] = Math.cos(a) * r
    positions[i * 3 + 1] = (Math.random() - 0.5) * DISC_THICKNESS * (1 - t * 0.6)
    positions[i * 3 + 2] = Math.sin(a) * r

    ageColor(t, core, mid, outer, scratch)
    colors[i * 3] = scratch.r
    colors[i * 3 + 1] = scratch.g
    colors[i * 3 + 2] = scratch.b
  }

  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new BufferAttribute(positions, 3))
  geometry.setAttribute('color', new BufferAttribute(colors, 3))
  return geometry
}

/** A soft round point with a faint crossed flare, baked once into a shared
 * canvas texture — the static stand-in for React Bits' per-pixel `Star()`
 * rays (see the file header). Left colourless (white core, white flare) so
 * `vertexColors` on the points material is what actually tints each
 * particle by age, rather than fighting a pre-tinted sprite. */
function useStarTexture() {
  const texture = useMemo(() => {
    const size = 64
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    const c = size / 2

    const glow = ctx.createRadialGradient(c, c, 0, c, c, c)
    glow.addColorStop(0, 'rgba(255,255,255,1)')
    glow.addColorStop(0.35, 'rgba(255,255,255,0.55)')
    glow.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = glow
    ctx.fillRect(0, 0, size, size)

    // The crossed flare: two thin gradient bars through the centre,
    // additive on top of the glow — echoes `Star()`'s `rays` term without
    // needing a per-pixel shader for a sprite this small.
    ctx.globalCompositeOperation = 'lighter'
    const flare = ctx.createLinearGradient(0, c, size, c)
    flare.addColorStop(0, 'rgba(255,255,255,0)')
    flare.addColorStop(0.5, 'rgba(255,255,255,0.45)')
    flare.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = flare
    ctx.fillRect(0, c - 1, size, 2)
    ctx.fillRect(c - 1, 0, 2, size)

    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    return tex
  }, [])

  useEffect(() => () => texture?.dispose(), [texture])
  return texture
}

/** The point cloud itself: slow group rotation plus a gentle opacity
 * "breath" (same idea as `ConvergenceScene`'s `Core`), both cheap enough to
 * run on every tier. */
function GalaxyField({ tier }: { tier: SceneTier }) {
  const count = tier === 'high' ? PARTICLES_HIGH : PARTICLES_LITE
  const geometry = useMemo(() => buildGeometry(count), [count])
  useEffect(() => () => geometry.dispose(), [geometry])

  const texture = useStarTexture()
  const groupRef = useRef<Group>(null)
  const materialRef = useRef<PointsMaterialType>(null)

  useFrame((state, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += ROTATION_SPEED * delta
    if (materialRef.current) {
      materialRef.current.opacity = 0.75 + 0.2 * Math.sin(state.clock.elapsedTime * 0.4)
    }
  })

  if (!texture) return null

  return (
    <group ref={groupRef}>
      <points geometry={geometry}>
        <pointsMaterial
          ref={materialRef}
          map={texture}
          vertexColors
          size={tier === 'high' ? 0.11 : 0.13}
          sizeAttenuation
          transparent
          opacity={0.85}
          blending={AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
          fog={false}
        />
      </points>
    </group>
  )
}

/** Cursor parallax, `high` tier only — same shape as `ConvergenceScene`'s
 * `CameraRig`: always settles back on `GALAXY_CAMERA.position`. */
function CameraRig({ parallax }: { parallax: boolean }) {
  useFrame((state, delta) => {
    const { camera, pointer } = state
    const [x0, y0, z0] = GALAXY_CAMERA.position
    const targetX = parallax ? x0 + pointer.x * 1.4 : x0
    const targetY = parallax ? y0 + pointer.y * 0.8 : y0

    const k = frameLerp(0.05, delta)
    camera.position.x += (targetX - camera.position.x) * k
    camera.position.y += (targetY - camera.position.y) * k
    camera.position.z = z0
    camera.lookAt(0, 0, 0)
  })

  return null
}

/**
 * Renders inside a `<SceneCanvas camera={GALAXY_CAMERA}>`. Self-contained,
 * like `ConvergenceScene` — no props, the field just spins and breathes.
 */
export function GalaxyScene() {
  const tier = useSceneTier()
  const high = tier === 'high'

  return (
    <>
      <fogExp2 attach="fog" args={[FOG_COLOR, 0.028]} />

      <GalaxyField tier={tier} />
      <CameraRig parallax={high} />

      {high && (
        <EffectComposer>
          <Bloom intensity={0.9} luminanceThreshold={0.08} mipmapBlur radius={0.45} />
        </EffectComposer>
      )}
    </>
  )
}
