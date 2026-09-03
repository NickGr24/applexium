/* eslint-disable react/no-unknown-property */
import { PerspectiveCamera } from '@react-three/drei'
import { Canvas, useFrame, type CanvasProps } from '@react-three/fiber'
import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { degToRad } from 'three/src/math/MathUtils.js'

/* Legalia's background: a straight port of React Bits' `Beams`
 * (`reactbits get_component Beams`, Backgrounds category) — same
 * "ready-made component" directive as `AuroraCanvas.tsx`/`ThreadsCanvas.tsx`/
 * `GalaxyRBCanvas.tsx`. The `RB` suffix (here and on
 * `BeamsRBBackground.tsx`) exists only to avoid colliding with the old
 * `BeamsScene.tsx`/`beamsCamera.ts` (a three.js reinterpretation of this
 * same React Bits source) while both existed side by side during this
 * migration; the old pair is deleted in this same change.
 *
 * Unlike Aurora/Threads/Galaxy, React Bits ships `Beams` on three.js +
 * `@react-three/fiber` + `@react-three/drei`'s `PerspectiveCamera` — not
 * OGL. Per the brief ("какой рантайм у компонента — тот и используй, не
 * переписывай"), this port keeps that runtime rather than forcing it onto
 * OGL for consistency with its two siblings above: `extendMaterial()`
 * (string-splicing custom vertex/fragment chunks into three's own
 * `ShaderLib.physical`), the `noise`/`cnoise` GLSL, and
 * `createStackedPlanesBufferGeometry()`'s vertex/index math are all
 * byte-for-byte from `reactbits get_component_demo Beams`.
 *
 * What changed from the original:
 *  - TypeScript types throughout (`extendMaterial`'s config shape,
 *    `MergedPlanes`/`DirLight`'s props, the geometry builder's typed
 *    arrays).
 *  - `beamColor` and `background` are new props, promoted from two literals
 *    the stock component hardcodes at the *call site* (not exposed as
 *    props there): the material's own `diffuse` uniform
 *    (`hexToNormalizedRGB("#000000")`) and `<color attach="background"
 *    args={["#000000"]} />`. Promoting a hardcoded constant to a prop is a
 *    colour/config change, not a shader edit — the uniform and the JSX
 *    prop it feeds were already there; only the value's origin moves.
 *    Defaults: `beamColor` = Legalia's vivid violet (`#591EF3`,
 *    `BeamsScene.tsx`'s own `VIVID`), `background` = the shared page
 *    background (`#04060d`, `FOG_COLOR` in every scene this migration
 *    replaces) instead of the stock demo's flat black.
 *  - `lightColor` default is Legalia's light violet (`#CD83FF`,
 *    `BeamsScene.tsx`'s own `LIGHT`) instead of the stock demo's white —
 *    the directional light this component already exposed as a prop, just
 *    recoloured.
 *  - `dpr`/`paused` are new props threaded onto the `<Canvas>` this
 *    component mounts itself (React Bits' own `CanvasWrapper`, inlined
 *    here rather than kept as a separate wrapper component since nothing
 *    else uses it) — `paused` maps straight to R3F's own `frameloop`
 *    ('never' fully stops Canvas's internal rAF loop, not just individual
 *    draw calls — this is the same toggle `SceneCanvas`/`ProductShowcase`
 *    already relied on for the old three.js scenes, so no new pause
 *    mechanism was needed the way OGL's Aurora/Threads/Galaxy required
 *    one).
 *
 * Balance fix round (post-review — coordinator rejected the first cutover:
 * beams read as a solid saturated-purple wall filling the whole viewport,
 * mono label/subhead/logo all lost contrast against it, unlike Emmi's/
 * Precedentia's "dark base + glowing accents" siblings). All changes below
 * are still prop/config values the component already exposed, or a
 * hardcoded literal promoted the same way `beamColor`/`background`/
 * `ambientIntensity` were — no shader string or animation-math line
 * touched:
 *  - `beamColor` default deepened from the original vivid `#591EF3` to a
 *    near-black violet `#1a0b3d` — this uniform is the material's *base*
 *    diffuse across the whole surface, not a highlight, so keeping it
 *    vivid meant the beams were saturated purple even unlit.
 *  - `lightIntensity` is a new prop, promoted from a hardcoded
 *    `<directionalLight intensity={1}>` literal (default `0.55`) — at
 *    intensity 1, `lightColor`'s vivid `#CD83FF` re-lit the whole beam
 *    surface as bright as the diffuse colour itself instead of reading as
 *    a rim highlight on the noise ridges.
 *  - `ambientIntensity` default lowered again, `0.35 → 0.22`.
 *  - `beamSpacing` default raised, `0.7 → 1.3`; `beamWidth` narrowed,
 *    `2 → 1.6`; `beamNumber` lowered, `10 → 8` (`BeamsRBBackground`'s
 *    `lite` tier follows, `6 → 4`) — more dark page background between
 *    columns, not just a hairline gap.
 *  - Camera pulled back again, `z=26 → 30` — at the new narrower/
 *    more-spaced geometry this keeps the whole beam block inside the
 *    frustum with real dark margin past the outermost beams on both
 *    edges, on every viewport re-tested (1440×900 down to 390×844),
 *    instead of the block running edge-to-edge as it did at `z=26`.
 */

