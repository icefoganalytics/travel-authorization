import { createI18n, useI18n } from "vue-i18n"

import en from "@/locales/en"

export { useI18n }

export default createI18n({
  legacy: false,
  globalInjection: true,
  locale: "en",
  messages: {
    en,
  },
  // Allows specifying $default as option to $t.
  // Usage: this.$t(`global.phase.${value}`, { $default: "Unknown" })
  // Using $default as this is unlikely to collide with translation interpolation options.
  missing: (_locale, key, _vm, values) => {
    if (values && values[0] && (values[0] as { $default?: string }).$default) {
      return (values[0] as { $default?: string }).$default
    }

    return key
  },
})
