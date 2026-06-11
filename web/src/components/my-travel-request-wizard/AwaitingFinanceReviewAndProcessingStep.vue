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
import { toRefs } from "vue"

import { capitalize } from "@/utils/formatters"

import useSnack from "@/use/use-snack"
import useTravelAuthorization, {
  TravelAuthorizationWizardStepNames,
} from "@/use/use-travel-authorization"
import { type WizardStepComponentContext } from "@/use/wizards/use-my-travel-request-wizard"

const props = defineProps<{
  travelAuthorizationId: number
  stepTitle: string
  stepSubtitle: string
}>()

const { travelAuthorizationId } = toRefs(props)
const { refresh } = useTravelAuthorization(travelAuthorizationId)

async function initialize(context: WizardStepComponentContext) {
  context.setEditableSteps([])
}

const snack = useSnack()

async function checkForFinanceProcessing() {
  try {
    const { wizardStepName } = await refresh()

    if (
      wizardStepName === TravelAuthorizationWizardStepNames.AWAITING_FINANCE_REVIEW_AND_PROCESSING
    ) {
      snack.warning("Expense claim has not been processed by finance yet.")
      return false
    }

    if (wizardStepName === TravelAuthorizationWizardStepNames.REVIEW_EXPENSES) {
      snack.info("Finance has processed your expense claim!")
    } else if (wizardStepName === TravelAuthorizationWizardStepNames.SUBMIT_EXPENSES) {
      snack.warning("Finance has requested changes to your expense claim.")
    } else if (
      wizardStepName === TravelAuthorizationWizardStepNames.AWAITING_EXPENSE_CLAIM_APPROVAL
    ) {
      snack.warning("Finance has sent your expense claim back to your supervisor for changes.")
    }

    return wizardStepName
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
