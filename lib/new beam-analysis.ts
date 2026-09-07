import type { BeamConfiguration, AnalysisResult } from "./types"

export function analyzeBeam(
  config: BeamConfiguration
): AnalysisResult {

  let reactions: AnalysisResult["reactions"]

  switch (config.type) {

    case "simply-supported":
      reactions = solveSimplySupported(config)
      break

    case "cantilever":
      reactions = solveCantilever(config)
      break

    case "continuous":
      reactions = solveThreeMomentEquation(config)
      break

    default:
      reactions = []
  }

  const shearForce = calculateShearForce(
    config,
    reactions
  )

  const bendingMoment = calculateBendingMoment(
    shearForce,
    config
  )

  return {

    reactions,

    shearForce,

    bendingMoment,

    resultStations: buildResultStations(
      config,
      reactions,
      shearForce,
      bendingMoment
    ),

    maxShear: Math.max(
      ...shearForce.map(p => Math.abs(p.value))
    ),

    maxMoment: Math.max(
      ...bendingMoment.map(p => Math.abs(p.value))
    )
  }

}

function solveSimplySupported(
  config: BeamConfiguration
): AnalysisResult["reactions"] {

  const reactions: AnalysisResult["reactions"] = []

  let totalLoad = 0
  let totalMoment = 0

  config.loads.forEach(load => {

    const sign =
      load.direction === "down"
        ? 1
        : -1

    if (load.type === "point") {

      totalLoad += sign * load.magnitude

      totalMoment +=
        sign *
        load.magnitude *
        load.position

    }

    else if (load.type === "distributed") {

      const end =
        load.endPosition ?? load.position

      const L =
        end - load.position

      const force =
        load.magnitude * L

      const centroid =
        load.position + L / 2

      totalLoad +=
        sign * force

      totalMoment +=
        sign *
        force *
        centroid

    }

  })

  const L = config.totalLength

  const RB =
    totalMoment / L

  const RA =
    totalLoad - RB

  reactions.push({

    supportId:
      config.supports[0].id,

    verticalReaction: RA

  })

  reactions.push({

    supportId:
      config.supports[1].id,

    verticalReaction: RB

  })

  return reactions

}

function solveCantilever(
  config: BeamConfiguration
): AnalysisResult["reactions"] {

  let V = 0
  let M = 0

  config.loads.forEach(load=>{

    const sign =
      load.direction==="down"
      ?1
      :-1

    if(load.type==="point"){

      V+=sign*load.magnitude

      M+=
      sign*
      load.magnitude*
      load.position

    }

  })

  return [

    {

      supportId:
      config.supports[0].id,

      verticalReaction:V,

      moment:M

    }

  ]

}

