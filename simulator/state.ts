import { Ability } from './abilities'
import { talentNames } from './talents'

interface Hit {
  name: string
  damage: number
  time: number
}

interface Cast {
  name: string
  damage: number
  time: number
}

interface AbilityStats {
  name: string
  damage: number
  damagePercent: number
  dps: number
  hitCount: number
  castCount: number
}

export class Stats {
  time: number = 0
  hitHistory: Hit[] = []
  castHistory: Cast[] = []

  addToHistory(name: string, damageHits: number[], isAbility = false) {
    damageHits.forEach((damage) => {
      this.hitHistory.push({ name, damage, time: this.time })
    })

    if (isAbility) {
      const damage = damageHits.reduce((acc, dmg) => acc + dmg, 0)
      this.castHistory.push({ name, damage, time: this.time })
    }
  }

  damage() {
    return Math.round(this.hitHistory.reduce((acc, hit) => acc + hit.damage, 0))
  }

  dps() {
    return Math.round(this.damage() / this.time)
  }

  abilityStats(): AbilityStats[] {
    const groupedCasts = this.castHistory.reduce<Record<string, Cast[]>>(
      (acc, cast) => {
        acc[cast.name] ??= []
        acc[cast.name].push(cast)
        return acc
      },
      {}
    )

    const groupedHits = this.castHistory.reduce<Record<string, Cast[]>>(
      (acc, hit) => {
        acc[hit.name] ??= []
        acc[hit.name].push(hit)
        return acc
      },
      {}
    )

    return Object.entries(groupedHits)
      .sort(
        (a, b) =>
          a[1].reduce((acc, hit) => acc + hit.damage, 0) -
          b[1].reduce((acc, hit) => acc + hit.damage, 0)
      )
      .map(([name, hits]) => {
        const damage = hits.reduce((acc, hit) => acc + hit.damage, 0)
        const damagePercent = Math.round((damage / this.damage()) * 100)
        const dps = Math.round(damage / this.time)
        const castCount = groupedCasts[name].length
        const hitCount = hits.length
        return {
          name,
          damage,
          damagePercent,
          dps,
          castCount,
          hitCount,
        }
      })
  }
}

export class State {
  talents: Record<string, number>

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

  constructor(talents: Record<string, number>) {
    this.talents = talents
  }

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
    this.stats.addToHistory(talentNames.white_tiger_statue, whiteTigerHits)
    this.stats.addToHistory(talentNames.eye_of_the_tiger, eyeOfTheTigerHits)
    this.stats.addToHistory(talentNames.resonant_fists, resonantFistsHits)
    this.stats.addToHistory(talentNames.bonedust_brew, bdbHits)

    this.tickGcd(gcd)
  }

  tickGcd(gcd: number) {
    this.cooldowns = Object.fromEntries(
      Object.entries(this.cooldowns).map(([name, cooldown]) => {
        return [name, cooldown - gcd]
      })
    )

    this.buffs = Object.fromEntries(
      Object.entries(this.buffs).map(([name, cooldown]) => {
        return [name, cooldown - gcd]
      })
    )

    this.time += gcd
    this.stats.time = this.time
  }

  versatility() {
    return this.baseVersatility + this.secretInfusionVersIncrease()
  }

  haste() {
    const invokersDelightIncrease = this.isBuffActive(
      talentNames.invokers_delight
    )
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
    return (this.cooldowns[abilityName] ?? 0) >= 0.01
  }

  damageMultiplier() {
    const versMultiplier = 1 + this.versatility()
    const critMultipler = 1 + this.criticalStrike()
    const xuenMultiplier = this.talents[talentNames.ferocity_of_xuen] ? 1.04 : 1
    return versMultiplier * critMultipler * xuenMultiplier
  }

  secretInfusionVersIncrease() {
    if (!this.isBuffActive(talentNames.secret_infusion)) return 0
    const increase = { 1: 0.08, 2: 0.15 }[
      this.talents[talentNames.secret_infusion]
    ]
    if (increase === undefined) throw 'Secret Infusion talent invalid'
    return increase
  }

  whiteTigerDps(numTargets: number) {
    if (!this.isBuffActive(talentNames.white_tiger_statue)) return 0
    const attackPowerScaling = 0.25
    const timeBetweenPulses = 2
    return (
      (attackPowerScaling * this.baseAttackPower * numTargets) /
      timeBetweenPulses
    )
  }

  eyeOfTheTigerDps() {
    if (!this.talents[talentNames.eye_of_the_tiger]) return 0
    const attackPowerScaling = 0.281736
    const duration = 8
    return (attackPowerScaling * this.baseAttackPower) / duration
  }

  resonantFistsHits(procers: any[], numTargets: number) {
    if (!this.talents[talentNames.resonant_fists]) return []

    const attackPowerScaling = 0.15
    const damage =
      attackPowerScaling * this.baseAttackPower * this.damageMultiplier()
    const procChance = 0.1
    const procCount = procers.filter(() => Math.random() < procChance).length
    return Array(procCount * numTargets).fill(damage)
  }

  bonedustBrewDamageHits(damageHits: number[]) {
    if (
      !this.isBuffActive(talentNames.bonedust_brew) ||
      damageHits.length === 0
    )
      return []

    const procChance = 0.5
    let bdbMultiplier = 0.5
    if (this.talents[talentNames.attenuation]) bdbMultiplier *= 1.2

    const bdbHits = damageHits
      .filter(() => Math.random() < procChance)
      .map((d) => d * bdbMultiplier)

    if (this.talents[talentNames.attenuation]) {
      bdbHits.forEach(() => (this.cooldowns[talentNames.bonedust_brew] -= 0.5))
    }

    return bdbHits
  }
}
