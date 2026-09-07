// Beam analysis types

export type SupportType = 'pinned' | 'roller' | 'fixed' | 'free'
export type LoadType = 'point' | 'distributed' | 'moment'
export type BeamType = 'simply-supported' | 'cantilever' | 'continuous'

export interface Support {
  id: string
  type: SupportType
  position: number // position along beam in meters
}

export interface Load {
  id: string
  type: LoadType
  position: number // position along beam in meters
  magnitude: number // kN for point loads, kN/m for distributed loads
  endPosition?: number // end position along beam in meters for distributed loads
  direction: 'up' | 'down'
}

export interface Span {
  id: string
  length: number // in meters
  momentOfInertia?: number // I value
  elasticModulus?: number // E value
}

export interface BeamConfiguration {
  type: BeamType
  spans: Span[]
  supports: Support[]
  loads: Load[]
  totalLength: number
}

export interface AnalysisResult {
  reactions: {
    supportId: string
    verticalReaction: number
    horizontalReaction?: number
    moment?: number
  }[]

  shearForce: { x: number; value: number }[]

  bendingMoment: { x: number; value: number }[]

  resultStations: {
    x: number
    shear: number
    moment: number
  }[]

  maxShear: number
  maxMoment: number

  deflection?: {
    x: number
    value: number
  }[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}
