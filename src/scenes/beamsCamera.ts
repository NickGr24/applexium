/**
 * Camera BeamsScene is framed for, in its own module so a page can pass it
 * to `<SceneCanvas camera>` without statically importing `BeamsScene` — see
 * `heroCamera.ts` for the reasoning (it would drag `three`, the
 * postprocessing stack and this scene's own module into that page's chunk).
 *
 * The columns sit on a baseline well below the lens (`BASELINE_Y` in
 * `BeamsScene.tsx`) and tower upward past the top of frame, so the camera
 * looks slightly down rather than dead level — the same "standing in front
 * of something taller than you" framing `HeroWorld` uses for its arcade.
 */
export const BEAMS_CAMERA = {
  fov: 42,
  near: 0.1,
  far: 40,
  position: [0, 1.2, 11] as [number, number, number],
}
