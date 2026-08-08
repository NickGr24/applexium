import { MeshReflectorMaterial } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { useEffect, useMemo, useRef, type MutableRefObject } from 'react'
import {
  AdditiveBlending,
  BackSide,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  CylinderGeometry,
  type Group,
  LinearSRGBColorSpace,
  type Material,
  type Mesh,
  MeshStandardMaterial,
  SRGBColorSpace,
  TorusGeometry,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { HERO_CAMERA } from './heroCamera'
import { useSceneTier, type SceneTier } from './SceneCanvasInner'

/* The hero world: an arcade standing in still water, ported from the legacy
 * site's `_legacy/scene.js` (imperative three.js) to declarative R3F.
 *
 * Everything is primitives — an arch is a half-torus on two cylinders, the
 * water is one plane, the "planet" is a sphere, the sky is one inside-out
 * sphere with a painted gradient. Nothing is downloaded beyond the libraries,
 * which is what lets the scene start the moment its chunk lands. Geometry
 * values, light positions and colours are the legacy ones; the departures are
 * listed where they happen, and all of them exist because the legacy camera
 * never moved and this one flies thirty-two units down the colonnade.
 */

/** Water level. Everything in the scene is placed relative to it. */
const WATER_Y = -2.6

/** The colour distance dissolves into — and, critically, the colour the sky
 * gradient is painted with at the horizon (see `useSkyTexture`). Fog and sky
 * agreeing on one value at eye level is the only reason the water/sky join
 * isn't a hard line straight across the frame: fully-fogged water and the sky
 * behind it resolve to the same pixel.
 *
 * It is not the page background (`#04060d`): with a black fog every arch past
 * ten units is a black silhouette on black, and the depth the colonnade is
 * there to give disappears. A lifted navy keeps the rows separable. */
const FOG_COLOR = '#091023'
/** Legacy was 0.052, tuned for a camera parked at z = 11.5. Across a dolly
 * that ends at z = -18 that density erases everything ahead; 0.034 puts the
 * half-way point of the fade at ~24 units, so four or five rows of arches are
 * always readable in front of the camera. */
const FOG_DENSITY = 0.034

/** Radius of the sky dome. Must stay inside the camera's far plane (140) —
 * it is re-centred on the camera every frame, so this is the whole budget. */
const SKY_RADIUS = 120

/** Camera dolly: from outside the colonnade to deep between the arch rows.
 * The near end has to agree with `HERO_CAMERA` — z here, and `WATER_Y +
 * CAMERA_Y_NEAR` for its y — or the first frame after the canvas mounts jumps
 * from the camera the caller set up to the one this rig wants. */
const CAMERA_Z_NEAR = HERO_CAMERA.position[2]
const CAMERA_Z_FAR = -18
/** Eye height *above the water*, not above the origin — 1.2 is the legacy
 * camera's 1.15, and it is what makes the arches tower over the frame the way
 * they do on the live site. Read as world Y the same numbers would sit almost
 * four units up, looking down on a colonnade instead of standing in it. */
const CAMERA_Y_NEAR = 1.2
/** 0.85, not the 0.4 this started at, and the reason is the horizon rather
 * than the framing. Eye height sets how quickly the water runs out to
 * infinity: at 0.4 the surface fifteen pixels below the horizon is only
 * thirty units away, so fog has taken barely half of it and the join with the
 * sky is a step from navy to near-black. At 0.85 the same fifteen pixels are
 * sixty units of water, fog is done, and the two meet on the same colour. */
const CAMERA_Y_FAR = 0.85
/** How far ahead of the camera the look-at target sits, and how far above it.
 * The lift is what keeps the horizon just below the middle of the frame. */
const LOOK_AHEAD = 21
const LOOK_LIFT = 0.7

/** The 13 arch pairs, straight out of the legacy loop: each step back is
 * wider apart, further away and slightly larger, which is what gives the
 * colonnade its false-perspective stretch. Legacy stopped at 9 because its
 * camera never left z = 11.5; four more pairs is what keeps rows in front of
 * a camera that ends at z = -18 (the last one lands at z = -57). Module
 * scope, not `useMemo` — the values never depend on props, so once per module
 * beats once per mount. */
const ARCH_PAIRS = Array.from({ length: 13 }, (_, k) => ({
  x: 7.4 + k * 0.5,
  z: -k * 4.6 - 2,
  scale: 1 + k * 0.05,
}))

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

/**
 * One arch: a half-torus resting on two cylinders, merged into a single
 * geometry (see `useArchGeometry`) so the colonnade costs 26 draw calls
 * rather than 78. The legacy version baked `scale` into every radius; here
 * the geometry is the unit arch and the mesh carries the scale.
 */
type ArchProps = {
  x: number
  z: number
  scale: number
  material: Material
  geometry: BufferGeometry
}

function Arch({ x, z, scale, material, geometry }: ArchProps) {
  return (
    <mesh
      geometry={geometry}
      material={material}
      position={[x, WATER_Y + 2.2 * scale, z]}
      scale={scale}
    />
  )
}

/** Both rows of the colonnade, mirrored across x. */
function Arcade({ material, geometry }: { material: Material; geometry: BufferGeometry }) {
  return (
    <group>
      {ARCH_PAIRS.map(({ x, z, scale }) => (
        <group key={z}>
          <Arch x={-x} z={z} scale={scale} material={material} geometry={geometry} />
          <Arch x={x} z={z} scale={scale} material={material} geometry={geometry} />
        </group>
      ))}
    </group>
  )
}

/** The single geometry every arch draws from: the half-torus and both legs
 * pre-translated into place and merged, so one arch is one mesh and one draw
 * call. Built once per mount (`useMemo`, empty deps — same reasoning as the
 * `stone` material below) and disposed on unmount, exactly like the module's
 * other GPU resources. */
function useArchGeometry() {
  const geometry = useMemo(() => {
    const arc = new TorusGeometry(1.25, 0.22, 10, 26, Math.PI).translate(0, 2.2, 0)
    const legL = new CylinderGeometry(0.22, 0.22, 4.4, 12).translate(-1.25, 0, 0)
    const legR = new CylinderGeometry(0.22, 0.22, 4.4, 12).translate(1.25, 0, 0)
    const merged = mergeGeometries([arc, legL, legR])
    arc.dispose()
    legL.dispose()
    legR.dispose()
    return merged
  }, [])
  useEffect(() => () => geometry?.dispose(), [geometry])
  return geometry
}

/**
 * The sky: a vertical gradient, painted once. Row 0 of the canvas is the
 * zenith and the middle row is the horizon — a sphere's UVs put v = 1 at the
 * north pole and v = 0.5 at the equator, so latitude maps straight onto this
 * gradient and the horizon band tracks the real horizon whatever the camera
 * does. The value at the equator is `FOG_COLOR` exactly; that is the whole
 * point of the texture.
 */
function useSkyTexture() {
  const texture = useMemo(() => {
    // Wide, even though the gradient has no horizontal component: the dither
    // below does, and on a narrow canvas the magnification filter stretches
    // each noise sample into a horizontal streak — trading banding for
    // something worse.
    const w = 256
    const h = 512
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const gradient = ctx.createLinearGradient(0, 0, 0, h)
    gradient.addColorStop(0, '#02040c') // zenith: all but black
    gradient.addColorStop(0.26, '#050a19')
    gradient.addColorStop(0.42, '#0a142d') // the haze band the arches stand against
    gradient.addColorStop(0.5, FOG_COLOR) // horizon — must match the fog
    gradient.addColorStop(1, FOG_COLOR) // below the horizon the water covers this
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, w, h)
    dither(ctx, w, h, 1.5)

    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    return tex
  }, [])

  useEffect(() => () => texture?.dispose(), [texture])
  return texture
}

