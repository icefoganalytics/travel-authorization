import { createVuetify } from "vuetify"
import * as components from "vuetify/components"
import * as directives from "vuetify/directives"

export function mockVuetify() {
  return createVuetify({
    components,
    directives,
  })
}

export default mockVuetify