export function solveThreeMomentTwoSpan(config: BeamConfiguration) {

  if (config.spans.length !== 2) {
    throw new Error(
      "Three-Moment Equation currently supports only two spans."
    )
  }

  const L1 = config.spans[0].length
  const L2 = config.spans[1].length

  //---------------------------------------
  // SPAN 1
  //---------------------------------------

  let A1 = 0
  let x1 = L1 / 2

  //---------------------------------------
  // SPAN 2
  //---------------------------------------

  let A2 = 0
  let x2 = L2 / 2

  config.loads.forEach(load => {

    //-----------------------------------
    // POINT LOAD
    //-----------------------------------

    if (load.type === "point") {

      // Span AB
      if (load.position <= L1) {

        const P = load.magnitude
        const a = load.position
        const b = L1 - a

        const Mmax = (P * a * b) / L1

        // Triangle area under BMD
        A1 += 0.5 * L1 * Mmax

        x1 = L1 / 2

      }

      // Span BC
      else {

        const x = load.position - L1

        const P = load.magnitude

        const a = x

        const b = L2 - a

        const Mmax = (P * a * b) / L2

        A2 += 0.5 * L2 * Mmax

        x2 = L2 / 2

      }

    }

    //-----------------------------------
    // UDL
    //-----------------------------------

    if (load.type === "distributed") {

      // Entirely on span AB

      if (load.position < L1) {

        const start = load.position

        const end = Math.min(load.endPosition ?? L1, L1)

        const loadedLength = end - start

        if (loadedLength > 0) {

          const w = load.magnitude

          const Mmax =
            w *
            loadedLength *
            loadedLength /
            8

          // 2/3 L M
          A1 +=
            (2 / 3) *
            loadedLength *
            Mmax

          x1 = start + loadedLength / 2

        }

      }

      // Entirely on span BC

      else {

        const start =
          load.position - L1

        const end =
          (load.endPosition ?? (L1 + L2))
          - L1

        const loadedLength =
          end - start

        if (loadedLength > 0) {

          const w = load.magnitude

          const Mmax =
            w *
            loadedLength *
            loadedLength /
            8

          A2 +=
            (2 / 3) *
            loadedLength *
            Mmax

          x2 = start + loadedLength / 2

        }

      }

    }

  })

  //---------------------------------------
  // THREE MOMENT EQUATION
  //---------------------------------------

  const numerator =

    -6 * A1 * x1 / L1

    -

    6 * A2 * x2 / L2

  const denominator =

    2 * (L1 + L2)

  const MB = numerator / denominator

  return {

    MA: 0,

    MB,

    MC: 0

  }

}

export function calculateContinuousBeamReactions(
  config: BeamConfiguration,
  supportMoments: {
    MA: number
    MB: number
    MC: number
  }
): AnalysisResult["reactions"] {

  const L1 = config.spans[0].length
  const L2 = config.spans[1].length

  let RA = 0
  let RB1 = 0
  let RB2 = 0
  let RC = 0

  //----------------------------------
  // SPAN AB
  //----------------------------------

  config.loads.forEach(load => {

    if (
      load.type === "point" &&
      load.position <= L1
    ) {

      const P = load.magnitude

      const a = load.position

      const b = L1 - a

      RA = (P * b + supportMoments.MB) / L1

      RB1 = P - RA

    }

  })

  //----------------------------------
  // SPAN BC
  //----------------------------------

  config.loads.forEach(load => {

    if (
      load.type === "distributed" &&
      load.position >= L1
    ) {

      const w = load.magnitude

      const L = L2

      RB2 =
        ((w * L * (L / 2)) - supportMoments.MB) / L

      RC =
        RB2 - (w * L)

    }

  })

  //----------------------------------

  return [

    {
      supportId: config.supports[0].id,
      verticalReaction: RA
    },

    {
      supportId: config.supports[1].id,
      verticalReaction: RB1 + RB2,
      moment: supportMoments.MB
    },

    {
      supportId: config.supports[2].id,
      verticalReaction: RC
    }

  ]

}

export function solveThreeMomentEquation(
  config: BeamConfiguration
): AnalysisResult["reactions"] {
  if (config.spans.length === 2) {
    const moments = solveThreeMomentTwoSpan(config)
    return calculateContinuousBeamReactions(config, moments)
  }

  throw new Error("Three-Moment Equation currently supports only two spans.")
}

// ----- Helper implementations copied from legacy analysis so this module is standalone -----

function calculateShearForce(
  config: BeamConfiguration,
  reactions: AnalysisResult["reactions"]
): { x: number; value: number }[] {
  const { supports, loads, totalLength } = config
  const points: { x: number; value: number }[] = []
  const numPoints = 100

  // Get reaction values mapped to positions
  const reactionMap = new Map<number, number>()
  reactions.forEach((r) => {
    const support = supports.find((s) => s.id === r.supportId)
    if (support) {
      reactionMap.set(support.position, r.verticalReaction)
    }
  })

  // Load positions are already in meters
  const loadData = loads.map((load) => ({
    ...load,
    actualPosition: load.position,
    actualEndPosition: load.endPosition !== undefined ? load.endPosition : undefined,
  }))

  for (let i = 0; i <= numPoints; i++) {
    const x = (i / numPoints) * totalLength
    let shear = 0

    // Add reactions to the left of x
    reactionMap.forEach((reaction, position) => {
      if (position <= x) {
        shear += reaction
      }
    })

    // Subtract loads to the left of x
    loadData.forEach((load) => {
      const sign = load.direction === 'down' ? 1 : -1

      if (load.type === 'point' && load.actualPosition <= x) {
        shear -= load.magnitude * sign
      } else if (load.type === 'distributed') {
        const start = load.actualPosition
        const end = load.actualEndPosition || start + 1

        if (x >= start) {
          const effectiveLength = Math.min(x, end) - start
          shear -= load.magnitude * effectiveLength * sign
        }
      }
    })

    points.push({ x, value: shear })
  }

  return points
}