/**
 * Scatters ±`amount`/255 of noise through a canvas. Stretching a 512-step
 * gradient over 900 screen pixels puts every 8-bit step across two or three
 * of them, and on a near-black sky that reads as horizontal banding — this
 * is the standard cure: trade the visible step for invisible grain.
 */
function dither(ctx: CanvasRenderingContext2D, w: number, h: number, amount: number) {
  const image = ctx.getImageData(0, 0, w, h)
  for (let i = 0; i < image.data.length; i += 4) {
    const n = Math.round((Math.random() - 0.5) * 2 * amount)
    image.data[i] = Math.max(0, Math.min(255, image.data[i] + n))
    image.data[i + 1] = Math.max(0, Math.min(255, image.data[i + 1] + n))
    image.data[i + 2] = Math.max(0, Math.min(255, image.data[i + 2] + n))
  }
  ctx.putImageData(image, 0, 0)
}

/**
 * The sky dome. A mesh rather than `scene.background`, and tone-mapped like
 * everything else on purpose: three renders a background texture with tone
 * mapping *off*, so a sky painted in `FOG_COLOR` would land on a different
 * pixel than geometry that fog took to the same colour, and the seam this is
 * here to remove would come straight back.
 *
 * It rides along with the camera so the dolly can never reach the far plane,
 * and it draws first with the depth buffer untouched — everything else in the
 * scene paints over it.
 */
