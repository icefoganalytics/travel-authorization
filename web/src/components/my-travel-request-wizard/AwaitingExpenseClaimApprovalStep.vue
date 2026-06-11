<template>
  <v-card>
    <v-card-title>
      <h3>{{ capitalize(stepTitle) }}</h3>
    </v-card-title>
    <v-card-subtitle>{{ stepSubtitle }}</v-card-subtitle>

    <v-card-text>
      <p v-if="isExpenseClaimSupervisorChangesRequested">
        Finance has requested changes from your supervisor. Awaiting supervisor re-approval.
      </p>
      <p v-else>
        You have submitted an expense claim, and it is awaiting approval from your supervisor.
      </p>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, toRefs } from "vue"

import { capitalize } from "@/utils/formatters"

import useSnack from "@/use/use-snack"
import useTravelAuthorization, {
  TravelAuthorizationStatuses,
  TravelAuthorizationWizardStepNames,
} from "@/use/use-travel-authorization"
import { type WizardStepComponentContext } from "@/use/wizards/use-my-travel-request-wizard"

const props = defineProps<{
  travelAuthorizationId: number
  stepTitle: string
  stepSubtitle: string
}>()

const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization, refresh } = useTravelAuthorization(travelAuthorizationId)
const isExpenseClaimSupervisorChangesRequested = computed(
  () =>
    travelAuthorization.value?.status ===
    TravelAuthorizationStatuses.EXPENSE_CLAIM_SUPERVISOR_CHANGES_REQUESTED
)

async function initialize(context: WizardStepComponentContext) {
  context.setEditableSteps([])
}

const snack = useSnack()

async function checkForApproval() {
  try {
    const { wizardStepName } = await refresh()

    if (wizardStepName === TravelAuthorizationWizardStepNames.AWAITING_EXPENSE_CLAIM_APPROVAL) {
      snack.warning("Expense claim has not been approved yet.")
      return false
    }

    if (
      wizardStepName === TravelAuthorizationWizardStepNames.AWAITING_FINANCE_REVIEW_AND_PROCESSING
    ) {
      snack.info("Expense claim approved by supervisor! Awaiting finance review.")
    } else if (wizardStepName === TravelAuthorizationWizardStepNames.SUBMIT_EXPENSES) {
      snack.warning("Your supervisor has requested changes to your expense claim.")
    }

    return wizardStepName
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
