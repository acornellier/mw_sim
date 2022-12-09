import { APL } from './apl'
import { CharacterStats, State, Stats } from './state'
import { prettyTalents } from './utils'
import { Talent } from './talents'
import { it } from 'node:test'

export interface SimulationOptions {
  apl: APL
  characterStats: CharacterStats
  talents: Record<string, number>
  numTargets: number
  duration: number
  iterations: number
  setSimProgress: (progress: number) => void
}

export class Simulation {
  opts: SimulationOptions
  stats: Stats[] = []

  constructor(opts: SimulationOptions) {
    this.opts = opts
  }

  async run() {
    const { apl, characterStats, talents, numTargets, duration, iterations } =
      this.opts

    for (let i = 0; i < iterations; ++i) {
      if (i % 100 == 0) {
        this.opts.setSimProgress(i / iterations)
        await new Promise((res) => setTimeout(res, 1))
      }

      const state = new State(characterStats, talents)

      while (state.time < duration) {
        const logicItem = apl.logic.find(([ability, condition]) => {
          return (
            !state.isOnCd(ability.name) &&
            (!ability.opts.requiredTalent ||
              state.talents[ability.opts.requiredTalent]) &&
            (!condition || condition(state))
          )
        })

        if (!logicItem) {
          throw 'No ability found by APL'
        }

        state.castAbility(logicItem[0], numTargets)
      }

      this.stats.push(state.stats)
    }
  }

  nameWithTalents(talentsToTest: Talent[]) {
    const talents = prettyTalents(this.opts.talents, talentsToTest)
    return [this.opts.apl.name, talents].join(' | ')
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
