const { launch } = vi.hoisted(() => ({ launch: vi.fn() }))

// Import directly, not through the shared support barrel, to keep the mock opt-in.
vi.mock("puppeteer", () => ({
  default: { launch },
}))

export function mockPuppeteer() {
  const browserState = { connected: false }
  const page = {
    setJavaScriptEnabled: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    setContent: vi.fn<() => Promise<void>>().mockResolvedValue(undefined),
    pdf: vi.fn<() => Promise<Uint8Array>>(),
  }

  launch.mockImplementation(async () => {
    browserState.connected = true

    return {
      async newPage() {
        return page
      },
      async close() {
        browserState.connected = false
      },
    }
  })

  return { browserState, page }
}

export default mockPuppeteer
