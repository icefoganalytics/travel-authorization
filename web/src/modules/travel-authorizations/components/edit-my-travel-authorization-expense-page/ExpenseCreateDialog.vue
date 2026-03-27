<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
  >
    <template #activator="{ on, attrs }">
      <v-btn
        color="secondary"
        dark
        class="mb-2"
        v-bind="attrs"
        v-on="on"
      >
        Add Expense
      </v-btn>
    </template>
    <v-form
      ref="form"
      @submit.prevent="createAndClose"
    >
      <v-card :loading="isLoading">
        <v-card-title>
          <span class="text-h5">Create Expense</span>
        </v-card-title>

        <v-card-text>
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
              />
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
            color="primary"
            type="submit"
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

import { type VForm } from "vuetify/lib/components"

import expensesApi, { ExpenseExpenseTypes, ExpenseTypes, type Expense } from "@/api/expenses-api"
import CurrencyTextField from "@/components/Utils/CurrencyTextField.vue"
import DatePicker from "@/components/common/DatePicker.vue"
import ExpenseTypeSelect from "@/modules/travel-authorizations/components/ExpenseTypeSelect.vue"
import useSnack from "@/use/use-snack"
import useRouteQuery, { booleanTransformer } from "@/use/utils/use-route-query"
import { required } from "@/utils/validators"

const props = defineProps<{
  travelAuthorizationId: number
}>()

const emit = defineEmits<{
  (event: "created"): void
}>()

const showDialog = useRouteQuery("showCreateExpense", "false", {
  transform: booleanTransformer,
})

const expense = ref<Partial<Expense>>({
  travelAuthorizationId: props.travelAuthorizationId,
  type: ExpenseTypes.EXPENSE,
  currency: "CAD",
})

const expenseTypes = [ExpenseExpenseTypes.ACCOMMODATIONS, ExpenseExpenseTypes.TRANSPORTATION]

watch(
  () => showDialog.value,
  () => {
    reset()
  }
)

watch(
  () => props.travelAuthorizationId,
  () => {
    reset()
  }
)

const form = ref<InstanceType<typeof VForm> | null>(null)
const isLoading = ref(false)
const snack = useSnack()

async function createAndClose() {
  if (!form.value?.validate()) return

  isLoading.value = true
  try {
    await expensesApi.create(expense.value)
    hide()

    await nextTick()
    emit("created")
  } catch (error) {
    console.error(`Failed to create expense: ${error}`, { error })
    snack.error(`Failed to create expense: ${error}`)
  } finally {
    isLoading.value = false
  }
}

function reset() {
  form.value?.resetValidation()
  expense.value = {
    travelAuthorizationId: props.travelAuthorizationId,
    type: ExpenseTypes.EXPENSE,
    currency: "CAD",
  }
}

function hide() {
  showDialog.value = false
}
</script>