function Sky() {
  const texture = useSkyTexture()
  const ref = useRef<Mesh>(null)

  useFrame((state) => {
    ref.current?.position.copy(state.camera.position)
  })

  if (!texture) return null
  return (
    <mesh ref={ref} renderOrder={-1000} frustumCulled={false}>
      <sphereGeometry args={[SKY_RADIUS, 24, 20]} />
      <meshBasicMaterial
        map={texture}
        side={BackSide}
        fog={false}
        depthWrite={false}
        // Not tone-mapped, and this is the whole trick. three applies fog in
        // `fog_fragment`, *after* tone mapping and after the colour-space
        // encode — so fully-fogged geometry comes out as `FOG_COLOR` exactly
        // as authored. A tone-mapped sky painted in the same value comes out
        // roughly half as bright, and the horizon is a step again. Skipping
        // tone mapping here puts the two back on the same number, on every
        // tier (the `high` tier's postprocessing pass happens to bypass tone
        // mapping already, which is why this only showed up on `lite`).
        toneMapped={false}
      />
    </mesh>
  )
}

/** A soft round dot. Without it points are drawn as squares, which nobody
 * notices at 3px and everybody notices when the dolly brushes past a mote. */
function useDotTexture() {
  const texture = useMemo(() => {
    const size = 32
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
    gradient.addColorStop(0, 'rgba(255,255,255,1)')
    gradient.addColorStop(0.4, 'rgba(255,255,255,0.55)')
    gradient.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, size, size)

    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    return tex
  }, [])

  useEffect(() => () => texture?.dispose(), [texture])
  return texture
}

/**
 * Dust motes hanging over the water. The legacy field was 30 deep because the
 * legacy camera never moved; this one is 90 deep and centred on the middle of
 * the flight, so the camera is inside it from the first frame to the last.
 */
function Motes({ count }: { count: number }) {
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 26
      positions[i * 3 + 1] = WATER_Y + Math.random() * 11
      positions[i * 3 + 2] = (Math.random() - 0.5) * 90 - 8
    }
    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(positions, 3))
    return geo
  }, [count])
  useEffect(() => () => geometry.dispose(), [geometry])
  const dot = useDotTexture()

  return (
    <points geometry={geometry}>
      {/* depthWrite off: transparent points that write depth punch holes in
          whatever is drawn after them. */}
      <pointsMaterial
        map={dot}
        color="#bfe6ff"
        size={0.045}
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}

/**
 * Stars. Separate from the motes on purpose: motes are dust a few metres away
 * that the camera flies through, stars are the sky. They sit on a shell that
 * travels with the camera (so the field never runs out mid-flight), they are
 * exempt from fog (haze does not swallow the sky in this scene, it swallows
 * the colonnade), and they are clamped to the upper hemisphere so none of them
 * can appear underneath the horizon where the water should be.
 *
 * `sizeAttenuation` is off — these are meant to be a constant pixel or two
 * regardless of the shell's radius, which is exactly what a star is.
 */
function Stars({ count }: { count: number }) {
  const ref = useRef<Group>(null)
  const dot = useDotTexture()

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      // Upper hemisphere only, biased away from the zenith so most of them
      // land in the band of sky the frame actually shows.
      const elevation = Math.asin(0.02 + Math.random() ** 1.6 * 0.9)
      const azimuth = Math.random() * Math.PI * 2
      const r = 70 + Math.random() * 28
      positions[i * 3] = Math.cos(elevation) * Math.sin(azimuth) * r
      positions[i * 3 + 1] = Math.sin(elevation) * r
      positions[i * 3 + 2] = Math.cos(elevation) * Math.cos(azimuth) * r

      // A field of identical dots reads as noise; a spread of brightness
      // reads as a sky.
      const b = 0.25 + Math.random() ** 2 * 0.75
      colors[i * 3] = b * 0.82
      colors[i * 3 + 1] = b * 0.9
      colors[i * 3 + 2] = b
    }
    const geo = new BufferGeometry()
    geo.setAttribute('position', new BufferAttribute(positions, 3))
    geo.setAttribute('color', new BufferAttribute(colors, 3))
    return geo
  }, [count])
  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame((state) => {
    ref.current?.position.copy(state.camera.position)
  })

  return (
    <points ref={ref} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        map={dot}
        size={2.4}
        sizeAttenuation={false}
        transparent
        opacity={0.85}
        vertexColors
        depthWrite={false}
        fog={false}
      />
    </points>
  )
}

