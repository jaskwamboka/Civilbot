'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { analyzeBeam, formatReaction, formatMoment } from '@/lib/beam-analysis-old'
import type { BeamConfiguration } from '@/lib/types'

interface ResultsPanelProps {
  configuration: BeamConfiguration
}

export function ResultsPanel({ configuration }: ResultsPanelProps) {
  const results = useMemo(() => {
    if (configuration.loads.length === 0) return null
    return analyzeBeam(configuration)
  }, [configuration])

  if (!results) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Analysis Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="py-8 text-center text-sm text-muted-foreground">
            Add loads to your beam to see analysis results.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Analysis Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Reactions */}
        <div>
          <h4 className="mb-3 text-sm font-medium text-foreground">Support Reactions</h4>
          <div className="space-y-2">
            {results.reactions.map((reaction, index) => (
              <div
                key={reaction.supportId}
                className="flex items-center justify-between rounded-md bg-muted px-3 py-2"
              >
                <span className="text-sm text-muted-foreground">R{index + 1}</span>
                <span className="font-mono text-sm font-medium">
                  {formatReaction(reaction.verticalReaction)}
                </span>
              </div>
            ))}
            {results.reactions.some((r) => r.moment !== undefined) && (
              <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2">
                <span className="text-sm text-muted-foreground">M (fixed)</span>
                <span className="font-mono text-sm font-medium">
                  {formatMoment(results.reactions.find((r) => r.moment)?.moment || 0)}
                </span>
              </div>
            )}
          </div>
        </div>

  {/* Critical Points */}
<div>
  <h4 className="mb-3 text-sm font-medium">
    Critical Points
  </h4>

  <div className="overflow-x-auto rounded-md border">
    <table className="w-full text-sm">
      <thead className="bg-muted">
        <tr>
          <th className="px-3 py-2 text-left">Position (m)</th>
          <th className="px-3 py-2 text-right">Shear (kN)</th>
          <th className="px-3 py-2 text-right">Moment (kNm)</th>
        </tr>
      </thead>

      <tbody>
        {results.resultStations.map((station) => (
          <tr
            key={station.x}
            className="border-t"
          >
            <td className="px-3 py-2">
              {station.x.toFixed(2)}
            </td>

            <td className="px-3 py-2 text-right font-mono">
              {station.shear.toFixed(2)}
            </td>

            <td className="px-3 py-2 text-right font-mono">
              {station.moment.toFixed(2)}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

        {/* SFD Diagram */}
        <div>
          <h4 className="mb-3 text-sm font-medium text-foreground">Shear Force Diagram</h4>
          <DiagramCanvas
            data={results.shearForce}
            color="hsl(var(--primary))"
            label="V (kN)"
            totalLength={configuration.totalLength}
          />
        </div>

        {/* BMD Diagram */}
        <div>
          <h4 className="mb-3 text-sm font-medium text-foreground">Bending Moment Diagram</h4>
          <DiagramCanvas
            data={results.bendingMoment}
            color="hsl(var(--accent))"
            label="M (kNm)"
            totalLength={configuration.totalLength}
            invert
          />
        </div>
      </CardContent>
    </Card>
  )
}

interface DiagramCanvasProps {
  data: { x: number; value: number }[]
  color: string
  label: string
  totalLength: number
  invert?: boolean
}

function DiagramCanvas({ data, color, label, totalLength, invert }: DiagramCanvasProps) {
  const canvasId = useMemo(() => `diagram-${Math.random().toString(36).substr(2, 9)}`, [])

  const maxValue = Math.max(...data.map((p) => Math.abs(p.value)), 0.1)
  const padding = { left: 40, right: 20, top: 20, bottom: 30 }
  const width = 400
  const height = 150
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  const pathD = useMemo(() => {
    if (data.length === 0) return ''

    const points = data.map((point) => {
      const x = padding.left + (point.x / totalLength) * chartWidth
      const normalizedValue = point.value / maxValue
      const y = padding.top + chartHeight / 2 - (normalizedValue * chartHeight) / 2 * (invert ? -1 : 1)
      return `${x},${y}`
    })

    return `M ${points.join(' L ')}`
  }, [data, totalLength, maxValue, chartWidth, chartHeight, invert])

  const fillPathD = useMemo(() => {
    if (data.length === 0) return ''

    const baseline = padding.top + chartHeight / 2
    const startX = padding.left
    const endX = padding.left + chartWidth

    const points = data.map((point) => {
      const x = padding.left + (point.x / totalLength) * chartWidth
      const normalizedValue = point.value / maxValue
      const y = padding.top + chartHeight / 2 - (normalizedValue * chartHeight) / 2 * (invert ? -1 : 1)
      return `${x},${y}`
    })

    return `M ${startX},${baseline} L ${points.join(' L ')} L ${endX},${baseline} Z`
  }, [data, totalLength, maxValue, chartWidth, chartHeight, invert])

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full rounded-md border border-border bg-card">
      {/* Grid */}
      <line
        x1={padding.left}
        y1={padding.top + chartHeight / 2}
        x2={width - padding.right}
        y2={padding.top + chartHeight / 2}
        stroke="currentColor"
        strokeWidth="1"
        className="text-border"
      />

      {/* Y-axis labels */}
      <text
        x={padding.left - 5}
        y={padding.top + 5}
        textAnchor="end"
        className="fill-muted-foreground text-[10px]"
      >
        +{maxValue.toFixed(1)}
      </text>
      <text
        x={padding.left - 5}
        y={padding.top + chartHeight}
        textAnchor="end"
        className="fill-muted-foreground text-[10px]"
      >
        -{maxValue.toFixed(1)}
      </text>
      <text
        x={padding.left - 5}
        y={padding.top + chartHeight / 2 + 4}
        textAnchor="end"
        className="fill-muted-foreground text-[10px]"
      >
        0
      </text>

      {/* X-axis labels */}
      <text
        x={padding.left}
        y={height - 10}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px]"
      >
        0
      </text>
      <text
        x={width - padding.right}
        y={height - 10}
        textAnchor="middle"
        className="fill-muted-foreground text-[10px]"
      >
        {totalLength.toFixed(1)}m
      </text>

      {/* Label */}
      <text
        x={width - padding.right}
        y={padding.top - 5}
        textAnchor="end"
        className="fill-foreground text-xs font-medium"
      >
        {label}
      </text>

      {/* Fill area */}
      <path d={fillPathD} fill={color} opacity="0.15" />

      {/* Line */}
      <path d={pathD} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
