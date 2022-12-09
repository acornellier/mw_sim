import { combinator } from './utils'
import { faelineStomp } from './abilities'

const ferocity_of_xuen = 'Ferocity of Xuen'
const fast_feet = 'Fast Feet'
const resonant_fists = 'Resonant Fists'
const white_tiger_statue = 'White Tiger Statue'
const eye_of_the_tiger = 'Eye of the Tiger'
const teachings = 'Teachings'
const zen_pulse = 'Zen Pulse'
const faeline_stomp = 'Faeline Stomp'
const gift_of_the_celestials = 'Gift of the Celestials'
const invokers_delight = 'Invokers Delight'
const secret_infusion = 'Secret Infusion'
const secret_infusion_2 = 'Secret Infusion 2'
const bonedust_brew = 'Bonedust Brew'
const attenuation = 'Attenuation'
const tea_of_plenty = 'Tea of Plenty'
const focused_thunder = 'Focused Thunder'

export const talentNames = {
  ferocity_of_xuen,
  fast_feet,
  eye_of_the_tiger,
  resonant_fists,
  white_tiger_statue,
  teachings,
  zen_pulse,
  gift_of_the_celestials,
  faeline_stomp,
  secret_infusion,
  secret_infusion_2,
  invokers_delight,
  bonedust_brew,
  attenuation,
  tea_of_plenty,
  focused_thunder,
} as const

export const talentGroups = [
  [
    ferocity_of_xuen,
    fast_feet,
    eye_of_the_tiger,
    resonant_fists,
    white_tiger_statue,
  ],
  [teachings, zen_pulse, gift_of_the_celestials, faeline_stomp],
  [faeline_stomp],
  [secret_infusion, secret_infusion_2, invokers_delight],
  [tea_of_plenty, focused_thunder, bonedust_brew, attenuation],
] as const

export type Talent = typeof talentNames[keyof typeof talentNames]
export type TalentMap = Record<Talent, number>

export function getDependencies(talent: Talent): Talent[] {
  if (talent === talentNames.attenuation) {
    return recDependencies(talentNames.bonedust_brew)
  }

  if (talent === talentNames.secret_infusion_2) {
    return recDependencies(talentNames.secret_infusion)
  }

  if (talent === talentNames.invokers_delight) {
    return recDependencies(talentNames.secret_infusion_2)
  }

  return []
}

function recDependencies(talent: Talent): Talent[] {
  return [talent].concat(getDependencies(talent))
}

export const makeTalentCombos = (
  defaultTalents: Record<Talent, number>,
  talentsToTest: Talent[]
) => {
  if (talentsToTest.length === 0) return [defaultTalents]

  return combinator(talentsToTest, 4)
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
              talent === talentNames.secret_infusion && hasSecretInfusion2
                ? 2
                : 1
            return [talent, levels]
          })
        ),
      }
    })
}
