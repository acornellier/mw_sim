import { prettyTalents } from '../simulator/utils'
import { Fragment, useState } from 'react'
import { Talent } from '../simulator/talents'
import { Simulation } from '../simulator/simulator'

interface Props {
  index: number
  sim: Simulation
  talentsToTest: Talent[]
}

export function SimulationStats({ index, sim, talentsToTest }: Props) {
  const [showCasts, setShowCasts] = useState(false)
  const [showAbilityBreakdown, setShowAbilityBreakdown] = useState(false)

  const dps = `${sim.averageDps()} dps (${sim.worstIteration().dps()}-${sim
    .bestIteration()
    .dps()})`

  const iter = sim.medianIteration()
  const abilityStats = iter.abilityStats()

  return (
    <div className="flex flex-col gap-2">
      <b>
        {index + 1}. {prettyTalents(sim.opts.talents, talentsToTest)} | {dps}
      </b>
      <button
        className="w-64 rounded-full px-4 py-1 bg-gray-300 hover:bg-gray-400"
        onClick={() => setShowAbilityBreakdown(!showAbilityBreakdown)}
      >
        {showAbilityBreakdown ? 'Hide' : 'Show'} ability breakdown
      </button>
      {showAbilityBreakdown && (
        <div>
          <div>{`Median iteration details: ${iter.dps()} dps (${iter.damage()} dmg)`}</div>
          {abilityStats.map((stat) => (
            <div key={stat.name}>
              {stat.name}: {stat.dps} dps ({stat.damagePercent}%) {stat.damage}{' '}
              dmg, {stat.castCount} casts, {stat.hitCount} hits
            </div>
          ))}
        </div>
      )}
      <button
        className="w-64 rounded-full px-4 py-1 bg-gray-300 hover:bg-gray-400"
        onClick={() => setShowCasts(!showCasts)}
      >
        {showCasts ? 'Hide' : 'Show'} casts
      </button>
      {showCasts && (
        <div className="grid gap-x-2 grid-cols-[4rem_10rem_8rem]">
          <div className="w-12 font-bold">Time</div>
          <div className="font-bold">Cast</div>
          <div className="font-bold">Damage</div>
          {iter.castHistory.map((cast, idx) => (
            <Fragment key={idx}>
              <div className="w-12">{Math.round(cast.time * 100) / 100}</div>
              <div>{cast.name}</div>
              <div>{Math.round(cast.damage)}</div>
            </Fragment>
          ))}
        </div>
      )}
    </div>
  )
}
