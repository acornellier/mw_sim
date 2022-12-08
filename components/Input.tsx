interface Props {
  label: string
  max?: number
  min?: number
  onChange: (newValue: number) => void
  value: number
}

export function NumericInput<T>({ label, max, min, onChange, value }: Props) {
  return (
    <div className="flex items-center">
      <label className="block text-gray-500 font-bold mb-1 pr-4">{label}</label>
      <div className="w-2/3">
        <input
          className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-32 py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-teal-500"
          type="number"
          min={min}
          max={max}
          onChange={(e) => onChange(Number(e.target.value))}
          value={value}
        />
      </div>
    </div>
  )
}
