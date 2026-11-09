<template>
  <div class="mt-4">
    <v-alert
      v-if="isExpenseClaimTravellerChangesRequested"
      type="warning"
      class="mb-4"
      title="Changes have been requested for your expense claim."
    >
      <template #text>
        <span class="text-pre-wrap">{{
          travelAuthorization?.requestChange ?? "No reason provided."
        }}</span>
      </template>
    </v-alert>
    <v-row>
      <v-col>
        <div class="d-flex justify-space-between align-end">
          <h3>Traveler Expenses</h3>

          <ExpenseCreateDialog
            v-if="hasExpenses"
            :travel-authorization-id="travelAuthorizationId"
            @created="refreshExpenseCreationDependencies"
          />
          <ExpensePrefillDialog
            v-else
            :travel-authorization-id="travelAuthorizationId"
            @created="refreshExpenseCreationDependencies"
          />
        </div>

        <ExpensesEditDataTableServer
          ref="expensesTable"
          :where="expenseWhere"
          route-query-suffix="Expenses"
          @changed="refreshExpenseChangedDependencies"
        />
        * Meals and Incidentals will be calculated by the system; do not add these expenses.
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <h3>Meals and Incidentals</h3>
        <ExpenseClaimSubmitMealsAndIncidentalsDataTableServer
          ref="mealsAndIncidentalsTable"
          :travel-authorization-id="travelAuthorizationId"
        />
      </v-col>
      <v-col>
        <h3>Totals</h3>
        <ExpenseClaimSubmitTotalsCard
          ref="totalsTable"
          :travel-authorization-id="travelAuthorizationId"
          class="bg-white py-4"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <div class="d-flex justify-space-between align-end">
          <h3>Coding</h3>

          <GeneralLedgerCodingWizardCreateDialog
            :travel-authorization-id="travelAuthorizationId"
            @created="refreshCodingsCreatedDependencies"
          />
        </div>

        <GeneralLedgerCodingsEditDataTableServer
          ref="codingsTable"
          :where="codingsWhere"
          route-query-suffix="Codings"
          @changed="refreshCodingsChangedDependencies"
        />
      </v-col>
      <v-col cols="4"></v-col>
    </v-row>
    <v-row class="mt-12">
      <v-col>
        <TravelAuthorizationExpenseApprovalForm
          ref="requestApprovalForm"
          :travel-authorization-id="travelAuthorizationId"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs, useTemplateRef } from "vue"
import { isNil } from "lodash"

import useTravelAuthorization, {
  TravelAuthorizationStatuses,
  TravelAuthorizationWizardStepNames,
} from "@/use/use-travel-authorization"
import useExpenses, { ExpenseTypes, ExpenseExpenseTypes } from "@/use/use-expenses"
import useTravelSegments from "@/use/use-travel-segments"
import { type WizardStepComponentContext } from "@/use/wizards/use-my-travel-request-wizard"

import ExpenseClaimSubmitMealsAndIncidentalsDataTableServer from "@/components/expenses/ExpenseClaimSubmitMealsAndIncidentalsDataTableServer.vue"
import ExpenseClaimSubmitTotalsCard from "@/components/expenses/ExpenseClaimSubmitTotalsCard.vue"
import ExpenseCreateDialog from "@/components/expenses/ExpenseCreateDialog.vue"
import ExpensePrefillDialog from "@/components/expenses/ExpensePrefillDialog.vue"
import ExpensesEditDataTableServer from "@/components/expenses/ExpensesEditDataTableServer.vue"
import GeneralLedgerCodingWizardCreateDialog from "@/components/general-ledger-codings/GeneralLedgerCodingWizardCreateDialog.vue"
import GeneralLedgerCodingsEditDataTableServer from "@/components/general-ledger-codings/GeneralLedgerCodingsEditDataTableServer.vue"
import TravelAuthorizationExpenseApprovalForm from "@/components/travel-authorizations/expenses/TravelAuthorizationExpenseApprovalForm.vue"

const props = defineProps<{
  travelAuthorizationId: number
}>()

const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization } = useTravelAuthorization(travelAuthorizationId)
const isExpenseClaimTravellerChangesRequested = computed(
  () =>
    travelAuthorization.value?.status ===
    TravelAuthorizationStatuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED
)

const expenseWhere = computed(() => ({
  travelAuthorizationId: props.travelAuthorizationId,
  expenseType: [ExpenseExpenseTypes.ACCOMMODATIONS, ExpenseExpenseTypes.TRANSPORTATION],
}))

const codingsWhere = computed(() => ({
  travelAuthorizationId: props.travelAuthorizationId,
}))

const expenseOptions = computed(() => ({
  where: {
    travelAuthorizationId: props.travelAuthorizationId,
    type: ExpenseTypes.EXPENSE,
  },
  perPage: 1, // only 1 record to get total count
}))
const { totalCount, isLoading, refresh } = useExpenses(expenseOptions)
const hasExpenses = computed(() => isLoading.value === false && totalCount.value > 0)

const expensesTable = useTemplateRef("expensesTable")
const mealsAndIncidentalsTable = useTemplateRef("mealsAndIncidentalsTable")
const totalsTable = useTemplateRef("totalsTable")
const codingsTable = useTemplateRef("codingsTable")
const requestApprovalForm = useTemplateRef("requestApprovalForm")

async function refreshExpenseCreationDependencies() {
  await Promise.all([
    refresh(),
    expensesTable.value?.refresh(),
    mealsAndIncidentalsTable.value?.refresh(),
    totalsTable.value?.refresh(),
    requestApprovalForm.value?.refresh(),
  ])
}

async function refreshExpenseChangedDependencies() {
  await Promise.all([totalsTable.value?.refresh(), requestApprovalForm.value?.refresh()])
}

async function refreshCodingsCreatedDependencies() {
  await Promise.all([codingsTable.value?.refresh(), requestApprovalForm.value?.refresh()])
}

async function refreshCodingsChangedDependencies() {
  await requestApprovalForm.value?.refresh()
}

const travelSegmentsQuery = computed(() => ({
  where: {
    travelAuthorizationId: props.travelAuthorizationId,
    isActual: true,
  },
}))
const { travelSegments, isReady: isReadyTravelSegments } = useTravelSegments(travelSegmentsQuery)

async function initialize(context: WizardStepComponentContext) {
  context.setEditableSteps([TravelAuthorizationWizardStepNames.CONFIRM_ACTUAL_TRAVEL_DETAILS])

  await isReadyTravelSegments()
  const lastTravelSegment = travelSegments.value.at(-1)
  if (isNil(lastTravelSegment)) return

  const { departureOn } = lastTravelSegment
  if (isNil(departureOn)) return

  const isAfterTravelEndDate = new Date(departureOn) < new Date()
  if (isAfterTravelEndDate) {
    context.setContinueButtonProps({
      enabled: true,
    })
  }
}

// TODO: split submission step into its own page
// Submit should not become enabled until there are more than zero "Coding" rows,
// and all expenses have an associated upload/receipt.
defineExpose({
  initialize,
  continue: () => requestApprovalForm.value?.submit(),
})
</script>
