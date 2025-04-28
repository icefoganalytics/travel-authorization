<template>
  <v-dialog
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

        <v-card-text :loading="loading">
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

<script>
import { cloneDeep } from "lodash"

import { required } from "@/utils/validators"

import CurrencyTextField from "@/components/Utils/CurrencyTextField"
import DatePicker from "@/components/common/DatePicker.vue"
import ExpenseTypeSelect from "@/modules/travel-authorizations/components/ExpenseTypeSelect"

import expensesApi from "@/api/expenses-api"

export default {
  name: "EstimateEditDialog",
  components: {
    CurrencyTextField,
    DatePicker,
    ExpenseTypeSelect,
  },
  data: () => ({
    estimate: {},
    showDialog: false,
    loading: false,
  }),
  computed: {
    estimateId() {
      return this.estimate.id
    },
  },
  watch: {
    showDialog(value) {
      if (value) {
        if (this.$route.query.showEdit === this.estimate.id.toString()) return

        this.$router.push({ query: { showEdit: this.estimate.id } })
      } else {
        this.$router.push({ query: { showEdit: undefined } })
      }
    },
  },
  methods: {
    required,
    show(estimate) {
      this.estimate = cloneDeep(estimate)
      this.showDialog = true
    },
    close() {
      this.showDialog = false
      this.$nextTick(() => {
        this.estimate = {}
        this.$refs.form.resetValidation()
      })
    },
    updateAndClose() {
      this.loading = true
      return expensesApi
        .update(this.estimateId, this.estimate)
        .then(() => {
          this.$emit("saved")
          this.close()
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