/**
 * The light column standing in the water at the end of the arcade, painted
 * once into a canvas: a hairline core with a tight halo, peaking at the water
 * line and reaching much further down (into the reflection) than up. That
 * asymmetry is the shape it has on the live site — above the surface it is a
 * spike, below it is the body.
 *
 * The numbers are all "fraction of the quad": `CORE`/`HALO` across, `UP`/
 * `DOWN` along. They were a third wider and half again as bright before the
 * visual fix round, which — once bloom got hold of them — turned the column
 * into a capsule wide enough to wash out the subtitle and the primary CTA
 * behind it.
 */
const SHAFT_CORE = 0.03
const SHAFT_HALO = 0.14
const SHAFT_UP = 0.055
const SHAFT_DOWN = 0.2
const SHAFT_PEAK_ALPHA = 0.46

function useShaftTexture() {
  const texture = useMemo(() => {
    const w = 64
    const h = 256
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const image = ctx.createImageData(w, h)
    for (let y = 0; y < h; y++) {
      // v = 0 at the bottom of the quad: plane UVs start bottom-left.
      const v = y / (h - 1)
      const above = v > 0.5
      const along = Math.exp(-(((v - 0.5) / (above ? SHAFT_UP : SHAFT_DOWN)) ** 2))
      const taper = Math.max(0, 1 - Math.abs(2 * v - 1) ** 3)
      for (let x = 0; x < w; x++) {
        const u = x / (w - 1) - 0.5
        const core = Math.exp(-((u / SHAFT_CORE) ** 2))
        const halo = 0.26 * Math.exp(-((u / SHAFT_HALO) ** 2))
        const i = (y * w + x) * 4
        image.data[i] = 255
        image.data[i + 1] = 214 + 41 * core // #ffd6a2 in the halo, white in the core
        image.data[i + 2] = 162 + 93 * core
        image.data[i + 3] = Math.min(SHAFT_PEAK_ALPHA, (core + halo) * along * taper) * 255
      }
    }
    ctx.putImageData(image, 0, 0)

    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    return tex
  }, [])

  useEffect(() => () => texture?.dispose(), [texture])
  return texture
}

/**
 * The wide, dim warm pool the doorway casts into the mist behind it — what a
 * light source at the end of a corridor actually looks like from inside the
 * corridor. Without it the middle of the dolly is a black frame with a candle
 * in it; with it there is somewhere the flight is going.
 *
 * Linear colour space and no tone mapping: it is added on top of the frame,
 * not lit, and running it through sRGB decode would crush the low alphas this
 * relies on into nothing.
 */
function useGlowTexture() {
  const texture = useMemo(() => {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) return null

    const image = ctx.createImageData(size, size)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const dx = (x / (size - 1) - 0.5) * 2
        const dy = (y / (size - 1) - 0.5) * 2
        // A gaussian, not a colour-stop ramp: a stop list lands its last few
        // steps of alpha as visible rings once additive blending puts them on
        // a near-black sky, and the quad's own rectangle shows up with them.
        const r2 = dx * dx + dy * dy
        const core = Math.exp(-(r2 / 0.004))
        const halo = Math.exp(-(r2 / 0.05))
        // The falloff is deliberately steep relative to the quad (the quad is
        // then sized up to compensate) and the window snuffs out what is
        // left. Both are needed: additive blending on a near-black sky shows
        // one unit of alpha, so a gaussian that still has 3/255 at the border
        // draws the outline of a rectangle, and a window applied where the
        // gaussian is still meaningful draws a ring instead.
        const edge = Math.max(0, Math.min(1, (0.8 - Math.sqrt(r2)) / 0.45))
        const window = edge * edge * (3 - 2 * edge)
        const a = (0.84 * core + 0.14 * halo) * window
        const warmth = core / (core + halo + 1e-6)
        const i = (y * size + x) * 4
        // Warm in the middle, cool at the rim — a warm tail alone stains the
        // whole mid-frame maroon once additive blending has had its way.
        //
        // Half-strength colour against double the alpha above, for the same
        // product: what the tail can afford is set by how much one *step* of
        // 8-bit alpha adds, and halving the colour halves the step. At full
        // strength the last quantum before zero drew a visible arc.
        image.data[i] = 64 + 64 * warmth
        image.data[i + 1] = 76 + 31 * warmth
        image.data[i + 2] = 100 - 15 * warmth
        // The dither is what keeps the long, very low tail from stepping.
        // No dither here, unlike the sky. `toneMapped` is off and the target
        // is linear, so one unit of alpha lands as roughly three units of sRGB
        // on a background this dark — dithering the tail draws a ring of
        // speckles where a smooth contour would have gone unnoticed.
        image.data[i + 3] = Math.max(0, Math.min(255, a * 255))
      }
    }
    ctx.putImageData(image, 0, 0)

    const tex = new CanvasTexture(canvas)
    tex.colorSpace = LinearSRGBColorSpace
    return tex
  }, [])

  useEffect(() => () => texture?.dispose(), [texture])
  return texture
}

