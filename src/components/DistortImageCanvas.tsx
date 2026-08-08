import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import { Mesh, PlaneGeometry, ShaderMaterial, SRGBColorSpace, TextureLoader, Vector2, type Texture } from 'three'

/** Raw pointer state, owned and mutated by `DistortImage`'s own DOM
 * listeners on the *container* — never read via R3F raycasting. `u`/`v`
 * are plain container-relative fractions (0..1 across the container's own
 * box, y-up), not yet aware of any cover-crop; `DistortPlane` below is
 * where that gets reconciled against the plane's own (possibly larger,
 * cropped) UV space. */
type PointerState = { u: number; v: number; active: boolean }

type DistortImageCanvasProps = {
  src: string
  pointer: MutableRefObject<PointerState>
}

const VERTEX_SHADER = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// Plan-B shader from the task brief: pull the sampled UV by `dir` itself
// (not a normalized direction — its own length already carries the
// distance falloff) scaled by the pointer-ramped strength and a smoothstep
// that's 1 right at the pointer and 0 past 0.35 UV units away. Because
// `dir` is zero exactly at the pointer too, the visible displacement is a
// ring that grows out from the cursor and fades at its rim, not a single
// point poking out of the image.
const FRAGMENT_SHADER = `
  uniform sampler2D uTexture;
  uniform vec2 uMouse;
  uniform float uStrength;
  varying vec2 vUv;

  void main() {
    vec2 dir = vUv - uMouse;
    float falloff = smoothstep(0.35, 0.0, length(dir));
    vec2 uv = vUv + dir * uStrength * falloff;
    gl_FragColor = texture2D(uTexture, uv);
  }
`

// How far the ramped intensity and the pointer position move toward their
// targets each frame — matches the brief's "lerp 0.08" spec for both.
const LERP_FACTOR = 0.08
// Target uStrength while the pointer is over the plane. Small — this is a
// hover ripple, not a page-breaking warp.
const STRENGTH_ON_HOVER = 0.22

/**
 * The shader plane itself. Sized every time the canvas resizes or the
 * image's own aspect ratio becomes known, so it always covers the full
 * frustum without stretching — see the resize effect below for the cover
 * math. Renders nothing until its texture has loaded, so there's a brief
 * gap (SceneCanvas calls this the "poster gap") where the plain `<img>`
 * DistortImage renders underneath shows through the transparent canvas.
 *
 * Deliberately has no `onPointerMove`/raycasting of its own — the canvas
 * this mounts inside is `pointer-events: none` (see the `.distort-image__
 * canvas` rule in components.css), so it can never receive one anyway.
 * `DistortImage` tracks the mouse itself, over the *container* div, with a
 * plain DOM listener, and hands the raw container-relative fraction down
 * via `pointer` (a ref, so a mousemove never triggers a React re-render).
 * That choice isn't just style: Task 17/18 wrap `DistortImage` in an `<a>`
 * for the team/portfolio cards, and a canvas that intercepts pointer
 * events would swallow that link's hover/click/focus. `pointer-events:
 * none` makes the canvas permanently transparent to the browser's own
 * event routing, so whatever wraps `DistortImage` — a link or nothing at
 * all — behaves exactly as if the canvas weren't there.
 */
