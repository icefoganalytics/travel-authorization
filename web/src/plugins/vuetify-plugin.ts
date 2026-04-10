import { createVuetify } from "vuetify"

import "vuetify/styles"

import "@/assets/yk-style.css"
import "@/assets/vuetify2-extensions.css"

export default createVuetify({
  theme: {
    defaultTheme: "yukonNorthStar",
    variations: {
      colors: ["primary", "secondary"],
      lighten: 2,
      darken: 2,
    },
    themes: {
      yukonNorthStar: {
        colors: {
          primary: "#0097a9",
          secondary: "#F2A900",
          "on-secondary": "#FFFFFF",
          accent: "#244C5A",
          anchor: "#00818f",
          info: "#0097a9",
          success: "#7A9A01",
          warning: "#F2A900",
          "on-warning": "#FFFFFF",
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
    VCardActions: {
      VBtn: {
        variant: "elevated",
        color: "primary",
      },
    },
    VDateInput: {
      variant: "outlined",
      density: "comfortable",
      color: "primary",
      prependIcon: "",
      prependInnerIcon: "mdi-calendar",
      placeholder: "YYYY-MM-DD",
      persistentPlaceholder: true,
      inputFormat: "yyyy-mm-dd",
    },
  },
})
