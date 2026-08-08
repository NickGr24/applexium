/**
 * Camera the hero world is framed for, in its own module so a page can pass
 * it to `<SceneCanvas camera>` without statically importing `HeroWorld` —
 * which would drag `three`, drei and the postprocessing stack into that
 * page's chunk and undo the whole point of lazily mounting the scene.
 */
export const HERO_CAMERA = {
  fov: 46,
  near: 0.1,
  far: 140,
  /** Water sits at y = -2.6, so this is eye height 1.2 above the surface. */
  position: [0, -1.4, 14] as [number, number, number],
}
