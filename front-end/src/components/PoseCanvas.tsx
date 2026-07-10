import { useEffect, useRef } from 'react'
import type { Landmark } from '../types'

const CONNECTIONS: [number, number][] = [
  // torso
  [11, 12], [11, 23], [12, 24], [23, 24],
  // left arm
  [11, 13], [13, 15],
  // right arm
  [12, 14], [14, 16],
  // left leg
  [23, 25], [25, 27],
  // right leg
  [24, 26], [26, 28],
]

const LEFT_SIDE  = new Set([11, 13, 15, 23, 25, 27])
const RIGHT_SIDE = new Set([12, 14, 16, 24, 26, 28])

interface Props {
  keypoints: Landmark[] | null
  width?: number
  height?: number
  className?: string
}

export function PoseCanvas({ keypoints, width = 480, height = 480, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, width, height)

    if (!keypoints || keypoints.length < 29) {
      // Draw placeholder skeleton silhouette
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(width / 2, height * 0.18, width * 0.06, 0, Math.PI * 2)
      ctx.stroke()
      return
    }

    const toX = (lm: Landmark) => lm.x * width
    const toY = (lm: Landmark) => lm.y * height

    // Draw connections
    for (const [a, b] of CONNECTIONS) {
      const la = keypoints[a]
      const lb = keypoints[b]
      if (!la || !lb) continue
      if (la.visibility < 0.3 || lb.visibility < 0.3) continue

      const isLeft  = LEFT_SIDE.has(a) && LEFT_SIDE.has(b)
      const isRight = RIGHT_SIDE.has(a) && RIGHT_SIDE.has(b)

      ctx.beginPath()
      ctx.moveTo(toX(la), toY(la))
      ctx.lineTo(toX(lb), toY(lb))
      ctx.strokeStyle = isLeft
        ? 'rgba(43, 184, 118, 0.85)'   // pitch green — left side
        : isRight
          ? 'rgba(249, 160, 32, 0.85)' // amber — right side
          : 'rgba(255, 255, 255, 0.6)' // white — torso
      ctx.lineWidth = 3
      ctx.lineCap = 'round'
      ctx.stroke()
    }

    // Draw keypoint dots
    for (let i = 0; i < keypoints.length; i++) {
      const lm = keypoints[i]
      if (!lm || lm.visibility < 0.3) continue

      const x = toX(lm)
      const y = toY(lm)
      const r = i === 0 ? 7 : 4 // bigger dot for nose (head)

      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fillStyle = LEFT_SIDE.has(i)
        ? '#2BB876'
        : RIGHT_SIDE.has(i)
          ? '#F9A020'
          : '#FFFFFF'
      ctx.fill()

      // Highlight ring on critical joints
      if ([11, 12, 13, 14, 15, 16, 23, 24, 25, 26].includes(i)) {
        ctx.beginPath()
        ctx.arc(x, y, r + 3, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255,255,255,0.25)'
        ctx.lineWidth = 1.5
        ctx.stroke()
      }
    }
  }, [keypoints, width, height])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={className}
      style={{ imageRendering: 'pixelated' }}
    />
  )
}
