'use client'

import { useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { BeamConfiguration, Load } from '@/lib/types'

interface BeamCanvasProps {
  configuration: BeamConfiguration
}

export function BeamCanvas({ configuration }: BeamCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Drawing settings
    const padding = { left: 60, right: 60, top: 80, bottom: 80 }
    const beamStartX = padding.left
    const beamEndX = rect.width - padding.right
    const beamY = rect.height / 2
    const beamWidth = beamEndX - beamStartX
    const beamHeight = 14

    // Colors (from CSS variables - using hardcoded values for canvas)
    const colors = {
      beam: '#1e40af', // primary blue
      support: '#64748b', // slate
      load: '#059669', // accent green
      text: '#334155',
      grid: '#e2e8f0',
    }

    // Draw grid
    ctx.strokeStyle = colors.grid
    ctx.lineWidth = 1
    for (let x = beamStartX; x <= beamEndX; x += beamWidth / 10) {
      ctx.beginPath()
      ctx.moveTo(x, padding.top)
      ctx.lineTo(x, rect.height - padding.bottom + 30)
      ctx.stroke()
    }

    // Draw beam
    ctx.fillStyle = colors.beam
    ctx.beginPath()
    ctx.roundRect(beamStartX, beamY - beamHeight / 2, beamWidth, beamHeight, 4)
    ctx.fill()

    // Draw dimension line
    ctx.strokeStyle = colors.text
    ctx.lineWidth = 1
    ctx.setLineDash([4, 4])
    ctx.beginPath()
    ctx.moveTo(beamStartX, rect.height - 30)
    ctx.lineTo(beamEndX, rect.height - 30)
    ctx.stroke()
    ctx.setLineDash([])

    // Dimension arrows
    ctx.beginPath()
    ctx.moveTo(beamStartX, rect.height - 30)
    ctx.lineTo(beamStartX + 8, rect.height - 26)
    ctx.lineTo(beamStartX + 8, rect.height - 34)
    ctx.closePath()
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(beamEndX, rect.height - 30)
    ctx.lineTo(beamEndX - 8, rect.height - 26)
    ctx.lineTo(beamEndX - 8, rect.height - 34)
    ctx.closePath()
    ctx.fill()

    // Dimension text
    ctx.fillStyle = colors.text
    ctx.font = '12px system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`L = ${configuration.totalLength.toFixed(1)} m`, (beamStartX + beamEndX) / 2, rect.height - 12)

    // Draw supports
    configuration.supports.forEach((support) => {
      const x = beamStartX + (support.position / configuration.totalLength) * beamWidth
      drawSupport(ctx, x, beamY + beamHeight / 2, support.type, colors.support)
    })

    // Draw loads
    configuration.loads.forEach((load) => {
      const x = beamStartX + (load.position / configuration.totalLength) * beamWidth
      drawLoad(
        ctx,
        x,
        beamY - beamHeight / 2,
        load,
        beamWidth,
        beamStartX,
        configuration.totalLength,
        colors.load
      )
    })

    // Draw title
    ctx.fillStyle = colors.text
    ctx.font = 'bold 14px system-ui, sans-serif'
    ctx.textAlign = 'left'
    ctx.fillText(
      `${configuration.type.replace('-', ' ').replace(/\b\w/g, (c) => c.toUpperCase())} Beam`,
      padding.left,
      30
    )

  }, [configuration])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Beam Diagram</CardTitle>
      </CardHeader>
      <CardContent>
        <canvas
          ref={canvasRef}
          className="h-64 w-full rounded-md border border-border bg-card"
          style={{ imageRendering: 'crisp-edges' }}
        />
        <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-3 w-6 rounded bg-primary" />
            <span>Beam</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-muted-foreground" />
            <span>Support</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-accent" />
            <span>Load</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function drawSupport(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  type: string,
  color: string
) {
  ctx.fillStyle = color
  ctx.strokeStyle = color
  ctx.lineWidth = 2

  switch (type) {
    case 'pinned':
      // Triangle
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x - 18, y + 28)
      ctx.lineTo(x + 18, y + 28)
      ctx.closePath()
      ctx.fill()
      // Ground line
      ctx.beginPath()
      ctx.moveTo(x - 25, y + 28)
      ctx.lineTo(x + 25, y + 28)
      ctx.stroke()
      // Hatch marks
      for (let i = -20; i <= 20; i += 8) {
        ctx.beginPath()
        ctx.moveTo(x + i, y + 28)
        ctx.lineTo(x + i - 6, y + 36)
        ctx.stroke()
      }
      break

    case 'roller':
      // Circle
      ctx.beginPath()
      ctx.arc(x, y + 15, 12, 0, Math.PI * 2)
      ctx.fill()
      // Ground line
      ctx.beginPath()
      ctx.moveTo(x - 25, y + 27)
      ctx.lineTo(x + 25, y + 27)
      ctx.stroke()
      break

    case 'fixed':
      // Filled rectangle
      ctx.fillRect(x - 12, y - 30, 12, 60)
      // Hatch pattern
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 1.5
      for (let i = -25; i <= 25; i += 8) {
        ctx.beginPath()
        ctx.moveTo(x - 12, y + i)
        ctx.lineTo(x, y + i + 8)
        ctx.stroke()
      }
      ctx.strokeStyle = color
      break
  }
}

