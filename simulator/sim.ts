import { Strategy, targetStrategies } from './strategies'
import { State, Stats } from './state'
import { Talent, talentNames } from './talents'
import { combinator, prettyTalents } from './utils'

interface SimulationOptions {
  numTargets: number
  duration: number
  iterationCount: number
}

export class Simulation {
  strategy: Strategy
  talents: Record<string, number>
  iterations: Stats[] = []

  constructor(strategy: Strategy, talents: Record<string, number>) {
    this.strategy = strategy
    this.talents = talents
  }

  run({ numTargets, duration, iterationCount }: SimulationOptions) {
    this.iterations = [...Array(iterationCount)].map(() => {
      const state = new State(this.talents)

      while (state.time < duration) {
        const logicItem = this.strategy.logic.find(([ability, condition]) => {
          return (
            !state.isOnCd(ability.name) &&
            (!ability.opts.requiredTalent ||
              state.talents[ability.opts.requiredTalent]) &&
            (!condition || condition(state))
          )
        })

        if (!logicItem) {
          throw 'No ability found by strategy'
        }

        state.castAbility(logicItem[0], numTargets)
      }

      return state.stats
    })
  }

  nameWithTalents() {
    const talents = prettyTalents(this.talents)
    return [this.strategy.name, talents].join(' | ')
  }

  averageDps() {
    return (
      this.iterations.reduce((acc, stats) => acc + stats.dps(), 0) /
      this.iterations.length
    )
  }

  bestIteration() {
    return this.iterations.sort((a, b) => a.damage() - b.damage())[
      this.iterations.length - 1
    ]
  }

  medianIteration() {
    return this.iterations.sort((a, b) => a.damage() - b.damage())[
      this.iterations.length / 2
    ]
  }

  worstIteration() {
    return this.iterations.sort((a, b) => a.damage() - b.damage())[0]
  }
}

const defaultTalents: Record<Talent, number> = {
  [talentNames.ferocity_of_xuen]: 1,
  [talentNames.fast_feet]: 1,
  [talentNames.resonant_fists]: 1,
  [talentNames.white_tiger_statue]: 1,
  [talentNames.eye_of_the_tiger]: 1,
  [talentNames.teachings]: 1,
  [talentNames.faeline_stomp]: 1,
  [talentNames.gift_of_the_celestials]: 1,
  [talentNames.invokers_delight]: 0,
  [talentNames.secret_infusion]: 0,
  [talentNames.secret_infusion_2]: 0,
  [talentNames.bonedust_brew]: 0,
  [talentNames.attenuation]: 0,
  [talentNames.tea_of_plenty]: 0,
  [talentNames.focused_thunder]: 0,
}

export const talentsToTest: Talent[] = [
  talentNames.secret_infusion,
  talentNames.secret_infusion_2,
  talentNames.invokers_delight,
  talentNames.focused_thunder,
  talentNames.bonedust_brew,
  talentNames.attenuation,
]

const talentCombos = combinator(talentsToTest, 4)
  .filter((talentCombo) => {
    if (
      talentCombo.includes(talentNames.attenuation) &&
      !talentCombo.includes(talentNames.bonedust_brew)
    ) {
      return false
    }

    if (
      talentCombo.includes(talentNames.secret_infusion_2) &&
      !talentCombo.includes(talentNames.secret_infusion)
    ) {
      return false
    }

    if (
      talentCombo.includes(talentNames.invokers_delight) &&
      !talentCombo.includes(talentNames.secret_infusion_2)
    ) {
      return false
    }

    if (
      talentCombo.includes(talentNames.attenuation) &&
      !talentCombo.includes(talentNames.bonedust_brew)
    ) {
      return false
    }

    return true
  })
  .map((talentCombo) => talentCombo.sort())
  .map((talentCombo) => {
    const infusion2Idx = talentCombo.indexOf(talentNames.secret_infusion_2)
    const hasSecretInfusion2 = infusion2Idx !== -1
    if (hasSecretInfusion2) {
      talentCombo.splice(infusion2Idx, 1)
    }

    return {
      ...defaultTalents,
      ...Object.fromEntries(
        talentCombo.map((talent) => {
          const levels =
            talent === talentNames.secret_infusion && hasSecretInfusion2 ? 2 : 1
          return [talent, levels]
        })
      ),
    }
  })

export function run(simOptions: SimulationOptions) {
  const startTime = Math.round(new Date().getTime()) / 1000.0
  const strategies = targetStrategies[simOptions.numTargets]
  let totalIterationCount = 0

  const sims = strategies
    .flatMap((strategy) =>
      talentCombos.map((talents) => {
        const sim = new Simulation(strategy, talents)
        sim.run(simOptions)
        totalIterationCount += simOptions.iterationCount
        return sim
      })
    )
    .sort((a, b) => a.averageDps() - b.averageDps())
    .reverse()

  const executionTime = Math.round(new Date().getTime()) / 1000.0 - startTime
  const iterPerSec = Math.round(totalIterationCount / executionTime)
  console.log(
    `${totalIterationCount} iterations in ${executionTime}s, ${iterPerSec} iter/s`
  )

  return sims
}
