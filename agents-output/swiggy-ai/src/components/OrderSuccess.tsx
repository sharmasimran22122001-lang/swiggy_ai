'use client'
import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'

interface Props {
  restaurantName: string
  onBackToHome: () => void
}

const STEPS = ['Confirmed', 'Being prepared', 'On the way'] as const

function fireConfetti(canvas: HTMLCanvasElement) {
  const rawCtx = canvas.getContext('2d')
  if (!rawCtx) return
  const ctx = rawCtx
  canvas.width = canvas.offsetWidth
  canvas.height = canvas.offsetHeight

  const COLORS = ['#FC8019', '#ff3a6e', '#28c99a', '#8b7fff', '#ffd700', '#ffffff']
  const cx = canvas.width / 2
  const cy = canvas.height * 0.35

  const particles = Array.from({ length: 110 }, () => ({
    x: cx, y: cy,
    vx: (Math.random() - 0.5) * 12,
    vy: Math.random() * -11 - 4,
    r: Math.random() * 5 + 3,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    rot: Math.random() * 360,
    rotV: (Math.random() - 0.5) * 9,
    rect: Math.random() > 0.45,
    alpha: 1,
  }))

  let frame = 0
  const MAX = 95
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (const p of particles) {
      p.vy += 0.3
      p.x  += p.vx
      p.y  += p.vy
      p.rot += p.rotV
      p.alpha = Math.max(0, 1 - frame / MAX)
      ctx.globalAlpha = p.alpha
      ctx.fillStyle = p.color
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate((p.rot * Math.PI) / 180)
      if (p.rect) { ctx.fillRect(-p.r, -p.r * 0.45, p.r * 2, p.r * 0.9) }
      else { ctx.beginPath(); ctx.arc(0, 0, p.r * 0.7, 0, Math.PI * 2); ctx.fill() }
      ctx.restore()
    }
    ctx.globalAlpha = 1
    frame++
    if (frame < MAX) requestAnimationFrame(draw)
    else ctx.clearRect(0, 0, canvas.width, canvas.height)
  }
  draw()
}

export default function OrderSuccess({ restaurantName, onBackToHome }: Props) {
  const [activeStep, setActiveStep] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const t1 = setTimeout(() => setActiveStep(1), 2000)
    const t2 = setTimeout(() => setActiveStep(2), 4000)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  useEffect(() => {
    const t = setTimeout(() => {
      if (canvasRef.current) fireConfetti(canvasRef.current)
    }, 550)
    return () => clearTimeout(t)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col items-center justify-between px-6 py-12"
      style={{ background: '#fff', position: 'relative', overflow: 'hidden' }}
    >
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 20 }}
      />
      <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full">
        {/* Animated green checkmark */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
          className="flex items-center justify-center rounded-full"
          style={{ width: 96, height: 96, background: '#3d9b6e' }}
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            style={{ fontSize: 44, color: '#fff', lineHeight: 1 }}
          >
            ✓
          </motion.span>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.35 }}
          className="flex flex-col items-center gap-1 text-center"
        >
          <p className="font-bold" style={{ fontSize: 20, color: '#3d4152' }}>
            Order Placed! 🎉
          </p>
          <p style={{ fontSize: 14, color: '#686b78' }}>
            Your order from {restaurantName} is confirmed
          </p>
        </motion.div>

        {/* ETA chip */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.3 }}
          className="flex items-center gap-2 px-4 py-2 rounded-full"
          style={{ background: '#f4f4f4' }}
        >
          <span style={{ fontSize: 18 }}>🛵</span>
          <span className="text-sm font-medium" style={{ color: '#3d4152' }}>
            Arriving in 30–35 min
          </span>
        </motion.div>

        {/* Tracking bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.3 }}
          className="w-full max-w-xs"
        >
          <div className="flex items-center justify-between relative">
            {/* Connector lines */}
            <div
              className="absolute top-3 left-[16.67%] right-[16.67%] h-[2px]"
              style={{ background: '#e0e0e0', zIndex: 0 }}
            />
            <motion.div
              className="absolute top-3 left-[16.67%] h-[2px]"
              style={{ background: '#FC8019', zIndex: 1, width: activeStep >= 1 ? '33.33%' : '0%' }}
              animate={{ width: activeStep >= 1 ? '33.33%' : '0%' }}
              transition={{ duration: 0.5 }}
            />
            <motion.div
              className="absolute top-3 h-[2px]"
              style={{ background: '#FC8019', zIndex: 1, left: '50%', width: activeStep >= 2 ? '33.33%' : '0%' }}
              animate={{ width: activeStep >= 2 ? '33.33%' : '0%' }}
              transition={{ duration: 0.5 }}
            />

            {STEPS.map((step, idx) => (
              <div key={step} className="flex flex-col items-center gap-2 relative z-10">
                <motion.div
                  className="rounded-full flex items-center justify-center"
                  style={{
                    width: 24,
                    height: 24,
                    background: activeStep >= idx ? '#FC8019' : '#e0e0e0',
                    transition: 'background 0.4s',
                  }}
                  animate={{ background: activeStep >= idx ? '#FC8019' : '#e0e0e0' }}
                >
                  {activeStep >= idx && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}
                    >
                      ✓
                    </motion.span>
                  )}
                </motion.div>
                <span
                  className="text-center"
                  style={{
                    fontSize: 10,
                    color: activeStep >= idx ? '#FC8019' : '#93959f',
                    fontWeight: activeStep >= idx ? 600 : 400,
                    maxWidth: 64,
                    lineHeight: 1.3,
                  }}
                >
                  {step}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Track order link */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.3 }}
          className="text-sm font-semibold"
          style={{ color: '#FC8019' }}
        >
          Track your order →
        </motion.button>
      </div>

      {/* Back to Home button */}
      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.35 }}
        onClick={onBackToHome}
        className="w-full rounded-[12px] py-4 font-bold text-sm"
        style={{
          border: '1.5px solid #FC8019',
          color: '#FC8019',
          background: '#fff',
        }}
      >
        Back to Home
      </motion.button>
    </motion.div>
  )
}
