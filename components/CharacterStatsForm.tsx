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

  return (
    <div className="flex gap-4">
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
        label="Haste"
        value={characterStats.haste}
        onChange={onChangeStat('haste')}
      />
      <NumericInput
        label="Versatility"
        value={characterStats.versatility}
        onChange={onChangeStat('versatility')}
      />
      <NumericInput
        label="Critical Strike"
        value={characterStats.criticalStrike}
        onChange={onChangeStat('criticalStrike')}
      />
      <NumericInput
        label="Weapon DPS"
        value={characterStats.weaponDps}
        onChange={onChangeStat('weaponDps')}
      />
    </div>
  )
}
