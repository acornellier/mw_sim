const armorResistance = 0.735

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
const bonedust_brew = 'Bonedust Brew'
const attenuation = 'Attenuation'
const tea_of_plenty = 'Tea of Plenty'
const focused_thunder = 'Focused Thunder'

function dupArray(array: any[], copies: number) {
  const newArray = array
  for (let i = 0; i < copies; ++i) {
    newArray.push(...[...array])
  }
  return newArray
}

interface Hit {
  name: string
  damage: number
}

interface Cast {
  name: string
  damage: number
}

class Stats {
  time: number = 0
  hitHistory: Hit[] = []
  castHistory: Cast[] = []

  addToHistory(name: string, damageHits: number[], isAbility = false) {
    damageHits.forEach((damage) => {
      this.hitHistory.push({ name, damage })
    })

    if (isAbility) {
      const damage = damageHits.reduce((acc, dmg) => acc + dmg, 0)
      this.castHistory.push({ name, damage })
    }
  }

  damage() {
    return Math.round(this.hitHistory.reduce((acc, hit) => acc + hit.damage, 0))
  }

  dps() {
    return Math.round(this.damage() / this.time)
  }

  printStats(printCasts = false) {
    console.log(`DPS: ${this.dps()} (${this.damage()} dmg)`)
  }
}

class State {
  talents: Record<string, number> = {}
  baseVersatility: number = 0.1
  baseHaste: number = 0.1202
  baseCriticalStrike: number = 0.1508
  baseAttackPower: number = 6924
  baseSpellPower: number = 6658
  baseWeaponDps: number = 1593.47

  time: number = 0
  stats: Stats = new Stats()

  cooldowns: Record<string, number> = {}
  buffs: Record<string, number> = {}
  teachings: number = 0
  empoweredRsks: number = 0
  firstTftEmpowerAvailable: boolean = false

  castAbility(ability: Ability, numTargets: number) {
    if (this.isOnCd(ability.name)) throw 'Cannot cast ability on cooldown'

    this.cooldowns[ability.name] = ability.hastedCooldown(this)

    const abilityHits = ability.damageHits(this, numTargets)
    ability.sideEffects(this, numTargets)
    const gcd = ability.opts.gcd / (1 + this.haste())

    const weaponHits = [this.baseWeaponDps * gcd * this.damageMultiplier()]
    const eyeOfTheTigerHits = [
      this.eyeOfTheTigerDps() * gcd * this.damageMultiplier(),
    ]
    const whiteTigerHits = [
      this.whiteTigerDps(numTargets) * gcd * this.damageMultiplier(),
    ]

    const bdbProcers = abilityHits.concat(weaponHits).concat(whiteTigerHits)
    const bdbHits = this.bonedustBrewDamageHits(bdbProcers)

    const resonantFistsProcers = abilityHits.concat(weaponHits)
    const resonantFistsHits = this.resonantFistsHits(
      resonantFistsProcers,
      numTargets
    )

    this.stats.addToHistory(ability.name, abilityHits, true)
    this.stats.addToHistory('Weapon', weaponHits)
    this.stats.addToHistory(white_tiger_statue, whiteTigerHits)
    this.stats.addToHistory(eye_of_the_tiger, eyeOfTheTigerHits)
    this.stats.addToHistory(resonant_fists, resonantFistsHits)
    this.stats.addToHistory(bonedust_brew, bdbHits)

    this.tickGcd(gcd)
  }

  tickGcd(gcd: number) {
    this.cooldowns = Object.fromEntries(
      Object.entries(this.cooldowns).map(([name, cooldown]) => {
        return [name, cooldown - gcd]
      })
    )
  }

  versatility() {
    return this.baseVersatility + this.secretInfusionVersIncrease()
  }

  haste() {
    const invokersDelightIncrease = this.isBuffActive(invokers_delight)
      ? 0.33
      : 0
    return this.baseHaste + invokersDelightIncrease
  }

  criticalStrike() {
    return this.baseCriticalStrike
  }

  isBuffActive(buffName: string) {
    return (this.buffs[buffName] ?? 0) > 0
  }

  isOnCd(abilityName: string) {
    return (this.cooldowns[abilityName] ?? 0) > 0
  }

  damageMultiplier() {
    const versMultiplier = 1 + this.versatility()
    const critMultipler = 1 + this.criticalStrike()
    const xuenMultiplier = this.talents[ferocity_of_xuen] ? 1.04 : 1
    return versMultiplier * critMultipler * xuenMultiplier
  }

