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
      ref="form"
      @submit.prevent="createAndClose"
    >
      <v-card :loading="loading">
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
              ></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <DatePicker
                v-model="estimate.date"
                :rules="[required]"
                label="Date"
                required
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
          <v-spacer></v-spacer>
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

<script>
import { required } from "@/utils/validators"

import CurrencyTextField from "@/components/Utils/CurrencyTextField"
import DatePicker from "@/components/common/DatePicker.vue"
import ExpenseTypeSelect from "@/modules/travel-authorizations/components/ExpenseTypeSelect"

import expensesApi from "@/api/expenses-api"

export default {
  name: "EstimateCreateDialog",
  components: {
    CurrencyTextField,
    DatePicker,
    ExpenseTypeSelect,
  },
  props: {
    travelAuthorizationId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      estimate: this.newEstimate(),
      showDialog: this.$route.query.showCreate === "true",
      loading: false,
    }
  },
  watch: {
    showDialog(value) {
      if (value) {
        this.$router.push({ query: { showCreate: value } })
      } else {
        this.$router.push({ query: { showCreate: undefined } })
      }
    },
  },
  methods: {
    required,
    newEstimate() {
      return {
        travelAuthorizationId: this.travelAuthorizationId,
        type: expensesApi.TYPES.ESTIMATE,
        currency: "CAD",
      }
    },
    close() {
      this.showDialog = false
      this.estimate = this.newEstimate()
      this.$refs.form.resetValidation()
    },
    createAndClose() {
      this.loading = true
      return expensesApi
        .create(this.estimate)
        .then(() => {
          this.close()
          this.$nextTick(() => {
            this.$emit("created")
          })
        })
        .catch((error) => {
          this.$snack(error.message, { color: "error" })
        })
        .finally(() => {
          this.loading = false
        })
    },
  },
}
</script>
