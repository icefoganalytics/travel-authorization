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
          <span class="text-h5">Edit Expense</span>
        </v-card-title>

        <v-card-text :loading="loading">
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

import CurrencyTextField from "@/components/Utils/CurrencyTextField.vue"
import DatePicker from "@/components/common/DatePicker.vue"
import ExpenseTypeSelect from "@/modules/travel-authorizations/components/ExpenseTypeSelect.vue"

import expensesApi, { EXPENSE_TYPES } from "@/api/expenses-api"

export default {
  name: "ExpenseEditDialog",
  components: {
    CurrencyTextField,
    DatePicker,
    ExpenseTypeSelect,
  },
  data: () => ({
    expenseTypes: [EXPENSE_TYPES.ACCOMMODATIONS, EXPENSE_TYPES.TRANSPORTATION],
    expense: {},
    showDialog: false,
    loading: false,
  }),
  computed: {
    expenseId() {
      return this.expense.id
    },
  },
  watch: {
    showDialog(value) {
      if (value) {
        if (this.$route.query.showEdit === this.expense.id.toString()) return

        this.$router.push({ query: { showEdit: this.expense.id } })
      } else {
        this.$router.push({ query: { showEdit: undefined } })
      }
    },
  },
  methods: {
    required,
    show(expense) {
      this.expense = cloneDeep(expense)
      this.showDialog = true
    },
    close() {
      this.showDialog = false
      this.$nextTick(() => {
        this.expense = {}
        this.$refs.form.resetValidation()
      })
    },
    updateAndClose() {
      this.loading = true
      return expensesApi
        .update(this.expenseId, this.expense)
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
