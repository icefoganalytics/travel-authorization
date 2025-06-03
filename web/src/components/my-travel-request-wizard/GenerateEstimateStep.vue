<template>
  <div class="mt-4">
    <div class="d-flex justify-end">
      <EstimateCreateDialog
        v-if="hasEstimates"
        :loading="isLoading"
        :travel-authorization-id="travelAuthorizationId"
        @created="refreshEstimatesAndTable"
      />
      <EstimateGenerateDialog
        v-else
        :loading="isLoading"
        :travel-authorization-id="travelAuthorizationId"
        @created="refreshEstimatesAndTable"
      />
    </div>

    <EstimatesEditDataTable
      ref="estimatesTable"
      :where="estimatesWhere"
      @updated="expensesRefresh"
      @click:estimate-edit="clickedEditEstimateCallback"
    />

    <EstimateEditDialog
      ref="estimateEditDialog"
      :travel-authorization-id="travelAuthorizationId"
      @updated="refreshEstimatesAndTable"
    />
  </div>
</template>

<script setup>
import { computed, ref } from "vue"

import { useSnack } from "@/plugins/snack-plugin"
import useExpenses, { TYPES as EXPENSE_TYPES } from "@/use/use-expenses"

import EstimateCreateDialog from "@/components/expenses/EstimateCreateDialog.vue"
import EstimateGenerateDialog from "@/components/expenses/EstimateGenerateDialog.vue"
import EstimatesEditDataTable from "@/components/expenses/EstimatesEditDataTable.vue"
import EstimateEditDialog from "@/components/expenses/EstimateEditDialog.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const estimatesWhere = computed(() => ({
  travelAuthorizationId: props.travelAuthorizationId,
}))

const expensesQuery = computed(() => ({
  where: {
    travelAuthorizationId: props.travelAuthorizationId,
    type: EXPENSE_TYPES.ESTIMATE,
  },
  perPage: 1, // only need 1 estimate to determine if there are any
}))
const { totalCount, isLoading, refresh: expensesRefresh } = useExpenses(expensesQuery)
const hasEstimates = computed(() => totalCount.value > 0)

/** @type {import("vue").Ref<InstanceType<typeof EstimatesEditDataTable> | null>} */
const estimatesTable = ref(null)

async function refreshEstimatesAndTable() {
  await Promise.all([expensesRefresh(), estimatesTable.value?.refresh()])
}

async function initialize(context) {
  context.setEditableSteps(["edit-purpose-details", "edit-trip-details"])
}

const snack = useSnack()

async function validate() {
  if (hasEstimates.value !== true) {
    snack.warning("Please add at least one estimate.")
    return false
  }

  return true
}

/** @type {import("vue").Ref<InstanceType<typeof EstimateEditDialog> | null>} */
const estimateEditDialog = ref(null)

function clickedEditEstimateCallback(estimateId) {
  estimateEditDialog.value?.show(estimateId)
}

defineExpose({
  initialize,
  continue: validate,
})
</script>
