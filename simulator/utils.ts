import { Talent } from './talents'

export function multiplyArray(array: any[], copies: number) {
  return [...Array(copies)].flatMap(() => array)
}

export function combinator<T>(strings: T[], n: number): T[][] {
  if (strings.length < n) {
    return []
  }

  if (n === 0) {
    return [[]]
  }

  const combinations = []

  for (let i = 0; i < strings.length - n + 1; i++) {
    const substrings = strings.slice(i + 1)
    const subcombinations = combinator(substrings, n - 1)
    const newCombinations = subcombinations.map((comb) => [strings[i], ...comb])
    combinations.push(...newCombinations)
  }

  return combinations
}

export function prettyTalents(
  talents: Record<Talent, number>,
  talentsToTest: Talent[]
) {
  return Object.entries(talents)
    .filter(
      ([talent, value]) => value && talentsToTest.includes(talent as Talent)
    )
    .map(([talent, value]) => talent + (value === 1 ? '' : ` ${value}`))
    .join(' + ')
}
