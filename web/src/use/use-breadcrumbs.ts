import { reactive, toRefs, unref, watch, type Ref } from "vue"
import { isUndefined } from "lodash"

export type BreadcrumbItem = {
  text: string
  to?: {
    name: string
    params?: Record<string, unknown>
  }
  exact?: boolean
}

const BASE_CRUMB: BreadcrumbItem = {
  text: "Dashboard",
  to: {
    name: "DashboardPage",
  },
}

const state = reactive<{
  breadcrumbs: BreadcrumbItem[]
}>({
  breadcrumbs: [],
})

/**
 * This stores a global breadcrumb state.
 */
export function useBreadcrumbs(breadcrumbs: Ref<BreadcrumbItem[]>) {
  watch(
    () => unref(breadcrumbs),
    (newBreadcrumbs) => {
      if (isUndefined(newBreadcrumbs)) return

      state.breadcrumbs = [BASE_CRUMB, ...newBreadcrumbs]
    },
    {
      immediate: true,
      deep: true,
    }
  )

  return {
    ...toRefs(state),
  }
}

export default useBreadcrumbs
