import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import './CRTEffect.css'

function GrainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const pixelSize = 2
    const fps = 40
    const interval = 1000 / fps
    let animationId: number
    let lastTime = 0

    const resize = () => {
      canvas.width = Math.ceil(window.innerWidth / pixelSize)
      canvas.height = Math.ceil(window.innerHeight / pixelSize)
    }

    const drawGrain = (now: number) => {
      animationId = requestAnimationFrame(drawGrain)
      if (now - lastTime < interval) return
      lastTime = now

      const { width, height } = canvas
      const imageData = ctx.createImageData(width, height)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() * 255
        data[i] = v
        data[i + 1] = v
        data[i + 2] = v
        data[i + 3] = 25
      }

      ctx.putImageData(imageData, 0, 0)
    }

    resize()
    animationId = requestAnimationFrame(drawGrain)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="crt-grain"
      style={{ imageRendering: 'pixelated' }}
    />
  )
}

export default function CRTEffect() {
  return (
    <>
      {/* Grain, scanlines, vignette render outside #root via portal — behind content */}
      {createPortal(
        <>
          <GrainCanvas />
          <div className="crt-scanlines" />
          <div className="crt-vignette" />
        </>,
        document.body
      )}
    </>
  )
}