function extendMaterial(
  BaseMaterial: new (params?: THREE.MeshStandardMaterialParameters) => THREE.MeshStandardMaterial,
  cfg: {
    header: string
    vertexHeader?: string
    fragmentHeader?: string
    vertex?: Record<string, string>
    fragment?: Record<string, string>
    material?: THREE.MeshStandardMaterialParameters & { fog?: boolean }
    uniforms?: Record<string, unknown>
  },
): THREE.ShaderMaterial {
  const physical = THREE.ShaderLib.physical
  const { vertexShader: baseVert, fragmentShader: baseFrag, uniforms: baseUniforms } = physical
  const baseDefines = (physical as unknown as { defines?: Record<string, unknown> }).defines ?? {}

  const uniforms = THREE.UniformsUtils.clone(baseUniforms)

  const defaults = new BaseMaterial(cfg.material || {})

  if (defaults.color) uniforms.diffuse.value = defaults.color
  if ('roughness' in defaults) uniforms.roughness.value = defaults.roughness
  if ('metalness' in defaults) uniforms.metalness.value = defaults.metalness
  if ('envMap' in defaults) uniforms.envMap.value = defaults.envMap
  if ('envMapIntensity' in defaults) uniforms.envMapIntensity.value = defaults.envMapIntensity

  Object.entries(cfg.uniforms ?? {}).forEach(([key, u]) => {
    uniforms[key] = u !== null && typeof u === 'object' && 'value' in u ? (u as { value: unknown }) : { value: u }
  })

  let vert = `${cfg.header}\n${cfg.vertexHeader ?? ''}\n${baseVert}`
  let frag = `${cfg.header}\n${cfg.fragmentHeader ?? ''}\n${baseFrag}`

  for (const [inc, code] of Object.entries(cfg.vertex ?? {})) {
    vert = vert.replace(inc, `${inc}\n${code}`)
  }
  for (const [inc, code] of Object.entries(cfg.fragment ?? {})) {
    frag = frag.replace(inc, `${inc}\n${code}`)
  }

  return new THREE.ShaderMaterial({
    defines: { ...baseDefines },
    uniforms,
    vertexShader: vert,
    fragmentShader: frag,
    lights: true,
    fog: !!cfg.material?.fog,
  })
}

const hexToNormalizedRGB = (hex: string): [number, number, number] => {
  const clean = hex.replace('#', '')
  const r = Number.parseInt(clean.substring(0, 2), 16)
  const g = Number.parseInt(clean.substring(2, 4), 16)
  const b = Number.parseInt(clean.substring(4, 6), 16)
  return [r / 255, g / 255, b / 255]
}

