import Head from 'next/head'
import { useState } from 'react'
import { simulate } from '../simulator/sim'
import { SimulationStats } from '../components/SimulationStats'
import { Simulation } from '../simulator/simulator'
import { CharacterStats } from '../simulator/state'
import { Talent, talentNames } from '../simulator/talents'
import { NumericInput } from '../components/NumericInput'
import { APL, bestApls, getBestApl } from '../simulator/apl'
import { CharacterStatsForm } from '../components/CharacterStatsForm'
import { AplSelect } from '../components/AplSelect'
import { TalentEditor } from '../components/TalentEditor'
import GitHubButton from 'react-github-btn'
import { SimulateButton } from '../components/SimulateButton'

const defaultCharacterStats: CharacterStats = {
  versatility: 0.1,
  haste: 0.1,
  criticalStrike: 0.15,
  attackPower: 7001,
  spellPower: 7000,
  weaponDps: 1600,
}

const defaultTalents: Record<Talent, number> = {
  [talentNames.ferocity_of_xuen]: 1,
  [talentNames.fast_feet]: 1,
  [talentNames.resonant_fists]: 1,
  [talentNames.white_tiger_statue]: 1,
  [talentNames.eye_of_the_tiger]: 1,
  [talentNames.teachings]: 1,
  [talentNames.zen_pulse]: 1,
  [talentNames.faeline_stomp]: 1,
  [talentNames.ancient_concordance]: 2,
  [talentNames.awakened_faeline]: 1,
  [talentNames.gift_of_the_celestials]: 1,
  [talentNames.invokers_delight]: 1,
  [talentNames.secret_infusion]: 1,
  [talentNames.secret_infusion_2]: 1,
  [talentNames.bonedust_brew]: 0,
  [talentNames.attenuation]: 0,
  [talentNames.tea_of_plenty]: 0,
  [talentNames.focused_thunder]: 0,
}

export const defaultTalentsToTest: Talent[] = [
  talentNames.secret_infusion,
  talentNames.secret_infusion_2,
  talentNames.invokers_delight,
  talentNames.focused_thunder,
  talentNames.bonedust_brew,
  talentNames.attenuation,
]

export default function Home() {
  const [duration, setDuration] = useState(60)
  const [numTargets, setNumTargets] = useState(1)
  const [iterations, setIterations] = useState(1000)
  const [apl, setApl] = useState<APL>(bestApls[1])
  const [characterStats, setCharacterStats] = useState(defaultCharacterStats)
  const [talents, setTalents] = useState(defaultTalents)
  const [talentsToTest, setTalentsToTest] = useState([])

  const [sims, setSims] = useState<Simulation[] | null>(null)

  const onChangeTargets = (targets: number) => {
    setApl(getBestApl(targets))
    setNumTargets(targets)
  }

  return (
    <div className="px-8 lg:px-16">
      <Head>
        <title>Mistweaver Sim</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen py-8 flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <h1 className="text-6xl font-bold text-center text-teal-500">
            Mistweaver Damage Sim
          </h1>
          <GitHubButton href="https://github.com/acornellier/mw_sim" />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <NumericInput
              label="Targets"
              value={numTargets}
              onChange={onChangeTargets}
              min={1}
            />
            <NumericInput
              label="Duration"
              value={duration}
              onChange={setDuration}
              min={30}
              max={300}
            />
            <NumericInput
              label="Iterations"
              value={iterations}
              onChange={setIterations}
              min={1}
              max={10_000}
            />
          </div>
          <CharacterStatsForm
            characterStats={characterStats}
            onChange={setCharacterStats}
          />
          <AplSelect selectedApl={apl} onChange={setApl} />
          <TalentEditor talents={talents} onChangeTalents={setTalents} />
          <SimulateButton
            setSims={setSims}
            simOptions={{
              characterStats,
              talents,
              talentsToTest,
              apl,
              numTargets,
              duration,
              iterations,
            }}
          />
        </div>

        {sims && (
          <div className="flex flex-col gap-4">
            {sims.map((sim, idx) => {
              return (
                <SimulationStats
                  key={sim.nameWithTalents(talentsToTest)}
                  index={idx}
                  sim={sim}
                  talentsToTest={talentsToTest}
                />
              )
            })}
          </div>
        )}
      </main>

      <footer className="h-16" />
    </div>
  )
}