function drawLoad(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  load: Load,
  beamWidth: number,
  beamStartX: number,
  beamTotalLength: number,
  color: string
) {
  ctx.fillStyle = color
  ctx.strokeStyle = color
  ctx.lineWidth = 2

  const arrowLength = 40
  const direction = load.direction === 'down' ? 1 : -1

  switch (load.type) {
    case 'point':
      // Arrow line
      ctx.beginPath()
      ctx.moveTo(x, y - arrowLength * direction)
      ctx.lineTo(x, y)
      ctx.stroke()
      // Arrow head
      ctx.beginPath()
      if (direction === 1) {
        ctx.moveTo(x, y)
        ctx.lineTo(x - 8, y - 12)
        ctx.lineTo(x + 8, y - 12)
      } else {
        ctx.moveTo(x, y - arrowLength)
        ctx.lineTo(x - 8, y - arrowLength + 12)
        ctx.lineTo(x + 8, y - arrowLength + 12)
      }
      ctx.closePath()
      ctx.fill()
      // Label
      ctx.font = '11px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`${load.magnitude} kN`, x, y - arrowLength * direction - 8 * direction)
      break

    case 'distributed':
      const endX = beamStartX + ((load.endPosition ?? load.position + 20) / beamTotalLength) * beamWidth
      const startX = x
      const numArrows = Math.max(3, Math.floor((endX - startX) / 25))
      const spacing = (endX - startX) / (numArrows - 1)

      // Draw multiple arrows
      for (let i = 0; i < numArrows; i++) {
        const arrowX = startX + i * spacing
        ctx.beginPath()
        ctx.moveTo(arrowX, y - 30 * direction)
        ctx.lineTo(arrowX, y)
        ctx.stroke()

        ctx.beginPath()
        if (direction === 1) {
          ctx.moveTo(arrowX, y)
          ctx.lineTo(arrowX - 5, y - 8)
          ctx.lineTo(arrowX + 5, y - 8)
        } else {
          ctx.moveTo(arrowX, y - 30)
          ctx.lineTo(arrowX - 5, y - 22)
          ctx.lineTo(arrowX + 5, y - 22)
        }
        ctx.closePath()
        ctx.fill()
      }

      // Top connecting line
      ctx.beginPath()
      ctx.moveTo(startX, y - 30 * direction)
      ctx.lineTo(endX, y - 30 * direction)
      ctx.stroke()

      // Label
      ctx.font = '11px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`${load.magnitude} kN/m`, (startX + endX) / 2, y - 38 * direction - 8 * direction)
      break

    case 'moment':
      // Curved arrow for moment
      ctx.beginPath()
      ctx.arc(x, y - 20, 16, 0.5, Math.PI * 1.5)
      ctx.stroke()
      // Arrow head
      ctx.beginPath()
      ctx.moveTo(x - 16, y - 20)
      ctx.lineTo(x - 10, y - 28)
      ctx.lineTo(x - 8, y - 16)
      ctx.closePath()
      ctx.fill()
      // Label
      ctx.font = '11px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(`${load.magnitude} kNm`, x, y - 50)
      break
  }
}
