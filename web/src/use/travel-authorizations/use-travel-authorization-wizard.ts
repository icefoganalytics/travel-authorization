import { reactive, toRefs, unref, watch, type Ref } from "vue"
import { isNil } from "lodash"

import wizardApi, {
  type TravelAuthorizationWizardAsShow,
} from "@/api/travel-authorizations/wizard-api"

export { type TravelAuthorizationWizardAsShow }

export function useTravelAuthorizationWizard(
  travelAuthorizationId: Ref<number | null | undefined>
) {
  const state = reactive<{
    travelAuthorization: TravelAuthorizationWizardAsShow | null
    isLoading: boolean
    isErrored: boolean
  }>({
    travelAuthorization: null,
    isLoading: false,
    isErrored: false,
  })

  async function fetch(): Promise<TravelAuthorizationWizardAsShow> {
    const staticTravelAuthorizationId = unref(travelAuthorizationId)
    if (isNil(staticTravelAuthorizationId)) {
      throw new Error("travelAuthorizationId is required")
    }

    state.isLoading = true
    try {
      const { travelAuthorization } = await wizardApi.get(staticTravelAuthorizationId)
      state.isErrored = false
      state.travelAuthorization = travelAuthorization
      return travelAuthorization
    } catch (error) {
      console.error(`Failed to fetch travel authorization wizard: ${error}`, { error })
      state.isErrored = true
      throw error
    } finally {
      state.isLoading = false
    }
  }

  async function save(
    attributes: Partial<TravelAuthorizationWizardAsShow>
  ): Promise<TravelAuthorizationWizardAsShow> {
    const staticTravelAuthorizationId = unref(travelAuthorizationId)
    if (isNil(staticTravelAuthorizationId)) {
      throw new Error("travelAuthorizationId is required")
    }

    state.isLoading = true
    try {
      const { travelAuthorization } = await wizardApi.update(
        staticTravelAuthorizationId,
        attributes
      )
      state.isErrored = false
      state.travelAuthorization = travelAuthorization
      return travelAuthorization
    } catch (error) {
      console.error(`Failed to update travel authorization wizard: ${error}`, { error })
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
    },
    { immediate: true }
  )

  return {
    ...toRefs(state),
    fetch,
    refresh: fetch,
    save,
  }
}

export default useTravelAuthorizationWizard
