// Beam analysis calculations

import {
  solveThreeMomentTwoSpan,
  calculateContinuousBeamReactions,
} from "./new beam-analysis"

import type { BeamConfiguration, AnalysisResult } from './types'

export function analyzeBeam(config: BeamConfiguration): AnalysisResult {
  const { type, spans, supports, loads, totalLength } = config

  // Calculate reactions based on beam type
  const reactions = calculateReactions(config)

  // Generate shear force diagram data
  const shearForce = calculateShearForce(config, reactions)

  // Generate bending moment diagram data
  const bendingMoment = calculateBendingMoment(shearForce, config)

  // Find max values
  const maxShear = Math.max(...shearForce.map((p) => Math.abs(p.value)))
  const maxMoment = Math.max(...bendingMoment.map((p) => Math.abs(p.value)))

  return {
  reactions,
  shearForce,
  bendingMoment,
  resultStations: buildResultStations(config, reactions, shearForce, bendingMoment),
  maxShear,
  maxMoment,
}
}

function calculateReactions(config: BeamConfiguration) {
  const { type, supports, loads, totalLength } = config

  // Convert load positions from percentage to actual positions
  const loadData = loads.map((load) => ({
    ...load,
    actualPosition: load.position,
    actualEndPosition:
      load.endPosition !== undefined ? load.endPosition: undefined,
  }))

  // Calculate total load and moments
  let totalLoadForce = 0
  let totalMomentAboutLeft = 0

  loadData.forEach((load) => {
    const sign = load.direction === 'down' ? 1 : -1

    if (load.type === 'point') {
      totalLoadForce += load.magnitude * sign
      totalMomentAboutLeft += load.magnitude * sign * load.actualPosition
    } else if (load.type === 'distributed') {
      const length = (load.actualEndPosition || load.actualPosition + 1) - load.actualPosition
      const force = load.magnitude * length * sign
      const centroid = load.actualPosition + length / 2
      totalLoadForce += force
      totalMomentAboutLeft += force * centroid
    } else if (load.type === 'moment') {
      totalMomentAboutLeft += load.magnitude * sign
    }
  })

  const reactions: AnalysisResult['reactions'] = []

  if (type === 'simply-supported' || type === 'continuous') {
    // For simply supported: use equilibrium equations
    // ΣM about left support = 0 → R2 * L = totalMomentAboutLeft
    // ΣFy = 0 → R1 + R2 = totalLoadForce

    const leftSupport = supports.find((s) => s.position === 0)
    const rightSupport = supports.find(
    (s) => s.position === totalLength
    )

    if (leftSupport && rightSupport) {
      const R2 = totalMomentAboutLeft / totalLength
      const R1 = totalLoadForce - R2

      reactions.push({
        supportId: leftSupport.id,
        verticalReaction: R1,
      })

      reactions.push({
        supportId: rightSupport.id,
        verticalReaction: R2,
      })
    }

    // Handle intermediate supports for continuous beams
// Continuous beams will be solved using Clapeyron's Three-Moment Equation
if (type === "continuous") {

  const moments = solveThreeMomentTwoSpan(config)

  return calculateContinuousBeamReactions(
    config,
    moments
  )

}

  } else if (type === 'cantilever') {
    // For cantilever: all load transferred to fixed support
    const fixedSupport = supports.find((s) => s.type === 'fixed')

    if (fixedSupport) {
      reactions.push({
        supportId: fixedSupport.id,
        verticalReaction: totalLoadForce,
        moment: totalMomentAboutLeft,
      })
    }
  }

  return reactions
}

