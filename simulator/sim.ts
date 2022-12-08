import { targetStrategies } from './strategies'
import { CharacterStats } from './state'
import { makeTalentCombos, Talent } from './talents'
import { Simulation } from './simulator'

interface SimulatorOptions {
  characterStats: CharacterStats
  talentsToTest: Talent[]
  numTargets: number
  duration: number
  iterationCount: number
}

export function simulate(options: SimulatorOptions) {
  const startTime = Math.round(new Date().getTime()) / 1000.0
  const strategies = targetStrategies[options.numTargets]
  const talentCombos = makeTalentCombos(options.talentsToTest)

  const sims = strategies
    .flatMap((strategy) =>
      talentCombos.map((talents) => {
        const sim = new Simulation({
          ...options,
          strategy,
          talents,
        })
        sim.run()
        return sim
      })
    )
    .sort((a, b) => a.averageDps() - b.averageDps())
    .reverse()

  const executionTime = Math.round(new Date().getTime()) / 1000.0 - startTime
  const totalIterationCount = sims.length * options.iterationCount
  const iterPerSec = Math.round(totalIterationCount / executionTime)
  console.log(
    `${totalIterationCount} iterations in ${executionTime}s, ${iterPerSec} iter/s`
  )

  return sims
}