/** How far down the arcade the doorway stays, ahead of the camera. At rest
 * (progress 0) this puts the warm light on exactly the legacy z = -22.
 *
 * It closes to `_FAR` across the dolly so the end of the flight is an
 * arrival rather than a stalemate: holding a fixed 36 the whole way meant
 * the light was exactly as far away after 32 units of travel as before it,
 * and the trip read as running on the spot. Six units of gain is enough for
 * the column to grow and brighten noticeably; closing further starts down
 * the road that made the doorway travel with the camera in the first place —
 * parked four units short of the light, the shaft covers half the frame and
 * the water floods warm grey. */
const DOORWAY_DISTANCE_NEAR = 36
const DOORWAY_DISTANCE_FAR = 30
const SHAFT_WIDTH = 2.6
const SHAFT_HEIGHT = 13
/** The warm pool behind the doorway, and how much of it is on screen at each
 * end of the flight. See `Doorway` for why it ramps rather than holding. */
/** Small on purpose. Additive, un-tone-mapped light on a near-black sky shows
 * a single unit of 8-bit alpha, so wherever this quad's falloff crosses that
 * last unit there is a contour. On a wide quad that contour is a circle big
 * enough to leave the frame through the sides — and a circle seen far from its
 * centre is a horizontal band, which is how a 22-unit version drew a bar right
 * along the horizon on phones. At 10 units the contour sits close in, against
 * the column's own glare, where nothing can pick it out. */
const GLOW_SIZE = 10
const GLOW_OPACITY_NEAR = 0.4
const GLOW_OPACITY_FAR = 1
/** How much of the glow survives as a sheen on the water. Just enough to
 * bridge the water line — the reflection proper is the reflector's job. */
const GLOW_SHEEN_RATIO = 0.24

/**
 * The far end of the arcade: the warm point light that turns a colonnade into
 * somewhere you could walk, the pool of glow it throws into the mist, and the
 * column of light standing in the water underneath it — the light's visible
 * body, since a point light on its own only lights stone.
 *
 * The column takes two liberties, both to land on the reference. It ignores
 * fog: it is the thing the camera travels towards, so the mist has to part
 * for it rather than swallow it. And it ignores the depth buffer, so the half
 * below the water line paints *over* the surface as the column's reflection —
 * at x = 0, with the camera never straying a unit off centre and the arches
 * seven units out, there is nothing it can wrongly cover. The glow behind it
 * does *not* take the second liberty: arches the camera has yet to pass must
 * cut into it, or the corridor loses its depth.
 *
 * The whole doorway travels with the camera instead of standing at a fixed
 * z — see `DOORWAY_DISTANCE_NEAR`/`_FAR` above for why it moves at all, and
 * why it closes only part of the gap rather than letting the dolly reach it.
 */
