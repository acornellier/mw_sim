import { State } from './state'
import {
  Ability,
  allAbilities,
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

type AbilityWithCondition = [Ability, (state: State) => boolean, string]
type Logic = [Ability] | AbilityWithCondition

export interface APL {
  name: string
  logic: Logic[]
}

const faelineLogic: AbilityWithCondition = [
  faelineStomp,
  (state) => !state.isBuffActive(faelineStomp.name),
  'Only if faeline inactive',
]

const tigerPalmTeachingsLogic: AbilityWithCondition = [
  tigerPalm,
  (state) =>
    state.teachings <= 1 ||
    (state.teachings <= 2 && !state.talents[talentNames.awakened_faeline]),
  'Only if teaching stacks <= 1',
]

const rskInfusionLogic: AbilityWithCondition = [
  risingSunKick,
  (state) =>
    state.firstTftEmpowerAvailable &&
    !!state.talents[talentNames.secret_infusion],
  'Only to proc Secret Infusion',
]

const invokeLogic: AbilityWithCondition = [
  invoke,
  (state) => state.talents[talentNames.invokers_delight] > 0,
  "Only with Invoker's Delight talented",
]

const singleTarget: APL = {
  name: 'Optimal 1-2 targets',
  logic: [
    [tft],
    [summonWhiteTigerStatue],
    faelineLogic,
    [bdb],
    invokeLogic,
    [risingSunKick],
    tigerPalmTeachingsLogic,
    [blackoutKick],
    [tigerPalm],
  ],
}

const singleTargetInfusionPrio: APL = {
  name: 'Optimal 3 targets',
  logic: [
    [tft],
    [summonWhiteTigerStatue],
    faelineLogic,
    [bdb],
    invokeLogic,
    rskInfusionLogic,
    tigerPalmTeachingsLogic,
    [blackoutKick],
    [tigerPalm],
  ],
}

const multiTargetRskInfusion: APL = {
  name: 'Optimal 4+ targets',
  logic: [
    [tft],
    [summonWhiteTigerStatue],
    invokeLogic,
    [bdb],
    rskInfusionLogic,
    [zenPulse],
    [spinningCraneKick],
  ],
}

export const allLogics: Logic[] = [
  ...allAbilities.map((ability) => [ability] as [Ability]),
  ...[faelineLogic, tigerPalmTeachingsLogic, invokeLogic, rskInfusionLogic],
]

export const defaultApls = [
  singleTarget,
  singleTargetInfusionPrio,
  multiTargetRskInfusion,
]

export const bestApls: Record<number, APL> = {
  1: singleTarget,
  2: singleTarget,
  3: singleTargetInfusionPrio,
  4: multiTargetRskInfusion,
  5: multiTargetRskInfusion,
}

export const getBestApl = (numTargets: number) =>
  numTargets > 5 ? multiTargetRskInfusion : bestApls[numTargets]
