<template>
  <v-card>
    <v-card-title>
      <h3>{{ capitalize(stepTitle) }}</h3>
    </v-card-title>
    <v-card-subtitle>{{ stepSubtitle }}</v-card-subtitle>

    <v-card-text>
      <p>You have submitted a travel request and it is awaiting approval from your supervisor.</p>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, nextTick, toRefs } from "vue"

import { capitalize } from "@/utils/formatters"
import travelAuthorizationApi from "@/api/travel-authorizations-api"
import useSnack from "@/use/use-snack"
import useTravelAuthorization, { STATUSES } from "@/use/use-travel-authorization"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
  stepTitle: {
    type: String,
    required: true,
  },
  stepSubtitle: {
    type: String,
    required: true,
  },
})

const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization, isLoading, refresh } = useTravelAuthorization(travelAuthorizationId)
const isApproved = computed(() => travelAuthorization.value.status === STATUSES.APPROVED)
const isTravellingByAir = computed(() => travelAuthorization.value.isTravellingByAir)

async function initialize(context) {
  context.setEditableSteps([])
}

const snack = useSnack()

async function checkForApproval() {
  try {
    await refresh()

    await nextTick()
    if (isApproved.value) {
      snack.info("Travel authorization approved!")
      if (!isTravellingByAir.value) {
        // TODO: consider if this should redirect somewhere else
        // if travel has started.
        return "awaiting-travel-start"
      }

      return true
    }

    snack.warning("Approval has not been reviewed yet.")
    return false
  } catch (error) {
    console.error(`Errored while checking for approval: ${error}`)
    snack.error(`Errored while checking for approval: ${error}`)
    return false
  }
}

async function revertToDraft() {
  isLoading.value = true
  try {
    await travelAuthorizationApi.revertToDraft(props.travelAuthorizationId)
    snack.success("Travel request reverted to draft.")
    return true
  } catch (error) {
    console.error(error)
    snack.error(`Failed to revert to draft: ${error}`)
    return false
  } finally {
    isLoading.value = false
  }
}

defineExpose({
  initialize,
  continue: checkForApproval,
  back: revertToDraft,
})
</script>
