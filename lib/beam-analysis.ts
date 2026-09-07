import type {
  BeamConfiguration,
  AnalysisResult,
  Load,
  Support,
} from "./types"

interface StationResult {
  x: number
  shear: number
  moment: number
}

function pointLoads(loads: Load[]) {
  return loads.filter((l) => l.type === "point")
}

function distributedLoads(loads: Load[]) {
  return loads.filter((l) => l.type === "distributed")
}

function momentLoads(loads: Load[]) {
  return loads.filter((l) => l.type === "moment")
}

function downwardSign(load: Load) {
  return load.direction === "down" ? 1 : -1
}

function buildStations(config: BeamConfiguration): number[] {
  const stations = new Set<number>()

  stations.add(0)
  stations.add(config.totalLength)

  config.supports.forEach((support) => {
    stations.add(support.position)
  })

  config.loads.forEach((load) => {
    stations.add(load.position)

    if (
      load.type === "distributed" &&
      load.endPosition !== undefined
    ) {
      stations.add(load.endPosition)
    }
  })

  return [...stations].sort((a, b) => a - b)
}

function calculateSimplySupportedReactions(
  config: BeamConfiguration
): AnalysisResult["reactions"] {
  const left = config.supports[0]
  const right = config.supports[config.supports.length - 1]

  let totalVertical = 0
  let totalMoment = 0

  config.loads.forEach((load) => {
    const sign = downwardSign(load)

    if (load.type === "point") {
      totalVertical += load.magnitude * sign
      totalMoment +=
        load.magnitude *
        sign *
        load.position
    }

    if (
      load.type === "distributed" &&
      load.endPosition !== undefined
    ) {
      const length =
        load.endPosition - load.position

      const resultant =
        load.magnitude *
        length *
        sign

      const centroid =
        load.position +
        length / 2

      totalVertical += resultant

      totalMoment +=
        resultant *
        centroid
    }

    if (load.type === "moment") {
      totalMoment +=
        load.magnitude * sign
    }
  })

  const span =
    right.position - left.position

  const RB =
    totalMoment / span

  const RA =
    totalVertical - RB

  return [
    {
      supportId: left.id,
      verticalReaction: RA,
    },
    {
      supportId: right.id,
      verticalReaction: RB,
    },
  ]
}

function calculateCantileverReactions(
  config: BeamConfiguration
): AnalysisResult["reactions"] {
  const fixed =
    config.supports.find(
      (s) => s.type === "fixed"
    )

  if (!fixed) return []

  let vertical = 0
  let moment = 0

  config.loads.forEach((load) => {
    const sign = downwardSign(load)

    if (load.type === "point") {
      vertical += load.magnitude * sign

      moment +=
        load.magnitude *
        sign *
        load.position
    }

    if (
      load.type === "distributed" &&
      load.endPosition !== undefined
    ) {
      const length =
        load.endPosition -
        load.position

      const force =
        load.magnitude *
        length *
        sign

      const centroid =
        load.position +
        length / 2

      vertical += force

      moment +=
        force *
        centroid
    }

    if (load.type === "moment") {
      moment +=
        load.magnitude * sign
    }
  })

  return [
    {
      supportId: fixed.id,
      verticalReaction: vertical,
      moment,
    },
  ]
}

function calculateReactions(
  config: BeamConfiguration
): AnalysisResult["reactions"] {
  switch (config.type) {
    case "cantilever":
      return calculateCantileverReactions(config)

    case "simply-supported":
      return calculateSimplySupportedReactions(config)

    case "continuous":
      return calculateSimplySupportedReactions(config)

    default:
      return []
  }
}