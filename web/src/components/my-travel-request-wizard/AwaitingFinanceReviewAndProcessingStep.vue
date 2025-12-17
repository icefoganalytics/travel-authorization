<template>
  <v-card>
    <v-card-title>
      <h3>{{ capitalize(stepTitle) }}</h3>
    </v-card-title>
    <v-card-subtitle>{{ stepSubtitle }}</v-card-subtitle>

    <v-card-text>
      <p>
        Your supervisor has approved the expense claim. It is now awaiting review and processing by
        the finance team.
      </p>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, nextTick, toRefs } from "vue"

import { capitalize } from "@/utils/formatters"

import useSnack from "@/use/use-snack"
import useTravelAuthorization, { TravelAuthorizationStatuses } from "@/use/use-travel-authorization"
import { type WizardStepComponentContext } from "@/use/wizards/use-my-travel-request-wizard"

const props = defineProps<{
  travelAuthorizationId: number
  stepTitle: string
  stepSubtitle: string
}>()

const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization, refresh } = useTravelAuthorization(travelAuthorizationId)
const isExpensed = computed(
  () => travelAuthorization.value?.status === TravelAuthorizationStatuses.EXPENSED
)

async function initialize(context: WizardStepComponentContext) {
  context.setEditableSteps([])
}

const snack = useSnack()

async function checkForFinanceProcessing() {
  try {
    await refresh()

    await nextTick()
    if (isExpensed.value) {
      snack.info("Finance has processed your expense claim!")

      return true
    }

    snack.warning("Expense claim has not been processed by finance yet.")
    return false
  } catch (error) {
    console.error(`Errored while checking for finance processing: ${error}`, { error })
    snack.error(`Errored while checking for finance processing: ${error}`)
    return false
  }
}

defineExpose({
  initialize,
  continue: checkForFinanceProcessing,
})
</script>