const noise = `
float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))*
        43758.5453123);
}
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) +
           (c - a)* u.y * (1.0 - u.x) +
           (d - b) * u.x * u.y;
}
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
vec3 fade(vec3 t) {return t*t*t*(t*(t*6.0-15.0)+10.0);}
float cnoise(vec3 P){
  vec3 Pi0 = floor(P);
  vec3 Pi1 = Pi0 + vec3(1.0);
  Pi0 = mod(Pi0, 289.0);
  Pi1 = mod(Pi1, 289.0);
  vec3 Pf0 = fract(P);
  vec3 Pf1 = Pf0 - vec3(1.0);
  vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
  vec4 iy = vec4(Pi0.yy, Pi1.yy);
  vec4 iz0 = Pi0.zzzz;
  vec4 iz1 = Pi1.zzzz;
  vec4 ixy = permute(permute(ix) + iy);
  vec4 ixy0 = permute(ixy + iz0);
  vec4 ixy1 = permute(ixy + iz1);
  vec4 gx0 = ixy0 / 7.0;
  vec4 gy0 = fract(floor(gx0) / 7.0) - 0.5;
  gx0 = fract(gx0);
  vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
  vec4 sz0 = step(gz0, vec4(0.0));
  gx0 -= sz0 * (step(0.0, gx0) - 0.5);
  gy0 -= sz0 * (step(0.0, gy0) - 0.5);
  vec4 gx1 = ixy1 / 7.0;
  vec4 gy1 = fract(floor(gx1) / 7.0) - 0.5;
  gx1 = fract(gx1);
  vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
  vec4 sz1 = step(gz1, vec4(0.0));
  gx1 -= sz1 * (step(0.0, gx1) - 0.5);
  gy1 -= sz1 * (step(0.0, gy1) - 0.5);
  vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);
  vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);
  vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);
  vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);
  vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);
  vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);
  vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);
  vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);
  vec4 norm0 = taylorInvSqrt(vec4(dot(g000,g000),dot(g010,g010),dot(g100,g100),dot(g110,g110)));
  g000 *= norm0.x; g010 *= norm0.y; g100 *= norm0.z; g110 *= norm0.w;
  vec4 norm1 = taylorInvSqrt(vec4(dot(g001,g001),dot(g011,g011),dot(g101,g101),dot(g111,g111)));
  g001 *= norm1.x; g011 *= norm1.y; g101 *= norm1.z; g111 *= norm1.w;
  float n000 = dot(g000, Pf0);
  float n100 = dot(g100, vec3(Pf1.x,Pf0.yz));
  float n010 = dot(g010, vec3(Pf0.x,Pf1.y,Pf0.z));
  float n110 = dot(g110, vec3(Pf1.xy,Pf0.z));
  float n001 = dot(g001, vec3(Pf0.xy,Pf1.z));
  float n101 = dot(g101, vec3(Pf1.x,Pf0.y,Pf1.z));
  float n011 = dot(g011, vec3(Pf0.x,Pf1.yz));
  float n111 = dot(g111, Pf1);
  vec3 fade_xyz = fade(Pf0);
  vec4 n_z = mix(vec4(n000,n100,n010,n110),vec4(n001,n101,n011,n111),fade_xyz.z);
  vec2 n_yz = mix(n_z.xy,n_z.zw,fade_xyz.y);
  float n_xyz = mix(n_yz.x,n_yz.y,fade_xyz.x);
  return 2.2 * n_xyz;
}
`

