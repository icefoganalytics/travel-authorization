import { computed, reactive, toRefs, unref, watch } from "vue"
import { isNil } from "lodash"

import { TYPES as EXPENSE_TYPES } from "@/api/expenses-api"
import travelAuthorizationsApi, { STATUSES, TRIP_TYPES } from "@/api/travel-authorizations-api"

export { STATUSES, TRIP_TYPES }

/**
 * @template [T=any]
 * @typedef {import('vue').Ref<T>} Ref
 */
/** @typedef {import('@/api/travel-authorizations-api.js').TravelAuthorization} TravelAuthorization */

/**
 * Provides reactive state for a travel authorization.
 *
 * @callback UseTravelAuthorization
 * @param {Ref<string | number>} [travelAuthorizationId]
 * @returns {{
 *   travelAuthorization: Ref<TravelAuthorization>,
 *   isLoading: Ref<boolean>,
 *   isErrored: Ref<boolean>,
 *   stops: Ref<Stop[]>,
 *   fetch: () => Promise<TravelAuthorization>,
 *   refresh: () => Promise<TravelAuthorization>,
 *   save: () => Promise<TravelAuthorization>, // save that triggers loading state
 *   saveSilently: () => Promise<TravelAuthorization>, // save that does not trigger loading state
 *   approve: () => Promise<TravelAuthorization>,
 *   deny: ({ denialReason: string } = {}) => Promise<TravelAuthorization>,
 * }}
 */

/** @type {UseTravelAuthorization} */
export function useTravelAuthorization(travelAuthorizationId) {
  const state = reactive({
    travelAuthorization: {
      expenses: [],
      purpose: {},
      stops: [],
      travelSegments: [],
      user: {},
    },
    policy: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(params = {}) {
    state.isLoading = true
    try {
      const { travelAuthorization, policy } = await travelAuthorizationsApi.get(
        unref(travelAuthorizationId),
        params
      )
      state.policy = policy
      state.isErrored = false
      state.travelAuthorization = travelAuthorization
      return travelAuthorization
    } catch (error) {
      console.error("Failed to fetch travel authorization:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  async function save(attributes = state.travelAuthorization) {
    state.isLoading = true
    try {
      return saveSilently(attributes)
    } finally {
      state.isLoading = false
    }
  }

  async function saveSilently(attributes = state.travelAuthorization) {
    try {
      const { travelAuthorization } = await travelAuthorizationsApi.update(
        unref(travelAuthorizationId),
        {
          ...attributes,
        }
      )
      state.isErrored = false
      state.travelAuthorization = travelAuthorization
      return travelAuthorization
    } catch (error) {
      console.error("Failed to update travel authorization:", error)
      state.isErrored = true
      throw error
    }
  }

  // DEPRECATED: prefer inline api calls for state changes.
  // Stateful actions
  async function submit(attributes = state.travelAuthorization) {
    state.isLoading = true
    try {
      const { travelAuthorization } = await travelAuthorizationsApi.submit(
        unref(travelAuthorizationId),
        {
          ...attributes,
        }
      )
      state.isErrored = false
      state.travelAuthorization = travelAuthorization
      return travelAuthorization
    } catch (error) {
      console.error("Failed to submit travel authorization:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  async function approve() {
    state.isLoading = true
    try {
      const { travelAuthorization } = await travelAuthorizationsApi.approve(
        unref(travelAuthorizationId)
      )
      state.isErrored = false
      state.travelAuthorization = travelAuthorization
      return travelAuthorization
    } catch (error) {
      console.error("Failed to approve for travel authorization:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  async function deny({ denialReason } = {}) {
    state.isLoading = true
    try {
      const { travelAuthorization } = await travelAuthorizationsApi.deny(
        unref(travelAuthorizationId),
        { denialReason }
      )
      state.isErrored = false
      state.travelAuthorization = travelAuthorization
      return travelAuthorization
    } catch (error) {
      console.error("Failed to deny for travel authorization:", error)
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  watch(
    () => unref(travelAuthorizationId),
    async (newTravelAuthorizationId) => {
      if (isNil(newTravelAuthorizationId)) return
      // TODO: add some tests and check whether I should abort on loading
      // to avoid infinite loops
      // if (state.isLoading === true) return

      await fetch()
    },
    { immediate: true }
  )

  const estimates = computed(() =>
    state.travelAuthorization.expenses?.filter((expense) => expense.type === EXPENSE_TYPES.ESTIMATE)
  )
  const stops = computed(() => state.travelAuthorization.stops)

  return {
    STATUSES,
    ...toRefs(state),
    // computed attributes
    estimates,
    stops,
    // methods
    fetch,
    refresh: fetch,
    save,
    saveSilently,
    // stateful action
    submit,
    approve,
    deny,
  }
}

export default useTravelAuthorization
