import { CharacterStats } from '../simulator/state'
import { NumericInput } from './NumericInput'

interface Props {
  characterStats: CharacterStats
  onChange: (characterStats: CharacterStats) => void
}

export function CharacterStatsForm({ characterStats, onChange }: Props) {
  const onChangeStat = (field: keyof CharacterStats) => (value: number) =>
    onChange({
      ...characterStats,
      [field]: value,
    })

  const onChangePercentStat =
    (field: keyof CharacterStats) => (value: number) =>
      onChange({
        ...characterStats,
        [field]: value / 100,
      })

  return (
    <div className="flex gap-4 flex-wrap">
      <NumericInput
        label="Attack power"
        value={characterStats.attackPower}
        onChange={onChangeStat('attackPower')}
      />
      <NumericInput
        label="Spell power"
        value={characterStats.spellPower}
        onChange={onChangeStat('spellPower')}
      />
      <NumericInput
        label="Haste (%)"
        value={characterStats.haste * 100}
        onChange={onChangePercentStat('haste')}
      />
      <NumericInput
        label="Versatility (%)"
        value={characterStats.versatility * 100}
        onChange={onChangePercentStat('versatility')}
      />
      <NumericInput
        label="Critical strike (%)"
        value={characterStats.criticalStrike * 100}
        onChange={onChangePercentStat('criticalStrike')}
      />
      <NumericInput
        label="Weapon DPS"
        value={characterStats.weaponDps}
        onChange={onChangeStat('weaponDps')}
      />
    </div>
  )
}
