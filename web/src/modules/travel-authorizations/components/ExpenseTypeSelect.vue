<template>
  <v-select
    :value="value"
    :items="expenseTypes"
    label="Expense Type"
    dense
    outlined
    v-bind="$attrs"
    @input="input"
  ></v-select>
</template>

<script setup lang="ts">
import { ExpenseExpenseTypes } from "@/api/expenses-api"

withDefaults(
  defineProps<{
    value: string | null | undefined
    expenseTypes?: ExpenseExpenseTypes[]
  }>(),
  {
    expenseTypes: () => Object.values(ExpenseExpenseTypes),
  }
)

const emit = defineEmits<{
  (event: "input", value: string | null): void
}>()

function input(value: string | null) {
  emit("input", value)
}
</script>