function Doorway({ progressRef }: { progressRef: MutableRefObject<number> }) {
  const shaft = useShaftTexture()
  const glow = useGlowTexture()
  const ref = useRef<Group>(null)
  const glowRef = useRef<Mesh>(null)
  const sheenRef = useRef<Mesh>(null)

  useFrame((state) => {
    if (!ref.current) return
    const p = Math.min(1, Math.max(0, progressRef.current))
    const distance = lerp(DOORWAY_DISTANCE_NEAR, DOORWAY_DISTANCE_FAR, p)
    ref.current.position.z = state.camera.position.z - distance

    // The glow is the destination, so it arrives with the flight rather than
    // sitting at full strength behind the headline from the first frame —
    // where all it does is wash the copy out.
    const strength = lerp(GLOW_OPACITY_NEAR, GLOW_OPACITY_FAR, p)
    const glowMat = glowRef.current?.material as Material | undefined
    if (glowMat) glowMat.opacity = strength
    const sheenMat = sheenRef.current?.material as Material | undefined
    if (sheenMat) sheenMat.opacity = strength * GLOW_SHEEN_RATIO
  })

  return (
    <group ref={ref} position={[0, 0, -DOORWAY_DISTANCE_NEAR]}>
      <pointLight color="#ffd9a8" intensity={300} distance={60} position={[0, 1.4, 0]} />
      {glow && (
        <>
          {/* Above the water. Depth-tested, so arches the camera has not
              reached yet cut into it — that is where the corridor's depth
              comes from. */}
          <mesh ref={glowRef} position={[0, WATER_Y + 0.4, -5]}>
            <planeGeometry args={[GLOW_SIZE, GLOW_SIZE]} />
            <meshBasicMaterial
              map={glow}
              transparent
              opacity={GLOW_OPACITY_NEAR}
              blending={AdditiveBlending}
              depthWrite={false}
              toneMapped={false}
              fog={false}
            />
          </mesh>
          {/* And its sheen on the water. Without this the water plane simply
              clips the glow at eye level and the join is a hard line right
              across the frame — the very seam the sky gradient exists to
              remove. Painted over the surface (no depth test) exactly like
              the column below, and for the same reason. */}
          <mesh ref={sheenRef} position={[0, WATER_Y - 0.4, -4.9]} scale={[1, -1, 1]}>
            <planeGeometry args={[GLOW_SIZE, GLOW_SIZE]} />
            <meshBasicMaterial
              map={glow}
              transparent
              opacity={GLOW_OPACITY_NEAR * GLOW_SHEEN_RATIO}
              blending={AdditiveBlending}
              depthWrite={false}
              depthTest={false}
              toneMapped={false}
              fog={false}
            />
          </mesh>
        </>
      )}
      {shaft && (
        <mesh position={[0, WATER_Y, -4]}>
          <planeGeometry args={[SHAFT_WIDTH, SHAFT_HEIGHT]} />
          <meshBasicMaterial
            map={shaft}
            transparent
            blending={AdditiveBlending}
            depthWrite={false}
            depthTest={false}
            toneMapped={false}
            fog={false}
          />
        </mesh>
      )}
    </group>
  )
}

/** Where the planet sits, as an offset from the camera rather than a fixed
 * world position. Parked in the world it was either behind the camera by the
 * middle of the dolly (which is what made it vanish at 60%) or so close on the
 * way past that it filled a quarter of the frame. Held ahead and to the right,
 * closing and rising slightly across the flight, it stays in frame the whole
 * way and still parallaxes — it grows and drifts as the camera advances. */
const ORB_RADIUS = 1.7
const ORB_DISTANCE_NEAR = 28
const ORB_DISTANCE_FAR = 24
const ORB_X_NEAR = 5.6
const ORB_X_FAR = 6.6
const ORB_Y_NEAR = 4.6
const ORB_Y_FAR = 6.2

/** The glass planet hanging over the water, right of centre. */
function Orb({ tier, progressRef }: { tier: SceneTier; progressRef: MutableRefObject<number> }) {
  const ref = useRef<Mesh>(null)

  useFrame((state) => {
    const mesh = ref.current
    if (!mesh) return
    const t = state.clock.elapsedTime
    const p = Math.min(1, Math.max(0, progressRef.current))
    mesh.position.x = lerp(ORB_X_NEAR, ORB_X_FAR, p)
    mesh.position.y = WATER_Y + lerp(ORB_Y_NEAR, ORB_Y_FAR, p) + Math.sin(t * 0.55) * 0.2
    mesh.position.z = state.camera.position.z - lerp(ORB_DISTANCE_NEAR, ORB_DISTANCE_FAR, p)
    mesh.rotation.y = t * 0.16
  })

  return (
    <mesh ref={ref} position={[ORB_X_NEAR, WATER_Y + ORB_Y_NEAR, -ORB_DISTANCE_NEAR]}>
      <sphereGeometry args={[ORB_RADIUS, tier === 'high' ? 48 : 24, tier === 'high' ? 48 : 24]} />
      {tier === 'high' ? (
        <meshPhysicalMaterial
          // Deeper and less transmissive than the legacy orb: bloom lifts
          // everything above its threshold, and the original values under it
          // read as a white bauble rather than a planet. Lighter than the
          // first pass at this, though — at 27 units the fog is already
          // taking half of it, and the darker blue simply disappeared.
          color="#6d90c4"
          roughness={0.06}
          metalness={0.1}
          transmission={0.22}
          thickness={2.2}
          ior={1.5}
          iridescence={0.5}
          iridescenceIOR={1.9}
          iridescenceThicknessRange={[120, 560]}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      ) : (
        // Transmission needs its own render pass per frame — far too much for
        // the tier that exists because the device is slow.
        <meshStandardMaterial color="#eaf6ff" roughness={0.14} metalness={0.2} />
      )}
    </mesh>
  )
}

