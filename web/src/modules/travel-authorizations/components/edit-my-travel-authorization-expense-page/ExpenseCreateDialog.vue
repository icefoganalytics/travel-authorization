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
      <v-card :loading="loading">
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

import expensesApi, { EXPENSE_TYPES } from "@/api/expenses-api"

import CurrencyTextField from "@/components/Utils/CurrencyTextField.vue"
import DatePicker from "@/components/common/DatePicker.vue"
import ExpenseTypeSelect from "@/modules/travel-authorizations/components/ExpenseTypeSelect.vue"

export default {
  name: "ExpenseCreateDialog",
  components: {
    CurrencyTextField,
    DatePicker,
    ExpenseTypeSelect,
  },
  props: {
    formId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      expenseTypes: [EXPENSE_TYPES.ACCOMMODATIONS, EXPENSE_TYPES.TRANSPORTATION],
      expense: this.newExpense(),
      showDialog: this.$route.query.showCreateExpense === "true",
      loading: false,
    }
  },
  watch: {
    showDialog(value) {
      if (value) {
        this.$router.push({ query: { showCreateExpense: value } })
      } else {
        this.$router.push({ query: { showCreateExpense: undefined } })
      }
    },
  },
  methods: {
    required,
    newExpense() {
      return {
        travelAuthorizationId: this.formId,
        type: expensesApi.TYPES.EXPENSE,
        currency: "CAD",
      }
    },
    close() {
      this.showDialog = false
      this.expense = this.newExpense()
      this.$refs.form.resetValidation()
    },
    createAndClose() {
      this.loading = true
      return expensesApi
        .create(this.expense)
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
