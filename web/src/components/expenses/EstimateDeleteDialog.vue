<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
    @keydown.esc="hide"
    @input="hideIfFalse"
  >
    <v-card>
      <v-card-title class="text-h5">
        Are you sure you want to delete the following estimate?
      </v-card-title>
      <v-skeleton-loader
        v-if="isNil(estimateId) || isNil(expense)"
        type="card"
      />
      <v-card-text v-else>
        <div>
          <v-row no-gutters>
            <v-col class="text-center">
              {{ expense.expenseType }}
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col class="text-center">
              {{ expense.description }}
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col class="text-center">
              {{ formatDate(expense.date) }}
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col class="text-center">
              {{ formatCurrency(expense.cost) }}
            </v-col>
          </v-row>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="secondary"
          :loading="isLoading"
          @click="hide"
          >Cancel</v-btn
        >
        <v-btn
          color="error"
          :loading="isLoading"
          @click="deleteAndHide"
          >OK</v-btn
        >
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from "vue"
import { isNil } from "lodash"

import expensesApi from "@/api/expenses-api"
import useSnack from "@/use/use-snack"
import { formatCurrency, formatDate } from "@/utils/formatters"
import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useExpense from "@/use/use-expense"

const emit = defineEmits<{
  (event: "deleted"): void
}>()

const estimateId = useRouteQuery("showDelete", undefined, {
  transform: integerTransformer,
})
const { expense, isLoading } = useExpense(estimateId)

const showDialog = ref(false)
const snack = useSnack()

watch(
  estimateId,
  (newEstimateId) => {
    if (isNil(newEstimateId)) {
      showDialog.value = false
      expense.value = null
    } else {
      showDialog.value = true
    }
  },
  {
    immediate: true,
  }
)

function show(newEstimateId: number) {
  estimateId.value = newEstimateId
}

function hide() {
  estimateId.value = undefined
}

function hideIfFalse(value: boolean | null) {
  if (value !== false) return

  hide()
}

async function deleteAndHide() {
  if (isNil(estimateId.value)) return

  isLoading.value = true
  try {
    await expensesApi.delete(estimateId.value)
    hide()

    await nextTick()
    emit("deleted")
  } catch (error) {
    console.error(`Failed to delete estimate: ${error}`, { error })
    snack.error(`Failed to delete estimate: ${error}`)
  } finally {
    isLoading.value = false
  }
}

defineExpose({
  show,
})
</script>
