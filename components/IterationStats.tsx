import { Simulation } from '../simulator/sim'
import { prettyTalents } from '../simulator/utils'
import { useState } from 'react'

interface Props {
  index: number
  sim: Simulation
}

export function SimulationStats({ index, sim }: Props) {
  const [showCasts, setShowCasts] = useState(false)

  const name = `${index + 1}: ${sim.strategy.name.padEnd(4)}`
  const talents = prettyTalents(sim.talents)
  const parts = [
    name,
    talents,
    `${sim.averageDps()} dps (${sim.worstIteration().dps()}-${sim
      .bestIteration()
      .dps()})`,
  ]

  const iter = sim.medianIteration()
  const abilityStats = iter.abilityStats()
  console.log(iter.castHistory)

  return (
    <div>
      <b>{parts.join(' | ')}</b>
      <div>{`DPS: ${iter.dps()} (${iter.damage()} dmg)`}</div>
      {abilityStats.map((stat) => (
        <div key={stat.name}>
          {stat.name}: {stat.dps} dps ({stat.damagePercent}%) {stat.damage} dmg,{' '}
          {stat.castCount} casts, {stat.hitCount} hits
        </div>
      ))}
      <button
        className="rounded-full px-4 py-1 bg-gray-500 hover:bg-gray-700"
        onClick={() => setShowCasts(!showCasts)}
      >
        {showCasts ? 'Hide' : 'Show'} casts
      </button>
      {showCasts && (
        <div>
          {iter.castHistory.map((cast, idx) => (
            <div key={idx} className="flex">
              <div className="w-12">{Math.round(cast.time * 100) / 100}</div>
              <div>{[cast.name, Math.round(cast.damage)].join(' -- ')}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
