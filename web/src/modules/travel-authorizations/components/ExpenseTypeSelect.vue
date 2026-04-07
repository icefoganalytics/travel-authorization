<template>
  <v-select
    :model-value="modelValue"
    :items="expenseTypes"
    label="Expense Type"
    dense
    outlined
    v-bind="$attrs"
    @update:model-value="updateModelValue"
  ></v-select>
</template>

<script setup lang="ts">
import { ExpenseExpenseTypes } from "@/api/expenses-api"

withDefaults(
  defineProps<{
    modelValue: string | null | undefined
    expenseTypes?: ExpenseExpenseTypes[]
  }>(),
  {
    expenseTypes: () => Object.values(ExpenseExpenseTypes),
  }
)

const emit = defineEmits<{
  (event: "update:modelValue", value: string | null): void
}>()

function updateModelValue(value: string | null) {
  emit("update:modelValue", value)
}
</script>
