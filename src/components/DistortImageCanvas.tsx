import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Mesh, PlaneGeometry, ShaderMaterial, SRGBColorSpace, TextureLoader, Vector2, type Texture } from 'three'

type DistortImageCanvasProps = {
  src: string
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
 */
function DistortPlane({ src }: { src: string }) {
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
  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh || size.height === 0) return
    const containerAspect = size.width / size.height
    const coverScale = Math.max(containerAspect / imageAspect, 1)
    const planeHeight = size.height * coverScale
    const planeWidth = planeHeight * imageAspect
    mesh.scale.set(planeWidth, planeHeight, 1)
  }, [size, imageAspect])

  const mouseTarget = useRef(new Vector2(0.5, 0.5))
  const strengthTarget = useRef(0)

  useFrame(() => {
    const uMouse = material.uniforms.uMouse.value as Vector2
    uMouse.lerp(mouseTarget.current, LERP_FACTOR)
    material.uniforms.uStrength.value +=
      (strengthTarget.current - material.uniforms.uStrength.value) * LERP_FACTOR
  })

  const onPointerMove = (event: ThreeEvent<PointerEvent>) => {
    if (event.uv) mouseTarget.current.copy(event.uv)
    strengthTarget.current = STRENGTH_ON_HOVER
  }
  const onPointerOut = () => {
    strengthTarget.current = 0
  }

  if (!texture) return null

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      onPointerMove={onPointerMove}
      onPointerOut={onPointerOut}
    />
  )
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
export function DistortImageCanvas({ src }: DistortImageCanvasProps) {
  return (
    <Canvas orthographic gl={{ alpha: true, antialias: true }} dpr={[1, 1.75]}>
      <DistortPlane src={src} />
    </Canvas>
  )
}
