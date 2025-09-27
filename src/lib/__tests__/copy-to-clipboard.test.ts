import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { copyToClipboard } from '@/lib/utils'

// Minimal textarea stub used in fallback
class TextAreaStub {
  value = ''
  style: Record<string, string> = {}
  setAttribute = vi.fn()
  select = vi.fn()
}

describe('copyToClipboard', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('uses navigator.clipboard.writeText when available', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })

    await expect(copyToClipboard('hello')).resolves.toBeUndefined()
    expect(writeText).toHaveBeenCalledTimes(1)
    expect(writeText).toHaveBeenCalledWith('hello')
  })

  it('falls back to document.execCommand("copy") when Clipboard API is not available', async () => {
    const appendChild = vi.fn()
    const removeChild = vi.fn()
    const execCommand = vi.fn().mockReturnValue(true)
    const createElement = vi.fn().mockImplementation(() => new TextAreaStub())

    const mockedDocument = {
      createElement,
      body: { appendChild, removeChild },
      execCommand,
    } as unknown as Document

    vi.stubGlobal('document', mockedDocument)

    await expect(copyToClipboard('world')).resolves.toBeUndefined()
    expect(createElement).toHaveBeenCalledWith('textarea')
    expect(appendChild).toHaveBeenCalledTimes(1)
    expect(execCommand).toHaveBeenCalledWith('copy')
    expect(removeChild).toHaveBeenCalledTimes(1)
  })

  it('tries fallback when Clipboard API exists but rejects', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    vi.stubGlobal('navigator', { clipboard: { writeText } })

    const appendChild = vi.fn()
    const removeChild = vi.fn()
    const execCommand = vi.fn().mockReturnValue(true)
    const createElement = vi.fn().mockImplementation(() => new TextAreaStub())
    const mockedDocument = {
      createElement,
      body: { appendChild, removeChild },
      execCommand,
    } as unknown as Document
    vi.stubGlobal('document', mockedDocument)

    await expect(copyToClipboard('fallback')).resolves.toBeUndefined()
    expect(writeText).toHaveBeenCalledTimes(1)
    expect(execCommand).toHaveBeenCalledWith('copy')
  })

  it('throws if fallback execCommand is missing', async () => {
    const appendChild = vi.fn()
    const removeChild = vi.fn()
    const createElement = vi.fn().mockImplementation(() => new TextAreaStub())
    const mockedDocument = {
      createElement,
      body: { appendChild, removeChild },
      // execCommand intentionally undefined
    } as unknown as Document
    vi.stubGlobal('document', mockedDocument)

    await expect(copyToClipboard('no-exec')).rejects.toThrow('Copy command is not supported or failed')
    expect(appendChild).toHaveBeenCalledTimes(1)
    expect(removeChild).toHaveBeenCalledTimes(1)
  })
})
