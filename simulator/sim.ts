import { APL } from './apl'
import { CharacterStats } from './state'
import { makeTalentCombos, Talent } from './talents'
import { Simulation } from './simulator'

export interface SimulatorOptions {
  characterStats: CharacterStats
  talents: Record<Talent, number>
  talentsToTest: Talent[]
  apl: APL
  numTargets: number
  duration: number
  iterations: number
  setSimProgress: (progress: number | null) => void
}

export async function simulate(options: SimulatorOptions) {
  const startTime = Math.round(new Date().getTime()) / 1000.0
  options.setSimProgress(0)

  // const talentCombos = makeTalentCombos(options.talents, options.talentsToTest)
  const sims = [new Simulation(options)]
  await sims[0].run()
  // sim.sort((a, b) => a.averageDps() - b.averageDps()).reverse()

  const executionTime = Math.round(new Date().getTime()) / 1000.0 - startTime
  const totalIterationCount = sims.length * options.iterations
  const iterPerSec = Math.round(totalIterationCount / executionTime)
  console.log(
    `${totalIterationCount} iterations in ${executionTime}s, ${iterPerSec} iter/s`
  )

  options.setSimProgress(null)

  return sims
}
