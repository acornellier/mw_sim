import { State } from './state'
import {
  Ability,
  bdb,
  blackoutKick,
  faelineStomp,
  invoke,
  risingSunKick,
  spinningCraneKick,
  summonWhiteTigerStatue,
  tft,
  tigerPalm,
  zenPulse,
} from './abilities'
import { talentNames } from './talents'

export interface Strategy {
  name: string
  logic: Array<[Ability] | [Ability, (state: State) => boolean]>
}

const singleTarget: Strategy = {
  name: 'Single Target',
  logic: [
    [tft],
    [summonWhiteTigerStatue],
    [faelineStomp, (state) => !state.isBuffActive(faelineStomp.name)],
    [bdb],
    [invoke],
    [risingSunKick],
    [tigerPalm, (state) => state.teachings <= 1],
    [blackoutKick],
  ],
}

const singleTargetInfusionPrio: Strategy = {
  name: 'Single Target, RSK for Infusion only',
  logic: [
    [tft],
    [summonWhiteTigerStatue],
    [faelineStomp, (state) => !state.isBuffActive(faelineStomp.name)],
    [bdb],
    [invoke],
    [
      risingSunKick,
      (state) =>
        state.firstTftEmpowerAvailable &&
        !!state.talents[talentNames.secret_infusion],
    ],
    [tigerPalm, (state) => state.teachings <= 1],
    [blackoutKick],
  ],
}

const multiTargetInfusionPrio: Strategy = {
  name: 'Multi target, RSK for Infusion only',
  logic: [
    [tft],
    [summonWhiteTigerStatue],
    [invoke],
    [bdb],
    [
      risingSunKick,
      (state) =>
        state.firstTftEmpowerAvailable &&
        !!state.talents[talentNames.secret_infusion],
    ],
    [zenPulse],
    [spinningCraneKick],
  ],
}

export const defaultStrategies = [
  singleTarget,
  singleTargetInfusionPrio,
  multiTargetInfusionPrio,
]

export const bestStrategies: Record<number, Strategy> = {
  1: singleTarget,
  2: singleTarget,
  3: singleTargetInfusionPrio,
  4: multiTargetInfusionPrio,
  5: multiTargetInfusionPrio,
}
