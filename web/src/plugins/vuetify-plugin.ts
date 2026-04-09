import { createVuetify } from "vuetify"

import "vuetify/styles"

import "@/assets/yk-style.css"
import "@/assets/vuetify2-extensions.css"

export default createVuetify({
  theme: {
    defaultTheme: "yukonNorthStar",
    themes: {
      yukonNorthStar: {
        colors: {
          primary: "#0097a9",
          secondary: "#F2A900",
          accent: "#244C5A",
          anchor: "#00818f",
          info: "#0097a9",
          success: "#7A9A01",
          warning: "#F2A900",
          error: "#DC4405",
        },
      },
    },
  },
  defaults: {
    VBtn: {
      color: "primary",
      elevation: 0,
      style: "text-transform: none;",
      variant: "flat",
    },
  },
})
