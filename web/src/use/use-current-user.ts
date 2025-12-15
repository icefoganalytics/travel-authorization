import { computed, reactive, toRefs } from "vue"
import { isNil } from "lodash"

import currentUserApi, { type UserDetailedView, UserRoles } from "@/api/current-user-api"

export { type UserDetailedView, UserRoles }

// Global state
const state = reactive<{
  currentUser: UserDetailedView | null
  isLoading: boolean
  isErrored: boolean
  isCached: boolean
}>({
  currentUser: null,
  isLoading: false,
  isErrored: false,
  isCached: false,
})

type State = typeof state
type LoadedState = Omit<State, "currentUser"> & {
  currentUser: Exclude<State["currentUser"], null>
}

/**
 * This stores the global current user state.
 * Does not load current user until fetch is ran; however,
 * fetch is run in App, so currentUser will effectively always be ready in all inner components.
 */
export function useCurrentUser<IsLoaded extends boolean = false>() {
  type StateOrLoadedState = IsLoaded extends true ? LoadedState : State

  const isReady = computed(() => state.isCached && !state.isLoading && !state.isErrored)

  const fullName = computed(() => {
    if (isNil(state.currentUser)) {
      return ""
    }

    const { firstName, lastName } = state.currentUser
    return [firstName, lastName].filter(Boolean).join(" ")
  })
  const isAdmin = computed(() => state.currentUser?.roles?.includes(UserRoles.ADMIN))
  const isDepartmentAdmin = computed(() =>
    state.currentUser?.roles?.includes(UserRoles.DEPARTMENT_ADMIN)
  )
  const isFinanceUser = computed(() => state.currentUser?.roles?.includes(UserRoles.FINANCE_USER))
  const isPreApprovedTravelAdmin = computed(() =>
    state.currentUser?.roles?.includes(UserRoles.PRE_APPROVED_TRAVEL_ADMIN)
  )
  const isTravelDeskUser = computed(() =>
    state.currentUser?.roles?.includes(UserRoles.TRAVEL_DESK_USER)
  )

  async function fetch(): Promise<UserDetailedView> {
    state.isLoading = true
    try {
      const { user } = await currentUserApi.get()
      state.isErrored = false
      state.currentUser = user
      state.isCached = true
      return user
    } catch (error) {
      console.error(`Failed to fetch current user: ${error}`, error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  function reset() {
    state.currentUser = null
    state.isLoading = false
    state.isErrored = false
    state.isCached = false
  }

  return {
    ...toRefs(state as StateOrLoadedState),
    isReady,
    fetch,
    refresh: fetch,
    reset,
    // helpers
    fullName,
    isAdmin,
    isDepartmentAdmin,
    isFinanceUser,
    isPreApprovedTravelAdmin,
    isTravelDeskUser,
  }
}

export default useCurrentUser
