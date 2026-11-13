import { createVuetify } from "vuetify"

import "vuetify/styles"

import "@/assets/typography.css"
import "@/assets/vuetify3-tweaks.css" // Vuetify 3 CSS quirks that can't be fixed via defaults

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
          primary: "#00616D",
          secondary: "#FFFFFF",
          accent: "#00616D",
          anchor: "#00616D",
          info: "#244C5A",
          success: "#244402",
          warning: "#563B00",
          error: "#244C5A",
          "on-background": "#323232",
          "on-surface": "#323232",
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
    VCard: {
      border: true,
      elevation: 0,
    },
    VBreadcrumbs: {
      class: "pl-0",
    },
    VCardActions: {
      VBtn: {
        variant: "elevated",
        color: "primary",
      },
    },
    VAutocomplete: {
      variant: "outlined",
    },
    VCombobox: {
      variant: "outlined",
    },
    VDataTable: {
      elevation: 0,
      class: "rounded",
    },
    VDataTableServer: {
      elevation: 0,
      class: "rounded",
    },
    VDateInput: {
      variant: "outlined",
      color: "primary",
      prependIcon: "",
      prependInnerIcon: "mdi-calendar",
      placeholder: "YYYY-MM-DD",
      persistentPlaceholder: true,
      inputFormat: "yyyy-mm-dd",
    },
    VSelect: {
      variant: "outlined",
    },
    VTextarea: {
      variant: "outlined",
    },
    VTextField: {
      variant: "outlined",
    },
  },
})
