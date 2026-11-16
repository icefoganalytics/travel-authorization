import { mount } from "@vue/test-utils"

import mockVuetify from "@/tests/support/mock-vuetify"

export const mountWithDefaultPlugins: typeof mount = (component, options = {}) => {
  const vuetify = mockVuetify()
  const plugins = [vuetify, ...(options.global?.plugins ?? [])]
  const mountOptions = {
    ...options,
    global: {
      ...options.global,
      plugins,
    },
  }

  return mount(component, mountOptions)
}

export default mountWithDefaultPlugins
