import { computed, reactive, toRefs } from "vue"

import currentUserApi, { USER_ROLES } from "@/api/current-user-api"

/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */
/** @typedef {import('@/api/current-user-api.js').UserDetailedView} UserDetailedView */

// Note that state is global here
const state = reactive({
  currentUser: {
    roles: [],
  },
  isLoading: false,
  isErrored: false,
  isCached: false,
})

/**
 * This stores the global current user state.
 * Does not load current user until fetch is ran; however,
 * fetch is run in App, so currentUser will effectively always be ready in all inner components.
 *
 * @returns {{
 *   ROLES: typeof USER_ROLES,
 *   currentUser: Ref<UserDetailedView>,
 *   isLoading: Ref<boolean>,
 *   isErrored: Ref<boolean>,
 *   isCached: Ref<boolean>,
 *   isReady: Ref<boolean>,
 *   fullName: Ref<string>,
 *   isAdmin: Ref<boolean>,
 *   isPreApprovedTravelAdmin: Ref<boolean>,
 *   fetch: () => Promise<UserDetailedView>,
 *   unset: () => void,
 * }}
 */
export function useCurrentUser() {
  const isReady = computed(() => state.isCached && !state.isLoading && !state.isErrored)

  const fullName = computed(() => {
    const { firstName, lastName } = state.currentUser
    return [firstName, lastName].filter(Boolean).join(" ")
  })
  const isAdmin = computed(() => state.currentUser.roles?.includes(USER_ROLES.ADMIN))
  const isPreApprovedTravelAdmin = computed(() =>
    state.currentUser.roles?.includes(USER_ROLES.PRE_APPROVED_TRAVEL_ADMIN)
  )

  async function fetch() {
    state.isLoading = true
    try {
      const { user } = await currentUserApi.get()
      state.isErrored = false
      state.currentUser = user
      state.isCached = true
      return user
    } catch (error) {
      console.error("Failed to fetch current user:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  function unset() {
    state.currentUser = {
      roles: [],
    }
    state.isLoading = false
    state.isErrored = false
    state.isCached = false
  }

  return {
    ROLES: USER_ROLES,
    // getters
    ...toRefs(state),
    isReady,
    fullName,
    isAdmin,
    isPreApprovedTravelAdmin,
    // actions
    fetch,
    refresh: fetch,
    unset,
  }
}

export default useCurrentUser
