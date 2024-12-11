import { reactive, toRefs, unref, watch } from "vue"
import { isUndefined } from "lodash"

/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */

/**
 * TODO: add other fields
 * @typedef {{
 *   title: string;
 *   to: {
 *     name: string;
 *     params?: Object;
 *   };
 * }} BreadcrumbItem
 */

const BASE_CRUMB = {
  text: "Dashboard",
  to: {
    name: "DashboardPage",
  },
}

const state = reactive({
  breadcrumbs: [],
})

/**
 * This stores a global breadcrumb state.
 *
 * @callback UseBreadcrumbs
 * @param {Ref<BreadcrumbItem[]>} [breadcrumbs]
 * @returns {{
 *   breadcrumbs: Ref<BreadcrumbItem[]>,
 * }}
 */

/** @type {UseBreadcrumbs} */
export function useBreadcrumbs(breadcrumbs) {
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
