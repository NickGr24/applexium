// A cubic-bezier easing function matching --ease-out in tokens.css
// (cubic-bezier(0.22, 1, 0.36, 1)), expressed as a GSAP-compatible
// `(progress: number) => number` ease so every GSAP tween in this app moves
// on the same curve as CSS transitions do. Pure math, no DOM access — safe
// to import from server-rendered modules.
function cubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1
  const bx = 3 * (x2 - x1) - cx
  const ax = 1 - cx - bx
  const cy = 3 * y1
  const by = 3 * (y2 - y1) - cy
  const ay = 1 - cy - by

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t
  const sampleDerivX = (t: number) => (3 * ax * t + 2 * bx) * t + cx

  return (x: number): number => {
    if (x <= 0) return 0
    if (x >= 1) return 1
    let t = x
    for (let i = 0; i < 8; i++) {
      const dx = sampleX(t) - x
      const derivative = sampleDerivX(t)
      if (Math.abs(dx) < 1e-6 || derivative === 0) break
      t -= dx / derivative
    }
    return sampleY(t)
  }
}

export const easeOut = cubicBezier(0.22, 1, 0.36, 1)
