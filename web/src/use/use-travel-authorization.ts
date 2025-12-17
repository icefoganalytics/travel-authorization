import { computed, reactive, toRefs, unref, watch, type Ref } from "vue"
import { isNil } from "lodash"

import type { Policy } from "@/api/base-api"
import { ExpenseTypes } from "@/api/expenses-api"
import travelAuthorizationsApi, {
  STATUSES,
  TRAVEL_AUTHORIZATION_WIZARD_STEP_NAMES,
  TravelAuthorizationStatuses,
  TravelAuthorizationTripTypes,
  TravelAuthorizationWizardStepNames,
  TRIP_TYPES,
  type TravelAuthorizationAsShow,
  type TravelAuthorizationCreationAttributes,
} from "@/api/travel-authorizations-api"

export {
  type TravelAuthorizationAsShow,
  TravelAuthorizationStatuses,
  TravelAuthorizationTripTypes,
  TravelAuthorizationWizardStepNames,
  STATUSES,
  TRIP_TYPES,
  TRAVEL_AUTHORIZATION_WIZARD_STEP_NAMES,
}

export function useTravelAuthorization(travelAuthorizationId: Ref<number | null | undefined>) {
  const state = reactive<{
    travelAuthorization: TravelAuthorizationAsShow | null
    policy: Policy | null
    isLoading: boolean
    isErrored: boolean
    isInitialized: boolean
  }>({
    travelAuthorization: null,
    policy: null,
    isLoading: false,
    isErrored: false,
    isInitialized: false,
  })

  async function fetch(params = {}) {
    const staticTravelAuthorizationId = unref(travelAuthorizationId)
    if (isNil(staticTravelAuthorizationId)) {
      throw new Error("travelAuthorizationId is required")
    }

    state.isLoading = true
    try {
      const { travelAuthorization, policy } = await travelAuthorizationsApi.get(
        staticTravelAuthorizationId,
        params
      )
      state.policy = policy
      state.isErrored = false
      state.travelAuthorization = travelAuthorization
      return travelAuthorization
    } catch (error) {
      console.error(`Failed to fetch travel authorization: ${error}`, { error })
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  async function save(
    attributes: TravelAuthorizationCreationAttributes | null = state.travelAuthorization
  ) {
    state.isLoading = true
    try {
      return saveSilently(attributes)
    } finally {
      state.isLoading = false
    }
  }

  async function saveSilently(
    attributes: TravelAuthorizationCreationAttributes | null = state.travelAuthorization
  ) {
    const staticTravelAuthorizationId = unref(travelAuthorizationId)
    if (isNil(staticTravelAuthorizationId)) {
      throw new Error("travelAuthorizationId is required")
    }

    try {
      const { travelAuthorization } = await travelAuthorizationsApi.update(
        staticTravelAuthorizationId,
        {
          ...attributes,
        }
      )
      state.isErrored = false
      state.travelAuthorization = travelAuthorization
      return travelAuthorization
    } catch (error) {
      console.error(`Failed to update travel authorization: ${error}`, { error })
      state.isErrored = true
      throw error
    }
  }

  // Stateful actions
  /** @deprecated - prefer inline api calls for state changes */
  async function submit(
    attributes: TravelAuthorizationCreationAttributes | null = state.travelAuthorization
  ) {
    const staticTravelAuthorizationId = unref(travelAuthorizationId)
    if (isNil(staticTravelAuthorizationId)) {
      throw new Error("travelAuthorizationId is required")
    }

    state.isLoading = true
    try {
      const { travelAuthorization } = await travelAuthorizationsApi.submit(
        staticTravelAuthorizationId,
        {
          ...attributes,
        }
      )
      state.isErrored = false
      state.travelAuthorization = travelAuthorization
      return travelAuthorization
    } catch (error) {
      console.error(`Failed to submit travel authorization: ${error}`, { error })
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  /** @deprecated - prefer inline api calls for state changes */
  async function approve() {
    const staticTravelAuthorizationId = unref(travelAuthorizationId)
    if (isNil(staticTravelAuthorizationId)) {
      throw new Error("travelAuthorizationId is required")
    }

    state.isLoading = true
    try {
      const { travelAuthorization } = await travelAuthorizationsApi.approve(
        staticTravelAuthorizationId
      )
      state.isErrored = false
      state.travelAuthorization = travelAuthorization
      return travelAuthorization
    } catch (error) {
      console.error(`Failed to approve for travel authorization: ${error}`, { error })
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  /** @deprecated - prefer inline api calls for state changes */
  async function deny({
    denialReason,
  }: { denialReason?: string } = {}): Promise<TravelAuthorizationAsShow> {
    const staticTravelAuthorizationId = unref(travelAuthorizationId)
    if (isNil(staticTravelAuthorizationId)) {
      throw new Error("travelAuthorizationId is required")
    }

    state.isLoading = true
    try {
      const { travelAuthorization } = await travelAuthorizationsApi.deny(
        staticTravelAuthorizationId,
        { denialReason }
      )
      state.isErrored = false
      state.travelAuthorization = travelAuthorization
      return travelAuthorization
    } catch (error) {
      console.error(`Failed to deny for travel authorization: ${error}`, { error })
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

      await fetch()
      state.isInitialized = true
    },
    { immediate: true }
  )

  async function isReady() {
    return new Promise((resolve) => {
      if (state.isInitialized) {
        resolve(true)
      } else {
        const interval = setInterval(() => {
          if (state.isErrored) {
            clearInterval(interval)
            resolve(false)
          } else if (state.isInitialized && !state.isLoading) {
            clearInterval(interval)
            resolve(true)
          }
        }, 10)
      }
    })
  }

  const estimates = computed(() =>
    state.travelAuthorization?.expenses?.filter((expense) => expense.type === ExpenseTypes.ESTIMATE)
  )
  const stops = computed(() => state.travelAuthorization?.stops)

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
    isReady,
    // stateful action
    submit,
    approve,
    deny,
  }
}

export default useTravelAuthorization