  secretInfusionVersIncrease() {
    if (!this.isBuffActive(secret_infusion)) return 0
    const increase = { 1: 0.08, 2: 0.15 }[this.talents[secret_infusion]]
    if (increase === undefined) throw 'Secret Infusion talent invalid'
    return increase
  }

  whiteTigerDps(numTargets: number) {
    if (!this.isBuffActive(white_tiger_statue)) return 0
    const attackPowerScaling = 0.25
    const timeBetweenPulses = 2
    return (
      (attackPowerScaling * this.baseAttackPower * numTargets) /
      timeBetweenPulses
    )
  }

  eyeOfTheTigerDps() {
    if (!this.talents[eye_of_the_tiger]) return 0
    const attackPowerScaling = 0.281736
    const duration = 8
    return (attackPowerScaling * this.baseAttackPower) / duration
  }

  resonantFistsHits(procers: any[], numTargets: number) {
    if (!this.talents[resonant_fists]) return []

    const attackPowerScaling = 0.15
    const damage =
      attackPowerScaling * this.baseAttackPower * this.damageMultiplier()
    const procChance = 0.1
    const procCount = procers.filter((_) => Math.random() < procChance).length
    return Array(procCount).fill(damage)
  }

  bonedustBrewDamageHits(damageHits: number[]) {
    if (!this.isBuffActive(bonedust_brew) || damageHits.length === 0) return []

    const procChance = 0.5
    let bdbMultiplier = 0.5
    if (this.talents[attenuation]) bdbMultiplier *= 1.2

    const bdbHits = damageHits
      .filter((_) => Math.random() < procChance)
      .map((d) => d * bdbMultiplier)
    if (this.talents[attenuation]) {
      bdbHits.forEach((_) => (this.cooldowns[bonedust_brew] -= 0.5))
    }
    return bdbHits
  }
}

interface AbilityOptions {
  apScaling: number
  spScaling: number
  mwModifier: number
  cooldown: number
  maxTargets: number
  physicalSchool: boolean
  hasteFlagged: false
  gcd: number
  requiredTalent: string | null
}

const defaulAbilityOptions: AbilityOptions = {
  apScaling: 0,
  cooldown: 0,
  gcd: 1.5,
  hasteFlagged: false,
  maxTargets: 1,
  mwModifier: 0,
  physicalSchool: false,
  requiredTalent: null,
  spScaling: 0,
}

class Ability {
  name: string
  opts: AbilityOptions

  constructor(name: string, options: Partial<AbilityOptions>) {
    this.name = name
    this.opts = { ...defaulAbilityOptions, ...options }
  }

  damageHits(state: State, numTargets: number): number[] {
    const damage = this.baseDamage(state, numTargets)
    if (damage == 0) return []
    const targetsHit = Math.min(numTargets, this.opts.maxTargets)
    return Array(targetsHit).fill(damage)
  }

  baseDamage(state: State, numTargets: number) {
    let baseDamage =
      this.opts.apScaling * state.baseAttackPower +
      this.opts.spScaling * state.baseSpellPower
    baseDamage += baseDamage * this.opts.mwModifier
    const armorReduction = this.opts.physicalSchool ? armorResistance : 1
    return baseDamage * armorReduction * state.damageMultiplier()
  }

  sideEffects(state: State, numTargets: number): void {}

  hastedCooldown(state: State) {
    const haste_multiplier = this.opts.hasteFlagged
      ? 1.0 / (1 + state.haste())
      : 1
    return this.opts.cooldown * haste_multiplier
  }
}

class TigerPalm extends Ability {
  damageHits(state: State, numTargets: number) {
    const base = super.damageHits(state, numTargets)
    if (!state.isBuffActive(faeline_stomp)) return base
    return dupArray(base, 2)
  }

  sideEffects(state: State, numTargets: number) {
    state.buffs[eye_of_the_tiger] = 8
    if (state.talents[teachings]) {
      state.teachings += state.isBuffActive(faeline_stomp) ? 2 : 1
    }
  }
}

class BlackoutKick extends Ability {
  damageHits(state: State, numTargets: number): number[] {
    const faelineTargets = state.isBuffActive(faeline_stomp)
      ? Math.min(3, numTargets)
      : 1
    const teachingHits = 1 + state.teachings
    return dupArray(
      super.damageHits(state, numTargets),
      faelineTargets * teachingHits
    )
  }
}

const tigerPalm = new TigerPalm('Tiger Palm', {
  apScaling: 0.27027,
  mwModifier: 1,
})

export { tigerPalm }
