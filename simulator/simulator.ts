import { Strategy } from './strategies'
import { CharacterStats, State, Stats } from './state'
import { prettyTalents } from './utils'
import { Talent } from './talents'

export interface SimulationOptions {
  strategy: Strategy
  characterStats: CharacterStats
  talents: Record<string, number>
  numTargets: number
  duration: number
  iterations: number
}

export class Simulation {
  opts: SimulationOptions
  stats: Stats[] = []

  constructor(opts: SimulationOptions) {
    this.opts = opts
  }

  run() {
    const {
      strategy,
      characterStats,
      talents,
      numTargets,
      duration,
      iterations,
    } = this.opts

    this.stats = [...Array(iterations)].map(() => {
      const state = new State(characterStats, talents)

      while (state.time < duration) {
        const logicItem = strategy.logic.find(([ability, condition]) => {
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

  nameWithTalents(talentsToTest: Talent[]) {
    const talents = prettyTalents(this.opts.talents, talentsToTest)
    return [this.opts.strategy.name, talents].join(' | ')
  }

  averageDps() {
    return Math.round(
      this.stats.reduce((acc, stats) => acc + stats.dps(), 0) /
        this.stats.length
    )
  }

  bestIteration() {
    return this.stats.sort((a, b) => a.damage() - b.damage())[
      this.stats.length - 1
    ]
  }

  medianIteration() {
    return this.stats.sort((a, b) => a.damage() - b.damage())[
      this.stats.length / 2
    ]
  }

  worstIteration() {
    return this.stats.sort((a, b) => a.damage() - b.damage())[0]
  }
}
