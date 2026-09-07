'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { BeamConfiguration, BeamType, Support, Load, SupportType, LoadType, Span } from '@/lib/types'

interface BeamBuilderProps {
  onConfigurationChange: (config: BeamConfiguration) => void
  configuration: BeamConfiguration
}

const defaultSpan: Span = {
  id: 'span-1',
  length: 6,
  momentOfInertia: 1,
  elasticModulus: 200,
}

export function BeamBuilder({ onConfigurationChange, configuration }: BeamBuilderProps) {
  const [activeTab, setActiveTab] = useState<'beam' | 'supports' | 'loads'>('beam')

  const updateBeamType = (type: BeamType) => {
    let newSupports: Support[] = []
    let newSpans: Span[] = [{ ...defaultSpan }]

    switch (type) {
      case 'simply-supported':
        newSupports = [
          { id: 'support-1', type: 'pinned', position: 0 },
          { id: 'support-2', type: 'roller', position: newSpans[0].length },
        ]
        break

      case 'cantilever':
        newSupports = [{ id: 'support-1', type: 'fixed', position: 0 }]
        break

      case 'continuous': {
        const spans: Span[] = [
          { id: 'span-1', length: 4, momentOfInertia: 1, elasticModulus: 200 },
          { id: 'span-2', length: 4, momentOfInertia: 1, elasticModulus: 200 },
        ]
        const totalLength = spans.reduce((sum, s) => sum + s.length, 0)
        newSpans = spans
        newSupports = [
          { id: 'support-1', type: 'pinned', position: 0 },
          { id: 'support-2', type: 'roller', position: spans[0].length },
          { id: 'support-3', type: 'roller', position: totalLength },
        ]
        break
      }
    }

    onConfigurationChange({
      ...configuration,
      type,
      supports: newSupports,
      spans: newSpans,
      totalLength: newSpans.reduce((sum, s) => sum + s.length, 0),
    })
  }

  const addLoad = () => {
    const newLoad: Load = {
      id: `load-${Date.now()}`,
      type: 'point',
      position: configuration.totalLength / 2,
      magnitude: 10,
      direction: 'down',
    }
    onConfigurationChange({
      ...configuration,
      loads: [...configuration.loads, newLoad],
    })
  }

  const updateLoad = (id: string, updates: Partial<Load>) => {
    onConfigurationChange({
      ...configuration,
      loads: configuration.loads.map((load) => (load.id === id ? { ...load, ...updates } : load)),
    })
  }

  const removeLoad = (id: string) => {
    onConfigurationChange({
      ...configuration,
      loads: configuration.loads.filter((load) => load.id !== id),
    })
  }

  const updateSpan = (index: number, length: number) => {
    const newSpans = [...configuration.spans]
    newSpans[index] = { ...newSpans[index], length }
    onConfigurationChange({
      ...configuration,
      spans: newSpans,
      totalLength: newSpans.reduce((sum, s) => sum + s.length, 0),
    })
  }

  const addSpan = () => {
    if (configuration.type !== 'continuous') return

    const newSpan: Span = {
      id: `span-${Date.now()}`,
      length: 4,
      momentOfInertia: 1,
      elasticModulus: 200,
    }

    const updatedSpans = [...configuration.spans, newSpan]
    const updatedTotalLength = updatedSpans.reduce((sum, span) => sum + span.length, 0)

    const updatedSupports = [...configuration.supports]
    updatedSupports.push({ id: `support-${Date.now()}`, type: 'roller', position: updatedTotalLength })

    onConfigurationChange({
      ...configuration,
      spans: updatedSpans,
      supports: updatedSupports,
      totalLength: updatedTotalLength,
    })
  }

  const updateSupport = (index: number, updates: Partial<Support>) => {
    const updated = [...configuration.supports]
    updated[index] = { ...updated[index], ...updates }
    onConfigurationChange({ ...configuration, supports: updated })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Beam Configuration</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {(['beam', 'supports', 'loads'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Beam Tab */}
        {activeTab === 'beam' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Beam Type</Label>
              <Select value={configuration.type} onValueChange={(v) => updateBeamType(v as BeamType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="simply-supported">Simply Supported</SelectItem>
                  <SelectItem value="cantilever">Cantilever</SelectItem>
                  <SelectItem value="continuous">Continuous (Multi-span)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Spans</Label>
                {configuration.type === 'continuous' && (
                  <Button variant="outline" size="sm" onClick={addSpan}>
                    Add Span
                  </Button>
                )}
              </div>

              {configuration.spans.map((span, index) => (
                <div key={span.id} className="flex items-center gap-2">
                  <span className="w-20 text-sm text-muted-foreground">Span {index + 1}</span>
                  <Input
                    type="number"
                    value={span.length}
                    onChange={(e) => updateSpan(index, parseFloat(e.target.value) || 0)}
                    className="w-24"
                    min={0.1}
                    step={0.1}
                  />
                  <span className="text-sm text-muted-foreground">m</span>
                </div>
              ))}
            </div>

            <div className="rounded-md bg-muted px-3 py-2 text-sm">
              <span className="text-muted-foreground">Total Length: </span>
              <span className="font-medium">{configuration.totalLength.toFixed(2)} m</span>
            </div>
          </div>
        )}

        {/* Supports Tab */}
        {activeTab === 'supports' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Support positions are automatically set based on beam type.</p>

            {configuration.supports.map((support, index) => (
              <div key={support.id} className="rounded-md border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Support {index + 1}</span>

                  <Select
                    value={support.type}
                    onValueChange={(value) => updateSupport(index, { type: value as SupportType })}
                  >
                    <SelectTrigger className="w-36 h-8">
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="pinned">Pinned</SelectItem>
                      <SelectItem value="roller">Roller</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-3 space-y-1">
                  <label className="text-sm text-muted-foreground">Position (m)</label>

                  <Input
                    type="number"
                    step="0.1"
                    min={0}
                    max={configuration.totalLength}
                    value={support.position}
                    onChange={(e) => updateSupport(index, { position: Number(e.target.value) })}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loads Tab */}
        {activeTab === 'loads' && (
          <div className="space-y-4">
            <Button onClick={addLoad} variant="outline" className="w-full">
              Add Load
            </Button>

            {configuration.loads.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">No loads added yet. Click above to add a load.</p>
            )}

            {configuration.loads.map((load, index) => (
              <div key={load.id} className="space-y-3 rounded-md border border-border p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Load {index + 1}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLoad(load.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                      <path d="M18 6L6 18M6 6l12 12" />
                    </svg>
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Type</Label>
                    <Select value={load.type} onValueChange={(v) => updateLoad(load.id, { type: v as LoadType })}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="point">Point Load</SelectItem>
                        <SelectItem value="distributed">Distributed</SelectItem>
                        <SelectItem value="moment">Moment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Direction</Label>
                    <Select value={load.direction} onValueChange={(v) => updateLoad(load.id, { direction: v as 'up' | 'down' })}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="down">Downward</SelectItem>
                        <SelectItem value="up">Upward</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">Position (m)</Label>
                    <Input
                      type="number"
                      value={load.position}
                      min={0}
                      max={configuration.totalLength}
                      step={0.1}
                      onChange={(e) => updateLoad(load.id, { position: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-xs">Magnitude ({load.type === 'distributed' ? 'kN/m' : load.type === 'moment' ? 'kNm' : 'kN'})</Label>
                    <Input type="number" value={load.magnitude} onChange={(e) => updateLoad(load.id, { magnitude: parseFloat(e.target.value) || 0 })} className="h-9" min={0} step={0.1} />
                  </div>

                  {load.type === 'distributed' && (
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">End Position (m)</Label>
                      <Input type="number" value={load.endPosition || load.position + 20} onChange={(e) => updateLoad(load.id, { endPosition: parseFloat(e.target.value) || 0 })} className="h-9" min={load.position} max={configuration.totalLength} />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
