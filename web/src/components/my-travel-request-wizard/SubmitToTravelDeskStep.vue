<template>
  <v-skeleton-loader
    v-if="isNil(travelDeskTravelRequestId)"
    type="card"
  />
  <TravelDeskTravelRequestEditCard
    v-else
    ref="travelDeskTravelRequestEditCard"
    :travel-desk-travel-request-id="travelDeskTravelRequestId"
  />
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue"
import { isNil } from "lodash"

import useSnack from "@/use/use-snack"

import travelDeskTravelRequestsApi from "@/api/travel-desk-travel-requests-api"

import { type WizardStepComponentContext } from "@/use/wizards/use-my-travel-request-wizard"
import useTravelAuthorization, {
  TravelAuthorizationWizardStepNames,
} from "@/use/use-travel-authorization"

import TravelDeskTravelRequestEditCard from "@/components/travel-desk-travel-requests/TravelDeskTravelRequestEditCard.vue"

const props = defineProps<{
  travelAuthorizationId: number
}>()

const emit = defineEmits<{
  (event: "updated", travelAuthorizationId: number): void
}>()

const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization } = useTravelAuthorization(travelAuthorizationId)

const travelDeskTravelRequestId = computed(() => {
  return travelAuthorization.value?.travelDeskTravelRequest?.id
})

async function initialize(context: WizardStepComponentContext) {
  context.setEditableSteps([TravelAuthorizationWizardStepNames.EDIT_TRAVELLER_DETAILS])
}

const snack = useSnack()

async function submitAndNotify() {
  if (isNil(travelDeskTravelRequestId.value)) return

  try {
    await travelDeskTravelRequestsApi.submit(travelDeskTravelRequestId.value)
    emit("updated", travelAuthorizationId.value)
    snack.success("Request submitted.")
    return true
  } catch (error) {
    console.error("Failed to submit travel desk travel request:", error)
    snack.error(`Failed to submit request: ${error}`)
    return false
  }
}

defineExpose({
  initialize,
  continue: submitAndNotify,
})
</script>
