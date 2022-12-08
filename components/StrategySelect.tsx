import { defaultStrategies, Strategy } from '../simulator/strategies'

interface Props {
  selectedStrategy: Strategy | null
  onChange: (strategy: Strategy) => void
}

export function StrategySelect({ selectedStrategy, onChange }: Props) {
  const options = defaultStrategies

  const handleChange = (value: string) => {
    onChange(options.find(({ name }) => name === value)!)
  }

  return (
    <div className="flex flex-col">
      <label className="block text-gray-500 font-bold mb-1 pr-4">
        Strategy
      </label>
      <select
        className="w-96 bg-gray-200 border-2 border-gray-200 rounded py-2 px-4 text-gray-700 focus:outline-none focus:bg-white focus:border-teal-500"
        onChange={(e) => handleChange(e.target.value)}
        value={selectedStrategy?.name}
      >
        {options.map((strategy) => (
          <option
            key={strategy.name}
            value={strategy.name}
            className="w-96 bg-gray-200 border-2 border-gray-200 rounded py-2 px-4 text-gray-700 focus:outline-none focus:bg-white focus:border-teal-500"
          >
            {strategy.name}
          </option>
        ))}
      </select>
    </div>
  )
}