function createStackedPlanesBufferGeometry(
  n: number,
  width: number,
  height: number,
  spacing: number,
  heightSegments: number,
): THREE.BufferGeometry {
  const geometry = new THREE.BufferGeometry()
  const numVertices = n * (heightSegments + 1) * 2
  const numFaces = n * heightSegments * 2
  const positions = new Float32Array(numVertices * 3)
  const indices = new Uint32Array(numFaces * 3)
  const uvs = new Float32Array(numVertices * 2)

  let vertexOffset = 0
  let indexOffset = 0
  let uvOffset = 0
  const totalWidth = n * width + (n - 1) * spacing
  const xOffsetBase = -totalWidth / 2

  for (let i = 0; i < n; i++) {
    const xOffset = xOffsetBase + i * (width + spacing)
    const uvXOffset = Math.random() * 300
    const uvYOffset = Math.random() * 300

    for (let j = 0; j <= heightSegments; j++) {
      const y = height * (j / heightSegments - 0.5)
      const v0 = [xOffset, y, 0]
      const v1 = [xOffset + width, y, 0]
      positions.set([...v0, ...v1], vertexOffset * 3)

      const uvY = j / heightSegments
      uvs.set([uvXOffset, uvY + uvYOffset, uvXOffset + 1, uvY + uvYOffset], uvOffset)

      if (j < heightSegments) {
        const a = vertexOffset
        const b = vertexOffset + 1
        const c = vertexOffset + 2
        const d = vertexOffset + 3
        indices.set([a, b, c, c, b, d], indexOffset)
        indexOffset += 6
      }
      vertexOffset += 2
      uvOffset += 4
    }
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
  geometry.setIndex(new THREE.BufferAttribute(indices, 1))
  geometry.computeVertexNormals()
  return geometry
}

type MergedPlanesProps = {
  material: THREE.ShaderMaterial
  width: number
  count: number
  height: number
  spacing: number
}

const MergedPlanes = forwardRef<THREE.Mesh, MergedPlanesProps>(({ material, width, count, height, spacing }, ref) => {
  const mesh = useRef<THREE.Mesh>(null)
  useImperativeHandle(ref, () => mesh.current as THREE.Mesh)
  const geometry = useMemo(
    () => createStackedPlanesBufferGeometry(count, width, height, spacing, 100),
    [count, width, height, spacing],
  )
  useFrame((_, delta) => {
    ;(material.uniforms.time as { value: number }).value += 0.1 * delta
  })
  return <mesh ref={mesh} geometry={geometry} material={material} />
})
MergedPlanes.displayName = 'MergedPlanes'

const PlaneNoise = forwardRef<THREE.Mesh, MergedPlanesProps>((props, ref) => (
  <MergedPlanes
    ref={ref}
    material={props.material}
    width={props.width}
    count={props.count}
    height={props.height}
    spacing={props.spacing}
  />
))
PlaneNoise.displayName = 'PlaneNoise'

type DirLightProps = { position: [number, number, number]; color: string; intensity: number }

const DirLight = ({ position, color, intensity }: DirLightProps) => {
  const dir = useRef<THREE.DirectionalLight>(null)
  useEffect(() => {
    if (!dir.current) return
    const cam = dir.current.shadow.camera
    if (!cam) return
    cam.top = 24
    cam.bottom = -24
    cam.left = -24
    cam.right = 24
    cam.far = 64
    dir.current.shadow.bias = -0.004
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <directionalLight ref={dir} color={color} intensity={intensity} position={position} />
}

/** Legalia's palette — darkened base + dim highlight tuning (fix round,
 * see file header's "Balance fix" note): `LEGALIA_VIVID` used to be
 * `BeamsScene.tsx`'s own vivid `#591EF3`, which is the material's *base*
 * diffuse colour lit across the whole beam surface, not an occasional
 * highlight — at full vividness it read as a solid saturated-purple wall
 * rather than "dark base + glowing accents" like Emmi/Precedentia's own
 * scenes. Deepened to a near-black violet so the beams sit close to the
 * page background at rest; `LEGALIA_LIGHT` (the directional light's
 * colour) stays vivid but its *intensity* is turned down (see
 * `lightIntensity` below) so it paints rim highlights on the noise ridges
 * instead of flooding the whole surface. */
const LEGALIA_VIVID = '#1a0b3d'
const LEGALIA_LIGHT = '#CD83FF'
/** Matches every other scene's `FOG_COLOR`/page background. */
const LEGALIA_BG = '#04060d'

export interface BeamsRBCanvasProps {
  beamWidth?: number
  beamHeight?: number
  beamNumber?: number
  /** Promoted from a hardcoded `0` positional argument to
   * `createStackedPlanesBufferGeometry()` — see file header. Zero (the
   * stock component's own behaviour) packs every plane edge-to-edge into
   * one continuous ribbed surface; a real gap is what makes each column
   * read as its own beam instead of one solid wall. */
  beamSpacing?: number
  lightColor?: string
  /** Promoted from a hardcoded `<directionalLight intensity={1}>` literal —
   * fix round (see file header's "Balance fix" note). At the stock
   * intensity, `lightColor`'s vivid `#CD83FF` doesn't read as a highlight,
   * it re-lights the whole surface as bright as the diffuse colour itself
   * — turning the light down is what lets `beamColor`'s darker base show
   * through as the beam's resting tone. */
  lightIntensity?: number
  /** Promoted from a hardcoded literal — see file header. */
  beamColor?: string
  /** Promoted from a hardcoded literal — see file header. */
  background?: string
  /** Promoted from a hardcoded `<ambientLight intensity={1}>` literal — see
   * file header. Stock intensity flattens the noise-displaced ridges/valleys
   * into a uniformly-lit surface; a dimmer ambient term lets the single
   * `DirLight` do the contouring, so lit ridges and shadowed valleys read as
   * separate beams. */
  ambientIntensity?: number
  speed?: number
  noiseIntensity?: number
  scale?: number
  rotation?: number
  /** Forwarded to the `<Canvas>` this component mounts.
   * `BeamsRBBackground` sets this from `graphicsTier()`. */
  dpr?: CanvasProps['dpr']
  /** Maps to R3F's own `frameloop` — 'never' fully stops Canvas's internal
   * rAF loop while this is true. */
  paused?: boolean
}

/**
 * Renders its own `<Canvas>` — React Bits' `Beams` ships as a
 * self-contained mount point (`CanvasWrapper` in the original), not a scene
 * meant to live inside someone else's `<Canvas>` the way the old three.js
 * scenes did via `SceneCanvasInner`. `BeamsRBBackground` lazy-loads this
 * whole module and hands it `dpr`/`paused`.
 */
export function BeamsRBCanvas({
  beamWidth = 1.6,
  beamHeight = 16,
  beamNumber = 8,
  beamSpacing = 1.3,
  lightColor = LEGALIA_LIGHT,
  lightIntensity = 0.55,
  beamColor = LEGALIA_VIVID,
  background = LEGALIA_BG,
  ambientIntensity = 0.22,
  speed = 2,
  noiseIntensity = 1.75,
  scale = 0.2,
  rotation = 0,
  dpr,
  paused = false,
}: BeamsRBCanvasProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const beamMaterial = useMemo(
    () =>
      extendMaterial(THREE.MeshStandardMaterial, {
        header: `
  varying vec3 vEye;
  varying float vNoise;
  varying vec2 vUv;
  varying vec3 vPosition;
  uniform float time;
  uniform float uSpeed;
  uniform float uNoiseIntensity;
  uniform float uScale;
  ${noise}`,
        vertexHeader: `
  float getPos(vec3 pos) {
    vec3 noisePos =
      vec3(pos.x * 0., pos.y - uv.y, pos.z + time * uSpeed * 3.) * uScale;
    return cnoise(noisePos);
  }
  vec3 getCurrentPos(vec3 pos) {
    vec3 newpos = pos;
    newpos.z += getPos(pos);
    return newpos;
  }
  vec3 getNormal(vec3 pos) {
    vec3 curpos = getCurrentPos(pos);
    vec3 nextposX = getCurrentPos(pos + vec3(0.01, 0.0, 0.0));
    vec3 nextposZ = getCurrentPos(pos + vec3(0.0, -0.01, 0.0));
    vec3 tangentX = normalize(nextposX - curpos);
    vec3 tangentZ = normalize(nextposZ - curpos);
    return normalize(cross(tangentZ, tangentX));
  }`,
        fragmentHeader: '',
        vertex: {
          '#include <begin_vertex>': `transformed.z += getPos(transformed.xyz);`,
          '#include <beginnormal_vertex>': `objectNormal = getNormal(position.xyz);`,
        },
        fragment: {
          '#include <dithering_fragment>': `
    float randomNoise = noise(gl_FragCoord.xy);
    gl_FragColor.rgb -= randomNoise / 15. * uNoiseIntensity;`,
        },
        material: { fog: true },
        uniforms: {
          diffuse: new THREE.Color(...hexToNormalizedRGB(beamColor)),
          time: { shared: true, mixed: true, linked: true, value: 0 },
          roughness: 0.3,
          metalness: 0.3,
          uSpeed: { shared: true, mixed: true, linked: true, value: speed },
          envMapIntensity: 10,
          uNoiseIntensity: noiseIntensity,
          uScale: scale,
        },
      }),
    [speed, noiseIntensity, scale, beamColor],
  )

  return (
    <Canvas className="scene-canvas__layer" dpr={dpr ?? [1, 2]} frameloop={paused ? 'never' : 'always'}>
      <group rotation={[0, 0, degToRad(rotation)]}>
        <PlaneNoise
          ref={meshRef}
          material={beamMaterial}
          count={beamNumber}
          width={beamWidth}
          height={beamHeight}
          spacing={beamSpacing}
        />
        <DirLight color={lightColor} intensity={lightIntensity} position={[0, 3, 10]} />
      </group>
      <ambientLight intensity={ambientIntensity} />
      <color attach="background" args={[background]} />
      {/* Pulled back from the stock demo's z=20, and further again in the
          balance fix round: at beamNumber=8/width=1.6/spacing=1.3 the block
          is ~20.6 world units wide, and z=30 (up from the first pass's 26)
          keeps that narrower than the camera's own frustum on every tested
          viewport — wide enough that real dark page background shows past
          the outermost beams instead of the block running edge-to-edge
          (see file header — spacing/count/camera together are what turn the
          stock "solid ribbed wall" read into individual glowing columns
          with visible dark gaps on both sides, not just between them). */}
      <PerspectiveCamera makeDefault position={[0, 0, 30]} fov={30} />
    </Canvas>
  )
}
