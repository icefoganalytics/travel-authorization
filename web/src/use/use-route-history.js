import { computed, reactive, toRefs } from "vue"

/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */
/** @typedef {import('vue-router').Route} Route */

const MAX_ENTRIES = 10

/**
 * @type {{
 *   routes: Route[]
 * }}
 */
const state = reactive({
  routes: [],
})

/**
 * This stores a global breadcrumb state.
 *
 * @callback UseRouteHistory
 * @returns {{
 *   routes: Ref<Route[]>,
 *   previousRoute: Ref<Route | undefined>,
 *   add: (route: Route) => void,
 * }}
 */

/** @type {UseRouteHistory} */
export function useRouteHistory() {
  const previousRoute = computed(() => state.routes[state.routes.length - 1])

  function add(route) {
    state.routes.push(route)
    if (state.routes.length > MAX_ENTRIES) {
      state.routes.shift()
    }
  }

  return {
    ...toRefs(state),
    add,
    previousRoute,
  }
}

export default useRouteHistory
