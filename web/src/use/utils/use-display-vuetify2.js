import { computed } from "vue"
import { getCurrentInstance } from "vue"

/**
 * Shim for Vuetify 2 usage in script setup until we upgrade to Vuetify 3
 */
export function useDisplayVuetify2() {
  const { proxy } = getCurrentInstance()

  return {
    xs: computed(() => proxy.$vuetify.breakpoint.xs),
    sm: computed(() => proxy.$vuetify.breakpoint.sm),
    md: computed(() => proxy.$vuetify.breakpoint.md),
    lg: computed(() => proxy.$vuetify.breakpoint.lg),
    xl: computed(() => proxy.$vuetify.breakpoint.xl),

    xsOnly: computed(() => proxy.$vuetify.breakpoint.xsOnly),
    smOnly: computed(() => proxy.$vuetify.breakpoint.smOnly),
    smAndDown: computed(() => proxy.$vuetify.breakpoint.smAndDown),
    smAndUp: computed(() => proxy.$vuetify.breakpoint.smAndUp),
    mdOnly: computed(() => proxy.$vuetify.breakpoint.mdOnly),
    mdAndDown: computed(() => proxy.$vuetify.breakpoint.mdAndDown),
    mdAndUp: computed(() => proxy.$vuetify.breakpoint.mdAndUp),
    lgOnly: computed(() => proxy.$vuetify.breakpoint.lgOnly),
    lgAndDown: computed(() => proxy.$vuetify.breakpoint.lgAndDown),
    lgAndUp: computed(() => proxy.$vuetify.breakpoint.lgAndUp),
    xlOnly: computed(() => proxy.$vuetify.breakpoint.xlOnly),

    mobile: computed(() => proxy.$vuetify.breakpoint.mobile),
    name: computed(() => proxy.$vuetify.breakpoint.name),
    height: computed(() => proxy.$vuetify.breakpoint.height),
    width: computed(() => proxy.$vuetify.breakpoint.width),
  }
}

export default useDisplayVuetify2
