import { Strategy } from './strategies'
import { CharacterStats } from './state'
import { makeTalentCombos, Talent } from './talents'
import { Simulation } from './simulator'

interface SimulatorOptions {
  characterStats: CharacterStats
  talentsToTest: Talent[]
  strategy: Strategy
  numTargets: number
  duration: number
  iterations: number
}

export function simulate(options: SimulatorOptions) {
  const startTime = Math.round(new Date().getTime()) / 1000.0
  const talentCombos = makeTalentCombos(options.talentsToTest)

  const sims = talentCombos
    .map((talents) => {
      const sim = new Simulation({
        ...options,
        talents,
      })
      sim.run()
      return sim
    })
    .sort((a, b) => a.averageDps() - b.averageDps())
    .reverse()

  const executionTime = Math.round(new Date().getTime()) / 1000.0 - startTime
  const totalIterationCount = sims.length * options.iterations
  const iterPerSec = Math.round(totalIterationCount / executionTime)
  console.log(
    `${totalIterationCount} iterations in ${executionTime}s, ${iterPerSec} iter/s`
  )

  return sims
}