/** Still water. `high` gets a real (blurred) reflection; `lite` gets the
 * legacy near-mirror metal, plus the dimmed upside-down arcade underneath.
 *
 * 300 units across rather than the legacy 120: the fog is thin enough now
 * that the plane's own far edge would show as a second horizon line above the
 * real one. At this size the edge is 150 units out, well past the point where
 * fog has taken the surface to `FOG_COLOR`. */
function Water({ tier }: { tier: SceneTier }) {
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={WATER_Y}>
      <planeGeometry args={[300, 300]} />
      {tier === 'high' ? (
        <MeshReflectorMaterial
          resolution={512}
          // A 300-tap blur at 4× strength does not read as "still water", it
          // reads as fog lying on the floor: the light column is by far the
          // brightest thing in the scene, and smeared that wide and lifted
          // that hard it turned the whole lower half of the frame milky.
          blur={[160, 36]}
          mixBlur={1}
          mixStrength={1.4}
          mixContrast={1}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          // The reflection is injected as a multiplier on the base colour and
          // is lit like any other surface, so the albedo has to stay this
          // dark: raise it and the warm light at the end of the arcade turns
          // the whole surface into sand rather than water at night.
          // Metalness near 1 is not decoration, it is what keeps the water
          // black. A metal has no diffuse term, so the warm lamp at the end of
          // the arcade lights *the stone* and leaves the surface alone;
          // dropping metalness to make the water less mirror-like handed every
          // point light a diffuse pool the width of the frame — which is what
          // the milky wash across the bottom half was.
          color="#0d1622"
          roughness={0.2}
          metalness={0.9}
        />
      ) : (
        // Opaque, like the legacy original. It used to be 85% so the mirrored
        // arcade underneath could show through, but a surface that lets 15% of
        // the background past leaves a 15% step at the horizon, where the
        // water is otherwise exactly the fog — a hard line across the frame on
        // every touch device. The mirror now paints over the water instead of
        // showing through it (see `reflectedStone`).
        <meshStandardMaterial color="#080e1a" roughness={0.12} metalness={0.9} />
      )}
    </mesh>
  )
}

/**
 * Drives the camera: a scroll dolly straight down the middle of the
 * colonnade, with cursor parallax layered on top. The world never moves —
 * rotating the scene instead would betray it as an object on a turntable.
 */
function CameraRig({
  progressRef,
  parallax,
}: {
  progressRef: MutableRefObject<number>
  parallax: boolean
}) {
  useFrame((state) => {
    const { camera, pointer, clock } = state
    const p = Math.min(1, Math.max(0, progressRef.current))

    const z = lerp(CAMERA_Z_NEAR, CAMERA_Z_FAR, p)
    // The idle bob is the legacy drift, kept so the scene breathes while the
    // page is not being scrolled.
    const y =
      WATER_Y + lerp(CAMERA_Y_NEAR, CAMERA_Y_FAR, p) + Math.sin(clock.elapsedTime * 0.28) * 0.08

    const targetX = parallax ? pointer.x * 0.8 : 0
    const targetY = parallax ? y + pointer.y * 0.4 : y

    camera.position.x += (targetX - camera.position.x) * 0.05
    camera.position.y += (targetY - camera.position.y) * 0.05
    // z follows the scroll one to one — smoothing it here would fight
    // whatever smoothing the scroll driver already applies.
    camera.position.z = z
    camera.lookAt(0, y + LOOK_LIFT, z - LOOK_AHEAD)
  })

  return null
}

export type HeroWorldProps = {
  /** Hero scroll progress, 0..1. A ref, not state: it is read every frame and
   * must never cost a React render. */
  progressRef: MutableRefObject<number>
}

