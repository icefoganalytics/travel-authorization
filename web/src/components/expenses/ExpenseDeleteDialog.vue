<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
    @keydown.esc="hide"
    @input="hideIfFalse"
  >
    <v-card>
      <v-card-title class="text-h5">
        Are you sure you want to delete the following expense?
      </v-card-title>
      <v-skeleton-loader
        v-if="isNil(expenseId) || isNil(expense)"
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
import { DateTime } from "luxon"

import { formatCurrency } from "@/utils/formatters"
import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"

import expensesApi from "@/api/expenses-api"
import useExpense from "@/use/use-expense"
import useSnack from "@/use/use-snack"

const emit = defineEmits<{
  (event: "deleted"): void
}>()

const expenseId = useRouteQuery("showExpenseDelete", undefined, {
  transform: integerTransformer,
})
const { expense, isLoading } = useExpense(expenseId)

const showDialog = ref(false)
const snack = useSnack()

async function deleteAndHide() {
  if (isNil(expenseId.value)) return

  isLoading.value = true
  try {
    await expensesApi.delete(expenseId.value)
    hide()

    await nextTick()
    emit("deleted")
    snack.success("Expense deleted successfully")
  } catch (error) {
    console.error(`Failed to delete expense: ${error}`, { error })
    snack.error(`Failed to delete expense: ${error}`)
  } finally {
    isLoading.value = false
  }
}

watch(
  expenseId,
  (newExpenseId) => {
    if (isNil(newExpenseId)) {
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

function show(newExpenseId: number) {
  expenseId.value = newExpenseId
}

function hide() {
  expenseId.value = undefined
}

function hideIfFalse(value: boolean | null) {
  if (value !== false) return

  hide()
}

function formatDate(date: string | null) {
  if (isNil(date)) return ""

  return DateTime.fromISO(date, { zone: "utc" }).toFormat("d-LLLL-yyyy")
}

defineExpose({
  show,
})
</script>