function calculateShearForce(
  config: BeamConfiguration,
  reactions: AnalysisResult["reactions"]
): { x: number; value: number }[] {

  const { supports, loads, totalLength } = config

  const numPoints = 100

const xs: number[] = []

for (let i = 0; i <= numPoints; i++) {
  xs.push((i / numPoints) * totalLength)
}

  const reactionMap = new Map<number,number>()

  reactions.forEach(r=>{

    const support = supports.find(s=>s.id===r.supportId)

    if(support)
      reactionMap.set(support.position,r.verticalReaction)

  })

  const results:{x:number,value:number}[]=[]

  xs.forEach(x=>{

    let V=0

    reactionMap.forEach((reaction,pos)=>{

      if(pos<=x)
        V+=reaction

    })

    loads.forEach(load=>{

      const sign = load.direction==="down" ? 1 : -1

      if(load.type==="point"){

        if(load.position<=x)
          V-=load.magnitude*sign

      }

      else if(load.type==="distributed"){

        if(x>load.position){

          const L=Math.min(x,load.endPosition ?? x)-load.position

          if(L>0)
            V-=load.magnitude*L*sign

        }

      }

    })

    results.push({
      x,
      value:V
    })

  })

  return results
}
function calculateBendingMoment(
  shearForce: { x: number; value: number }[],
  config: BeamConfiguration
): { x: number; value: number }[] {
  const { totalLength, type, supports, loads } = config
  const points: { x: number; value: number }[] = []

  // For cantilever with fixed support at left, start with the fixed-end moment
  let moment = 0
  if (type === 'cantilever') {
    // Start from free end (right side) where M = 0
    // We'll calculate from left to right but adjust for cantilever
  }

  // Get applied moments
  const appliedMoments = loads
    .filter((l) => l.type === 'moment')
    .map((l) => ({
      position: l.position,
      value: l.magnitude * (l.direction === 'down' ? 1 : -1),
    }))

  // Integrate shear to get moment
  let prevX = 0
  let prevShear = shearForce[0]?.value || 0

  for (let i = 0; i < shearForce.length; i++) {
    const { x, value: shear } = shearForce[i]

    // Trapezoidal integration
    const dx = x - prevX
    moment += ((shear + prevShear) / 2) * dx

    // Add applied moments
    appliedMoments.forEach((m) => {
      if (prevX < m.position && x >= m.position) {
        moment += m.value
      }
    })

    points.push({ x, value: -moment }) // Negative for conventional sign

    prevX = x
    prevShear = shear
  }

  // Normalize - ensure moment is 0 at simple supports
  if (type === 'simply-supported') {
    const endMoment = points[points.length - 1]?.value || 0
    const correction = endMoment / totalLength

    return points.map((p) => ({
      x: p.x,
      value: p.value - correction * p.x,
    }))
  }

  return points
}

function buildResultStations(
  config: BeamConfiguration,
  reactions: AnalysisResult["reactions"],
  shearForce: { x: number; value: number }[],
  bendingMoment: { x: number; value: number }[]
) {
  const stations = new Set<number>()

  // Beam start and end
  stations.add(0)
  stations.add(config.totalLength)

  // Supports
  config.supports.forEach((support) => {
    stations.add(support.position)
  })

  // Loads
  config.loads.forEach((load) => {
    stations.add(load.position)

    if (load.endPosition !== undefined) {
      stations.add(load.endPosition)
    }
  })

  const sortedStations = [...stations].sort((a, b) => a - b)

  return sortedStations.map((x) => {
    // ---------- SHEAR ----------
    let shear = 0

    // Add reactions to the left
    reactions.forEach((reaction) => {
      const support = config.supports.find(
        (s) => s.id === reaction.supportId
      )

      if (support && support.position <= x) {
        shear += reaction.verticalReaction
      }
    })

    // Subtract loads to the left
    config.loads.forEach((load) => {
      const sign = load.direction === "down" ? 1 : -1

      if (load.type === "point") {
        if (load.position <= x) {
          shear -= load.magnitude * sign
        }
      }

      if (load.type === "distributed") {
        const start = load.position
        const end = load.endPosition ?? start

        if (x > start) {
          const length = Math.min(x, end) - start

          if (length > 0) {
            shear -= load.magnitude * length * sign
          }
        }
      }
    })

    // ---------- MOMENT ----------
    let moment = 0

    // Reactions
    reactions.forEach((reaction) => {
      const support = config.supports.find(
        (s) => s.id === reaction.supportId
      )

      if (support && support.position <= x) {
        moment += reaction.verticalReaction * (x - support.position)

        if (reaction.moment) {
          moment += reaction.moment
        }
      }
    })

    // Loads
    config.loads.forEach((load) => {
      const sign = load.direction === "down" ? 1 : -1

      if (load.type === "point") {
        if (load.position <= x) {
          moment -= load.magnitude * (x - load.position) * sign
        }
      }

      if (load.type === "distributed") {
        const start = load.position
        const end = load.endPosition ?? start

        if (x > start) {
          const loadedLength = Math.min(x, end) - start

          if (loadedLength > 0) {
            const resultant = load.magnitude * loadedLength
            const centroid = start + loadedLength / 2

            moment -= resultant * (x - centroid) * sign
          }
        }
      }

      if (load.type === "moment") {
        if (load.position <= x) {
          moment -= load.magnitude * sign
        }
      }
    })

    return {
      x,
      shear,
      moment,
    }
  })
}

function solveThreeMomentEquation(
  config: BeamConfiguration
): AnalysisResult["reactions"] {

  // Temporary placeholder.
  // In the next step this will be replaced with the actual
  // Three-Moment Equation implementation.

  return []
}

export function formatReaction(value: number): string {
  return `${value >= 0 ? '↑' : '↓'} ${Math.abs(value).toFixed(2)} kN`
}

export function formatMoment(value: number): string {
  return `${value >= 0 ? '↻' : '↺'} ${Math.abs(value).toFixed(2)} kNm`
}
