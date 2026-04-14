<template>
  <v-select
    :model-value="modelValue"
    :items="expenseTypes"
    label="Expense Type"
    density="compact"
    variant="outlined"
    v-bind="$attrs"
    @update:model-value="updateModelValue"
  ></v-select>
</template>

<script setup lang="ts">
import { ExpenseExpenseTypes } from "@/api/expenses-api"

withDefaults(
  defineProps<{
    modelValue: ExpenseExpenseTypes | null | undefined
    expenseTypes?: ExpenseExpenseTypes[]
  }>(),
  {
    expenseTypes: () => Object.values(ExpenseExpenseTypes),
  }
)

const emit = defineEmits<{
  (event: "update:modelValue", value: ExpenseExpenseTypes | null): void
}>()

function updateModelValue(value: ExpenseExpenseTypes | null) {
  emit("update:modelValue", value)
}
</script>
