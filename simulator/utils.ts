import { Talent } from './talents'
import { talentsToTest } from './sim'

export function dupArray(array: any[], copies: number) {
  const newArray = array
  ;[...Array(copies)].forEach(() => {
    newArray.push(...[...array])
  })
  return newArray
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

export function prettyTalents(talents: Record<Talent, number>) {
  return Object.entries(talents)
    .filter(
      ([talent, value]) => value && talentsToTest.includes(talent as Talent)
    )
    .map(([talent, value]) => talent + (value === 1 ? '' : ` ${value}`))
    .join(' + ')
}
