<template>
  <v-form
    ref="form"
    :loading="isLoading"
  >
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <UserEmailSearchableCombobox
          v-model="travelAuthorization.supervisorEmail"
          :rules="[required]"
          label="Submit to"
          dense
          outlined
          required
          background-color="white"
        />
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
import { ref, computed } from "vue"

import { required } from "@/utils/validators"

import travelAuthorizationsApi from "@/api/travel-authorizations-api"
import useExpenses, { TYPES, EXPENSE_TYPES } from "@/use/use-expenses"
import useGeneralLedgerCodings from "@/use/use-general-ledger-codings"
import useSnack from "@/use/use-snack"
import useTravelAuthorization from "@/use/use-travel-authorization"

import UserEmailSearchableCombobox from "@/components/users/UserEmailSearchableCombobox.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const form = ref(null)
const snack = useSnack()

const {
  travelAuthorization,
  isLoading: isLoadingTravelAuthorization,
  refresh: refreshTravelAuthorization,
} = useTravelAuthorization(props.travelAuthorizationId)

const generalLedgerCodingOptions = computed(() => ({
  where: {
    travelAuthorizationId: props.travelAuthorizationId,
  },
}))
const {
  generalLedgerCodings,
  isLoading: isLoadingGeneralLedgerCodings,
  refresh: refreshGeneralLedgerCodings,
} = useGeneralLedgerCodings(generalLedgerCodingOptions)

const expenseOptions = computed(() => ({
  where: {
    travelAuthorizationId: props.travelAuthorizationId,
    type: TYPES.EXPENSE,
  },
}))
const {
  expenses,
  isLoading: isLoadingExpenses,
  refresh: refreshExpenses,
} = useExpenses(expenseOptions)

const isLoading = computed(
  () =>
    isLoadingTravelAuthorization.value ||
    isLoadingGeneralLedgerCodings.value ||
    isLoadingExpenses.value
)

const hasGeneralLedgerCodings = computed(() => generalLedgerCodings.value.length > 0)
const allRelevantExpensesHaveReceipts = computed(() =>
  expenses.value
    .filter((expense) => expense.expenseType !== EXPENSE_TYPES.MEALS_AND_INCIDENTALS)
    .every((expense) => expense.fileSize > 0)
)
// TODO: instead of multiple checks here, consider using 1 page per check
const isReadyToSubmit = computed(
  () => hasGeneralLedgerCodings.value && allRelevantExpensesHaveReceipts.value
)

async function refresh() {
  await Promise.all([
    await refreshTravelAuthorization(),
    await refreshGeneralLedgerCodings(),
    await refreshExpenses(),
  ])
}

async function requestApprovalForExpenseClaim() {
  if (!isReadyToSubmit.value) {
    snack.error(
      `Cannot submit expense claim until there are more than zero "Coding" rows, and all expenses have an associated upload/receipt.`
    )
    return false
  }

  isLoadingTravelAuthorization.isLoading = true
  try {
    const { travelAuthorization } = await travelAuthorizationsApi.expenseClaim(
      props.travelAuthorizationId,
      {
        supervisorEmail: travelAuthorization.value.supervisorEmail,
      }
    )
    isLoadingTravelAuthorization.value = false
    snack.success("Expense claim submitted for approval.")
    return true
  } catch (error) {
    console.error(`Failed to submit expense claim for travel authorization: ${error}`, { error })
    snack.error(`Failed to submit expense claim: ${error}`)
    return false
  } finally {
    isLoadingTravelAuthorization.isLoading = false
  }
}

defineExpose({
  refresh,
  submit: requestApprovalForExpenseClaim,
})
</script>
