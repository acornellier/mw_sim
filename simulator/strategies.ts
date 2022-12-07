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
  name: 'ST',
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
  name: 'STI',
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
  name: 'MTI',
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

export const strategies = {
  singleTarget,
  singleTargetInfusionPrio,
  multiTargetInfusionPrio,
}

export const targetStrategies: Record<number, Strategy[]> = {
  1: [singleTarget],
  2: [singleTarget],
  3: [singleTargetInfusionPrio],
  4: [multiTargetInfusionPrio],
  5: [multiTargetInfusionPrio],
}
