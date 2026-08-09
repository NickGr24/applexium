/**
 * Camera the convergence scene is framed for, in its own module so a page
 * can pass it to `<SceneCanvas camera>` without statically importing
 * `ConvergenceScene` — importing the scene itself here would drag `three`,
 * the postprocessing stack, and this scene's own module into that page's
 * chunk and undo the point of lazily mounting the scene (see
 * `SceneCanvasInner`'s doc comment).
 *
 * The scene has no scroll dolly — it is entirely self-contained — so there
 * is only ever one position: dead-on, far enough back that the fan of
 * streams (they reach roughly ±3.5 world units from the core at their
 * widest) sits inside frame with a little breathing room. `CameraRig` in
 * `ConvergenceScene.tsx` nudges it with cursor parallax on top, but always
 * settles back here.
 */
export const CONVERGENCE_CAMERA = {
  fov: 44,
  near: 0.1,
  far: 40,
  position: [0, 0, 9] as [number, number, number],
}