/**
 * Renders inside a `<SceneCanvas>`, which owns the canvas, the DPR, the
 * frameloop and the poster behind it. Camera defaults belong to the caller
 * too — see `HERO_CAMERA` for the values this scene is composed for.
 */
export function HeroWorld({ progressRef }: HeroWorldProps) {
  const tier = useSceneTier()
  const high = tier === 'high'

  const archGeometry = useArchGeometry()
  const stone = useMemo(
    // A shade off the legacy #141c2b: with the fog lifted to navy, the legacy
    // stone sat *below* the haze it stands in and every arch past the first
    // pair read as a hole rather than a column.
    () => new MeshStandardMaterial({ color: '#1b2436', roughness: 0.82, metalness: 0.05 }),
    [],
  )
  const reflectedStone = useMemo(
    () =>
      new MeshStandardMaterial({
        color: '#0e1626',
        roughness: 0.9,
        transparent: true,
        opacity: 0.34,
        // Painted over the water rather than seen through it — the water is
        // opaque so the horizon has no seam, and everything this draws is
        // below the water plane, so it can only ever land on water anyway.
        depthTest: false,
      }),
    [],
  )
  useEffect(
    () => () => {
      stone.dispose()
      reflectedStone.dispose()
    },
    [stone, reflectedStone],
  )

  return (
    <>
      <fogExp2 attach="fog" args={[FOG_COLOR, FOG_DENSITY]} />
      <Sky />

      <ambientLight color="#1a2536" intensity={1.15} />
      {/* The legacy three, at the legacy positions. Lifted clear of the water
          and reined in on `distance`, though: the legacy fill sat 3.6 units
          above the surface with a 70-unit reach, and on a plane 300 across
          under a fog thin enough to see through, that is a coloured
          searchlight pool on the water rather than light on stone. */}
      <pointLight color="#1FCDFF" intensity={170} distance={44} position={[-9, 7, 6]} />
      <pointLight color="#245efe" intensity={120} distance={40} position={[9, 5.5, 4]} />
      <pointLight color="#8a6bff" intensity={110} distance={56} position={[0, 9, -10]} />
      {/* Three more of the same, further down the colonnade. A camera that
          travels needs light where it is going: with only the legacy lamps the
          second half of the dolly is unlit stone against fog, which is exactly
          how the arches vanished at 60% and 100%. Fixed in the world, not
          carried along — pools of light the flight passes through are what
          sells the movement. High tier only: three extra point lights is three
          more per-fragment loops on every material in the scene. */}
      {high && (
        <>
          <pointLight color="#1FCDFF" intensity={105} distance={38} position={[-9.9, 7.4, -16]} />
          <pointLight color="#245efe" intensity={90} distance={38} position={[10.4, 7.4, -27]} />
          <pointLight color="#8a6bff" intensity={100} distance={56} position={[0, 8.5, -38]} />
        </>
      )}
      {/* The warm one at the end of the arcade belongs to <Doorway>, which
          carries it down the colonnade with the camera. */}

      <Arcade material={stone} geometry={archGeometry} />
      {/* The cheap reflection: the arcade mirrored on Y and dimmed. `high`
          doesn't need it — its water reflects the real thing. It reuses the
          same geometry as the arcade above, just a different material. */}
      {!high && (
        <group scale={[1, -1, 1]} position={[0, WATER_Y * 2, 0]}>
          <Arcade material={reflectedStone} geometry={archGeometry} />
        </group>
      )}

      <Water tier={tier} />
      <Orb tier={tier} progressRef={progressRef} />
      <Doorway progressRef={progressRef} />
      <Stars count={high ? 300 : 160} />
      <Motes count={high ? 240 : 120} />

      <CameraRig progressRef={progressRef} parallax={high} />

      {high && (
        <EffectComposer>
          {/* A high threshold and a short radius on purpose. Bloom is what
              turned the light column into a mile-wide capsule: the column is
              the only thing in the frame anywhere near this bright, so every
              point of intensity and every point of radius goes almost entirely
              into smearing it. Threshold at 0.42 keeps the lit stone and the
              planet out of the effect altogether. */}
          <Bloom
            intensity={0.36}
            luminanceThreshold={0.45}
            luminanceSmoothing={0.25}
            mipmapBlur
            radius={0.18}
          />
        </EffectComposer>
      )}
    </>
  )
}