function calculateBendingMoment(
  shearForce: { x: number; value: number }[],
  config: BeamConfiguration
): { x: number; value: number }[] {
  const { totalLength, type, supports, loads } = config
  const points: { x: number; value: number }[] = []

  let moment = 0

  const appliedMoments = loads
    .filter((l) => l.type === 'moment')
    .map((l) => ({ position: l.position, value: l.magnitude * (l.direction === 'down' ? 1 : -1) }))

  let prevX = 0
  let prevShear = shearForce[0]?.value || 0

  for (let i = 0; i < shearForce.length; i++) {
    const { x, value: shear } = shearForce[i]

    const dx = x - prevX
    moment += ((shear + prevShear) / 2) * dx

    appliedMoments.forEach((m) => {
      if (prevX < m.position && x >= m.position) {
        moment += m.value
      }
    })

    points.push({ x, value: -moment })

    prevX = x
    prevShear = shear
  }

  if (type === 'simply-supported') {
    const endMoment = points[points.length - 1]?.value || 0
    const correction = endMoment / totalLength

    return points.map((p) => ({ x: p.x, value: p.value - correction * p.x }))
  }

  return points
}

function buildResultStations(
  config: BeamConfiguration,
  reactions: AnalysisResult['reactions'],
  shearForce: { x: number; value: number }[],
  bendingMoment: { x: number; value: number }[]
) {
  const stations = new Set<number>()

  stations.add(0)
  stations.add(config.totalLength)

  config.supports.forEach((support) => stations.add(support.position))

  config.loads.forEach((load) => {
    stations.add(load.position)
    if (load.type === 'distributed' && load.endPosition !== undefined) stations.add(load.endPosition)
  })

  const sortedStations = [...stations].sort((a, b) => a - b)

  return sortedStations.map((x) => {
    let shear = 0

    reactions.forEach((reaction) => {
      const support = config.supports.find((s) => s.id === reaction.supportId)
      if (support && support.position <= x) shear += reaction.verticalReaction
    })

    config.loads.forEach((load) => {
      const sign = load.direction === 'down' ? 1 : -1
      if (load.type === 'point') {
        if (load.position <= x) shear -= load.magnitude * sign
      }
      if (load.type === 'distributed') {
        const start = load.position
        const end = load.endPosition ?? start
        if (x > start) {
          const length = Math.min(x, end) - start
          if (length > 0) shear -= load.magnitude * length * sign
        }
      }
    })

    let moment = 0

    reactions.forEach((reaction) => {
      const support = config.supports.find((s) => s.id === reaction.supportId)
      if (support && support.position <= x) {
        moment += reaction.verticalReaction * (x - support.position)
        if (reaction.moment) moment += reaction.moment
      }
    })

    config.loads.forEach((load) => {
      const sign = load.direction === 'down' ? 1 : -1
      if (load.type === 'point') {
        if (load.position <= x) moment -= load.magnitude * (x - load.position) * sign
      }
      if (load.type === 'distributed') {
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
      if (load.type === 'moment') {
        if (load.position <= x) moment -= load.magnitude * (load.direction === 'down' ? 1 : -1)
      }
    })

    return { x, shear, moment }
  })
}