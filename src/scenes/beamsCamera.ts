/**
 * Camera BeamsScene is framed for, in its own module so a page can pass it
 * to `<SceneCanvas camera>` without statically importing `BeamsScene` —
 * importing the scene itself here would drag `three`, the postprocessing
 * stack, and this scene's own module into that page's chunk, defeating the
 * point of lazily mounting the scene at all (see `SceneCanvasInner`'s doc
 * comment).
 *
 * The columns sit on a baseline well below the lens (`BASELINE_Y` in
 * `BeamsScene.tsx`) and tower upward past the top of frame, so the camera
 * looks slightly down rather than dead level — "standing in front of
 * something taller than you".
 */
export const BEAMS_CAMERA = {
  fov: 42,
  near: 0.1,
  far: 40,
  position: [0, 1.2, 11] as [number, number, number],
}
