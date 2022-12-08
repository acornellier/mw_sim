import { combinator } from './utils'

const ferocity_of_xuen = 'Ferocity of Xuen'
const fast_feet = 'Fast Feet'
const resonant_fists = 'Resonant Fists'
const white_tiger_statue = 'White Tiger Statue'
const eye_of_the_tiger = 'Eye of the Tiger'
const teachings = 'Teachings'
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
  resonant_fists,
  white_tiger_statue,
  eye_of_the_tiger,
  teachings,
  faeline_stomp,
  gift_of_the_celestials,
  invokers_delight,
  secret_infusion,
  secret_infusion_2,
  bonedust_brew,
  attenuation,
  tea_of_plenty,
  focused_thunder,
} as const

export type Talent = typeof talentNames[keyof typeof talentNames]

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

export const makeTalentCombos = (talentsToTest: Talent[]) =>
  combinator(talentsToTest, 4)
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
              talent === talentNames.secret_infusion && hasSecretInfusion2
                ? 2
                : 1
            return [talent, levels]
          })
        ),
      }
    })
