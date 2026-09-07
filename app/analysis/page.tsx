'use client'

import { useState } from 'react'
import { Header } from '../../components/header'
import { BeamBuilder } from '../../components/beam-builder'
import { BeamCanvas } from '../../components/beam-canvas'
import { CivilBotChat } from '../../components/civilbot-chat'
import { ResultsPanel } from '../../components/results-panel'
import type { BeamConfiguration } from '../../lib/types'

const defaultConfiguration: BeamConfiguration = {
  type: 'simply-supported',
  spans: [{ id: 'span-1', length: 6, momentOfInertia: 1, elasticModulus: 200 }],
  supports: [
  { id: 'support-1', type: 'pinned', position: 0 },
  { id: 'support-2', type: 'roller', position: 6 },
],
  loads: [],
  totalLength: 6,
}
export default function AnalysisPage() {
  const [configuration, setConfiguration] = useState<BeamConfiguration>(defaultConfiguration)
  const [activeView, setActiveView] = useState<'builder' | 'results'>('builder')

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <div className="flex-1 bg-background">
        <div className="mx-auto max-w-screen-2xl px-6 py-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground">Beam Analysis</h1>
            <p className="mt-1 text-muted-foreground">
              Configure your beam, add loads, and analyze with CivilBot assistance
            </p>
          </div>

          {/* Mobile View Toggle */}
          <div className="mb-4 flex gap-2 lg:hidden">
            <button
              onClick={() => setActiveView('builder')}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeView === 'builder'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              Builder
            </button>
            <button
              onClick={() => setActiveView('results')}
              className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                activeView === 'results'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              Results & Chat
            </button>
          </div>

          {/* Main Content Grid */}
          <div className="grid gap-6 lg:grid-cols-12">
            {/* Left Column - Builder & Canvas */}
            <div
              className={`space-y-6 lg:col-span-5 ${
                activeView !== 'builder' ? 'hidden lg:block' : ''
              }`}
            >
              <BeamBuilder
                configuration={configuration}
                onConfigurationChange={setConfiguration}
              />
              <BeamCanvas configuration={configuration} />
              <ResultsPanel configuration={configuration} />
            </div>

            {/* Right Column - Chat Interface */}
            <div
              className={`flex lg:col-span-7 ${
                activeView !== 'results' ? 'hidden lg:flex' : ''
             }`}
            >
              <div className="flex h-full w-full">
                <CivilBotChat beamConfiguration={configuration} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-4">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>CivilMadeEasy - Civil Engineering Analysis Tool</p>
            <div className="flex gap-4">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent" />
                CivilBot Active
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
