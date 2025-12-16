<template>
  <v-card>
    <v-card-title>
      <h3>{{ capitalize(stepTitle) }}</h3>
    </v-card-title>
    <v-card-subtitle>{{ stepSubtitle }}</v-card-subtitle>

    <v-card-text>
      <p>You have submitted an expense claim, and it is awaiting approval from your supervisor.</p>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, nextTick, toRefs } from "vue"

import { capitalize } from "@/utils/formatters"

import useSnack from "@/use/use-snack"
import useTravelAuthorization, { TravelAuthorizationStatuses } from "@/use/use-travel-authorization"

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
const { travelAuthorization, refresh } = useTravelAuthorization(travelAuthorizationId)
const isAwaitingFinanceReview = computed(
  () => travelAuthorization.value.status === TravelAuthorizationStatuses.EXPENSE_CLAIM_APPROVED
)

async function initialize(context) {
  context.setEditableSteps([])
}

const snack = useSnack()

async function checkForApproval() {
  try {
    await refresh()

    await nextTick()
    if (isAwaitingFinanceReview.value) {
      snack.info("Expense claim approved by supervisor! Awaiting finance review.")

      return true
    }

    snack.warning("Expense claim has not been approved yet.")
    return false
  } catch (error) {
    console.error(`Errored while checking for approval: ${error}`, { error })
    snack.error(`Errored while checking for approval: ${error}`)
    return false
  }
}

defineExpose({
  initialize,
  continue: checkForApproval,
})
</script>
