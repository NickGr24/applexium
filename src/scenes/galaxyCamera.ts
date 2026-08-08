/**
 * Camera GalaxyScene is framed for, in its own module for the same reason as
 * `beamsCamera.ts` and `convergenceCamera.ts` — a page can hand this to
 * `<SceneCanvas camera>` without statically importing the scene itself.
 *
 * The particle field (`GalaxyScene.tsx`) spans roughly ±6.5 world units on
 * the x/z plane but is a thin disc (`DISC_THICKNESS = 0.9`) — a shallow,
 * near-level camera forced it into a foreshortened dome rather than a
 * legible spiral, so this sits high and looks steeply down instead, which
 * is what actually reads the arms as arms rather than a formless glow.
 */
export const GALAXY_CAMERA = {
  fov: 50,
  near: 0.1,
  far: 60,
  position: [0, 6.5, 6] as [number, number, number],
}
