import { reactive, toRefs, toValue, watch, type MaybeRefOrGetter } from "vue"
import { isUndefined } from "lodash"

export type BreadcrumbItem = {
  title: string
  to?: {
    name: string
    params?: Record<string, unknown>
  }
  exact?: boolean
}

const BASE_CRUMB: BreadcrumbItem = {
  title: "Dashboard",
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
export function useBreadcrumbs(breadcrumbs: MaybeRefOrGetter<BreadcrumbItem[]>) {
  watch(
    () => toValue(breadcrumbs),
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
