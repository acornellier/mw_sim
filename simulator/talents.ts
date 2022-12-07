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
