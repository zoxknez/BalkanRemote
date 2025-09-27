import { describe, it, expect } from 'vitest'
import { isClipboardDisabled } from '@/components/clipboard-button'

describe('ClipboardButton helpers', () => {
  it('isClipboardDisabled returns true when disabled prop is true', () => {
    expect(isClipboardDisabled('value', true)).toBe(true)
  })

  it('isClipboardDisabled returns true when value is empty', () => {
    expect(isClipboardDisabled('', false)).toBe(true)
    expect(isClipboardDisabled('', undefined)).toBe(true)
  })

  it('isClipboardDisabled returns false when value present and not disabled', () => {
    expect(isClipboardDisabled('abc', false)).toBe(false)
    expect(isClipboardDisabled('abc', undefined)).toBe(false)
  })
})
