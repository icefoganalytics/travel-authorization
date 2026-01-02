<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
    @keydown.esc="hide"
    @input="hideIfFalse"
  >
    <v-form
      ref="formRef"
      @submit.prevent="updateAndClose"
    >
      <v-card>
        <v-card-title>
          <span class="text-h5">Edit Expense</span>
        </v-card-title>

        <v-skeleton-loader
          v-if="isNil(expenseId) || isNil(expense)"
          type="card"
        />
        <v-card-text v-else>
          <v-row>
            <v-col>
              <ExpenseTypeSelect
                v-model="expense.expenseType"
                :expense-types="expenseTypes"
                :rules="[required]"
                label="Expense Type"
                required
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                v-model="expense.description"
                :rules="[required]"
                label="Description"
                required
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <DatePicker
                v-model="expense.date"
                :rules="[required]"
                label="Date"
                required
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <CurrencyTextField
                v-model="expense.cost"
                :rules="[required]"
                label="Amount"
                required
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            :loading="isLoading"
            color="error"
            @click="hide"
          >
            Cancel
          </v-btn>
          <v-btn
            :loading="isLoading"
            type="submit"
            color="primary"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from "vue"
import { isNil } from "lodash"

import { type VForm } from "vuetify/lib/components"

import { required } from "@/utils/validators"
import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"

import { ExpenseExpenseTypes } from "@/api/expenses-api"
import useSnack from "@/use/use-snack"
import useExpense from "@/use/use-expense"

import CurrencyTextField from "@/components/Utils/CurrencyTextField.vue"
import DatePicker from "@/components/common/DatePicker.vue"
import ExpenseTypeSelect from "@/modules/travel-authorizations/components/ExpenseTypeSelect.vue"

// TODO: consider if this should be a prop?
const expenseTypes = [ExpenseExpenseTypes.ACCOMMODATIONS, ExpenseExpenseTypes.TRANSPORTATION]

const emit = defineEmits(["saved"])

const expenseId = useRouteQuery("showExpenseEdit", undefined, {
  transform: integerTransformer,
})

const { expense, isLoading, save } = useExpense(expenseId)

const showDialog = ref(false)
const formRef = ref<InstanceType<typeof VForm> | null>(null)
const snack = useSnack()

async function updateAndClose() {
  if (isNil(formRef.value)) return

  if (!formRef.value.validate()) {
    snack.error("Please fill in all required fields")
    return
  }

  isLoading.value = true
  try {
    await save()
    hide()

    await nextTick()
    emit("saved")
    snack.success("Expense saved successfully")
  } catch (error) {
    console.error(`Failed to save expense: ${error}`, { error })
    snack.error(`Failed to save expense: ${error}`)
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
      formRef.value?.resetValidation()
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

defineExpose({
  show,
})
</script>
