<template>
  <v-dialog
    v-if="!isNil(expense)"
    v-model="showDialog"
    max-width="500px"
  >
    <v-form
      ref="form"
      @submit.prevent="updateAndClose"
    >
      <v-card>
        <v-card-title>
          <span class="text-h5">Edit Estimate</span>
        </v-card-title>

        <v-card-text :loading="isLoading">
          <v-row>
            <v-col>
              <ExpenseTypeSelect
                v-model="expense.expenseType"
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
                :min="departureDate"
                :max="returnDate"
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
            @click="close"
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

<script setup>
import { ref, computed } from "vue"
import { isNil } from "lodash"

import { required } from "@/utils/validators"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useSnack from "@/use/use-snack"
import useExpense from "@/use/use-expense"
import useTravelAuthorizationSummary from "@/use/travel-authorizations/use-travel-authorization-summary"

import CurrencyTextField from "@/components/Utils/CurrencyTextField"
import DatePicker from "@/components/common/DatePicker.vue"

import ExpenseTypeSelect from "@/modules/travel-authorizations/components/ExpenseTypeSelect"

const emit = defineEmits(["updated"])

const showDialog = ref(false)

const estimateId = useRouteQuery("editEstimateId", null, {
  transform: integerTransformer,
})

const { expense, isLoading, save } = useExpense(estimateId)

const travelAuthorizationId = computed(() => {
  if (isNil(expense.value)) return null
  return expense.value.travelAuthorizationId
})

const { departureDate, returnDate } = useTravelAuthorizationSummary(travelAuthorizationId)

function show(newEstimateId) {
  estimateId.value = newEstimateId
  showDialog.value = true
}

function close() {
  estimateId.value = null
  showDialog.value = false
}

const snack = useSnack()

async function updateAndClose() {
  try {
    await save()
    emit("updated")
    close()
    snack.success("Estimate updated")
  } catch (error) {
    console.error(error)
    snack.error("Failed to update estimate")
  }
}

defineExpose({
  show,
  close,
})
</script>
