<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
  >
    <template #activator="{ on, attrs }">
      <v-btn
        color="primary"
        dark
        class="mb-2"
        v-bind="attrs"
        v-on="on"
      >
        Add Estimate
      </v-btn>
    </template>
    <v-form
      ref="formRef"
      @submit.prevent="createAndClose"
    >
      <v-card :loading="isLoading">
        <v-card-title>
          <span class="text-h5">Create Estimate</span>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col>
              <ExpenseTypeSelect
                v-model="estimate.expenseType"
                :rules="[required]"
                label="Expense Type"
                required
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field
                v-model="estimate.description"
                :rules="[required]"
                label="Description"
                required
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <DatePicker
                v-model="estimate.date"
                :rules="[required]"
                label="Date"
                required
                :min="departureDate"
                :max="returnDate"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <CurrencyTextField
                v-model="estimate.cost"
                :rules="[required]"
                label="Amount"
                required
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            :loading="loading"
            color="error"
            @click="close"
          >
            Cancel
          </v-btn>
          <v-btn
            :loading="loading"
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

<script setup>
import { ref } from "vue"

import { required } from "@/utils/validators"
import useRouteQuery, { booleanTransformer } from "@/use/utils/use-route-query"

import expensesApi from "@/api/expenses-api"

import useSnack from "@/use/use-snack"
import useTravelAuthorizationSummary from "@/use/travel-authorizations/use-travel-authorization-summary"

import CurrencyTextField from "@/components/Utils/CurrencyTextField"
import DatePicker from "@/components/common/DatePicker.vue"
import ExpenseTypeSelect from "@/modules/travel-authorizations/components/ExpenseTypeSelect"

const emit = defineEmits(["created"])

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
  loading: {
    type: Boolean,
    required: true,
  },
})

const estimate = ref(newEstimate())

const { isLoading, departureDate, returnDate } = useTravelAuthorizationSummary(
  props.travelAuthorizationId
)

/** @type {import("vue").Ref<InstanceType<typeof import("vuetify/lib").VForm> | null>} */
const formRef = ref(null)

const showDialog = useRouteQuery("showEstimateCreate", false, {
  transform: booleanTransformer,
})

function newEstimate() {
  return {
    travelAuthorizationId: props.travelAuthorizationId,
    type: expensesApi.TYPES.ESTIMATE,
    currency: "CAD",
  }
}

const snack = useSnack()

async function createAndClose() {
  try {
    await expensesApi.create(estimate.value)
    showDialog.value = false
    emit("created")
    close()
    snack.success("Estimate created")
  } catch (error) {
    console.error(error)
    snack.error("Failed to create estimate")
  }
}

function close() {
  showDialog.value = false
  estimate.value = newEstimate()
  formRef.value?.resetValidation()
}
</script>
