/**
 * Delta-scaled equivalent of `current += (target - current) * k` for a
 * per-frame lerp originally tuned assuming a steady 60fps `useFrame` tick.
 * Every `CameraRig` in this directory (BeamsScene, ConvergenceScene,
 * GalaxyScene) used a bare `k = 0.05` applied once per callback regardless
 * of how long that frame actually took — on a slower device (30fps, or a
 * frame that took 40ms because the main thread was busy) the camera visibly
 * chases the pointer slower than on a fast one, since the same fractional
 * step now covers twice the elapsed time. Folding `delta` in via
 * `1 - (1 - k) ** (delta * 60)` keeps the SAME settling behaviour at 60fps
 * (`frameLerp(k, 1/60) === k`) while converging at the same real-world speed
 * regardless of frame rate.
 */
export function frameLerp(k: number, delta: number): number {
  return 1 - (1 - k) ** (delta * 60)
}
