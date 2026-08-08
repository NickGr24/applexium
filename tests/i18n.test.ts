import { describe, expect, it } from 'vitest'
import en from '../src/i18n/en.json'
import ro from '../src/i18n/ro.json'

function flatKeys(obj: object, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) =>
    typeof v === 'object' && v !== null ? flatKeys(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  )
}

describe('i18n parity', () => {
  it('ro and en have identical key sets', () => {
    expect(flatKeys(en).sort()).toEqual(flatKeys(ro).sort())
  })
  it('no empty strings', () => {
    for (const dict of [ro, en])
      for (const key of flatKeys(dict))
        expect(key.split('.').reduce((o: any, k) => o[k], dict)).not.toBe('')
  })
})