function DistortPlane({ src, pointer }: { src: string; pointer: MutableRefObject<PointerState> }) {
  const { size } = useThree()
  const meshRef = useRef<Mesh>(null)
  const [texture, setTexture] = useState<Texture | null>(null)
  const [imageAspect, setImageAspect] = useState(1)

  useEffect(() => {
    const loader = new TextureLoader()
    let cancelled = false
    let loaded: Texture | null = null
    loader.load(src, (tex) => {
      if (cancelled) {
        tex.dispose()
        return
      }
      tex.colorSpace = SRGBColorSpace
      loaded = tex
      setImageAspect(tex.image.width / tex.image.height)
      setTexture(tex)
    })
    return () => {
      cancelled = true
      loaded?.dispose()
    }
  }, [src])

  const geometry = useMemo(() => new PlaneGeometry(1, 1), [])
  useEffect(() => () => geometry.dispose(), [geometry])

  const material = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uTexture: { value: null as Texture | null },
          uMouse: { value: new Vector2(0.5, 0.5) },
          uStrength: { value: 0 },
        },
        vertexShader: VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        transparent: true,
      }),
    [],
  )
  useEffect(() => () => material.dispose(), [material])
  useEffect(() => {
    material.uniforms.uTexture.value = texture
  }, [material, texture])

  // object-fit: cover — R3F's default orthographic camera frustum equals
  // `size.width` x `size.height` in world units (its own resize handler
  // keeps left/right/top/bottom pinned to the canvas's pixel size), so
  // those doubles as the plane's cover-fit target. Scaling the plane past
  // the frustum on whichever axis the image is proportionally narrower
  // than the container crops that axis instead of stretching either one —
  // same idea as CSS `object-fit: cover`, done via geometry scale instead
  // of a UV remap.
  //
  // `coverRatio` (plane size / frustum size, per axis) is the same cover
  // transform expressed as a ratio instead of world units — kept around so
  // `useFrame` below can convert the container-relative pointer fraction
  // into the plane's own (possibly larger, cropped) UV space. Exactly one
  // axis is always 1 (the axis the cover-fit didn't need to crop); the
  // other is >=1.
  const coverRatio = useRef(new Vector2(1, 1))

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh || size.height === 0) return
    const containerAspect = size.width / size.height
    const coverScale = Math.max(containerAspect / imageAspect, 1)
    const planeHeight = size.height * coverScale
    const planeWidth = planeHeight * imageAspect
    mesh.scale.set(planeWidth, planeHeight, 1)
    coverRatio.current.set(planeWidth / size.width, planeHeight / size.height)
  }, [size, imageAspect])

  const targetUv = useRef(new Vector2(0.5, 0.5))

  useFrame(() => {
    // Container fraction -> plane-local UV: `vUv` in the fragment shader
    // spans the *whole* plane, which on the cropped axis is wider than the
    // visible container (see coverRatio above), so a raw container
    // fraction has to be re-centred by that same ratio before it lines up
    // with what the shader compares it against.
    targetUv.current.set(
      (pointer.current.u - 0.5) * coverRatio.current.x + 0.5,
      (pointer.current.v - 0.5) * coverRatio.current.y + 0.5,
    )
    const uMouse = material.uniforms.uMouse.value as Vector2
    uMouse.lerp(targetUv.current, LERP_FACTOR)

    const targetStrength = pointer.current.active ? STRENGTH_ON_HOVER : 0
    material.uniforms.uStrength.value += (targetStrength - material.uniforms.uStrength.value) * LERP_FACTOR
  })

  if (!texture) return null

  // `raycast={() => null}` makes the no-op explicit: this mesh never
  // participates in R3F's pointer/raycasting system, by design — see the
  // component doc comment above.
  return <mesh ref={meshRef} geometry={geometry} material={material} raycast={() => null} />
}

/**
 * Mounted by `DistortImage` once tier + pointer + intersection all pass —
 * split into its own module (and therefore its own build chunk), the same
 * reason `SceneCanvasInner` is: `DistortImage` only ever reaches this file
 * through `React.lazy`, never a static import, so `three`/`@react-three/
 * fiber` are downloaded on demand and never land in a page's own chunk.
 *
 * `alpha: true` and no background colour is set, so the canvas clears to
 * transparent — the `<img>` DistortImage renders underneath shows through
 * for as long as the plane above has no texture yet.
 */
export function DistortImageCanvas({ src, pointer }: DistortImageCanvasProps) {
  return (
    <Canvas
      orthographic
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 1.75]}
      // R3F's own root wrapper div defaults to an *inline* `pointer-events:
      // auto` — inline, so the `pointer-events: none` on this component's
      // `.distort-image__canvas` ancestor (an inherited CSS property) can't
      // override it; inline always wins over an inherited value. This
      // `style` prop is how R3F lets a consumer override that default, and
      // it's the one that actually matters: without it, `elementFromPoint`
      // at the canvas's own coordinates resolves to the `<canvas>` itself,
      // not whatever DistortImage is wrapped in.
      style={{ pointerEvents: 'none' }}
    >
      <DistortPlane src={src} pointer={pointer} />
    </Canvas>
  )
}
