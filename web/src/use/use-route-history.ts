import { computed, reactive, toRefs, type Ref } from "vue"
import { type RouteLocationNormalized } from "vue-router"

const MAX_ENTRIES = 10

const state = reactive<{
  routes: RouteLocationNormalized[]
}>({
  routes: [],
})

export function useRouteHistory(): {
  routes: Ref<RouteLocationNormalized[]>
  previousRoute: Ref<RouteLocationNormalized | undefined>
  add: (route: RouteLocationNormalized) => void
} {
  const previousRoute = computed(() => state.routes[state.routes.length - 1])

  function add(route: RouteLocationNormalized) {
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
