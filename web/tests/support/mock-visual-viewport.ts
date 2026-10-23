export function mockVisualViewport() {
  if (globalThis.visualViewport) {
    return
  }

  const visualViewport = Object.assign(new EventTarget(), {
    width: 1024,
    height: 768,
    offsetLeft: 0,
    offsetTop: 0,
    scale: 1,
  })

  Object.defineProperty(globalThis, "visualViewport", {
    configurable: true,
    value: visualViewport,
  })

  if ("window" in globalThis) {
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: visualViewport,
    })
  }
}

export default mockVisualViewport
