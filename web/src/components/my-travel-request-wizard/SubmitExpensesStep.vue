<template>
  <div class="mt-4">
    <v-row>
      <v-col>
        <div class="d-flex justify-space-between align-end">
          <h3>Traveler Expenses</h3>

          <ExpenseCreateDialog
            v-if="hasExpenses"
            :form-id="travelAuthorizationId"
            @created="refreshExpenseCreationDependencies"
          />
          <ExpensePrefillDialog
            v-else
            :travel-authorization-id="travelAuthorizationId"
            @created="refreshExpenseCreationDependencies"
          />
        </div>

        <ExpensesEditDataTable
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
        <MealsAndIncidentalsTable
          ref="mealsAndIncidentalsTable"
          :travel-authorization-id="travelAuthorizationId"
        />
      </v-col>
      <v-col>
        <h3>Totals</h3>
        <TotalsTable
          ref="totalsTable"
          :travel-authorization-id="travelAuthorizationId"
          class="white"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <div class="d-flex justify-space-between align-end">
          <h3>Coding</h3>

          <GeneralLedgerCodingCreateDialog
            :travel-authorization-id="travelAuthorizationId"
            @created="refreshCodingsCreatedDependencies"
          />
        </div>

        <GeneralLedgerCodingsTable
          ref="codingsTable"
          :travel-authorization-id="travelAuthorizationId"
          @changed="refreshCodingsChangedDependencies"
        />
      </v-col>
      <v-col cols="4"></v-col>
    </v-row>
    <v-row class="mt-12">
      <v-col>
        <RequestApprovalForm
          ref="requestApprovalForm"
          :travel-authorization-id="travelAuthorizationId"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, ref } from "vue"
import { isNil } from "lodash"

import { TRAVEL_AUTHORIZATION_WIZARD_STEP_NAMES } from "@/api/travel-authorizations-api"

import useExpenses, { ExpenseTypes, ExpenseExpenseTypes } from "@/use/use-expenses"
import useTravelSegments from "@/use/use-travel-segments"

import ExpenseCreateDialog from "@/modules/travel-authorizations/components/edit-my-travel-authorization-expense-page/ExpenseCreateDialog.vue"
import ExpensePrefillDialog from "@/modules/travel-authorizations/components/edit-my-travel-authorization-expense-page/ExpensePrefillDialog.vue"
import ExpensesEditDataTable from "@/components/expenses/ExpensesEditDataTable.vue"
import GeneralLedgerCodingCreateDialog from "@/modules/travel-authorizations/components/edit-my-travel-authorization-expense-page/GeneralLedgerCodingCreateDialog.vue"
import GeneralLedgerCodingsTable from "@/modules/travel-authorizations/components/edit-my-travel-authorization-expense-page/GeneralLedgerCodingsTable.vue"
import MealsAndIncidentalsTable from "@/modules/travel-authorizations/components/edit-my-travel-authorization-expense-page/MealsAndIncidentalsTable.vue"
import RequestApprovalForm from "@/modules/travel-authorizations/components/edit-my-travel-authorization-expense-page/RequestApprovalForm.vue"
import TotalsTable from "@/modules/travel-authorizations/components/edit-my-travel-authorization-expense-page/TotalsTable.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const expenseWhere = computed(() => ({
  travelAuthorizationId: props.travelAuthorizationId,
  expenseType: [ExpenseExpenseTypes.ACCOMMODATIONS, ExpenseExpenseTypes.TRANSPORTATION],
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

/** @type {import("vue").Ref<InstanceType<typeof ExpensesEditDataTable> | null>} */
const expensesTable = ref(null)
/** @type {import("vue").Ref<InstanceType<typeof MealsAndIncidentalsTable> | null>} */
const mealsAndIncidentalsTable = ref(null)
/** @type {import("vue").Ref<InstanceType<typeof TotalsTable> | null>} */
const totalsTable = ref(null)
/** @type {import("vue").Ref<InstanceType<typeof GeneralLedgerCodingsTable> | null>} */
const codingsTable = ref(null)
/** @type {import("vue").Ref<InstanceType<typeof RequestApprovalForm> | null>} */
const requestApprovalForm = ref(null)

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

async function initialize(context) {
  context.setEditableSteps([TRAVEL_AUTHORIZATION_WIZARD_STEP_NAMES.CONFIRM_ACTUAL_TRAVEL_DETAILS])

  await isReadyTravelSegments()
  const lastTravelSegment = travelSegments.value.at(-1)
  if (isNil(lastTravelSegment)) return

  const isAfterTravelEndDate = new Date(lastTravelSegment.departureOn) < new Date()
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
