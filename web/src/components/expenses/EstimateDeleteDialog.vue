<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
  >
    <v-card>
      <v-card-title class="text-h5">
        Are you sure you want to delete the following estimate?
      </v-card-title>
      <v-card-text>
        <div v-if="hasEstimate">
          <v-row no-gutters>
            <v-col class="text-center">
              {{ estimate.expenseType }}
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col class="text-center">
              {{ estimate.description }}
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col class="text-center">
              {{ formatDate(estimate.date) }}
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col class="text-center">
              {{ formatCurrency(estimate.cost) }}
            </v-col>
          </v-row>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="secondary"
          :loading="loading"
          @click="close"
          >Cancel</v-btn
        >
        <v-btn
          color="error"
          :loading="loading"
          @click="deleteAndClose"
          >OK</v-btn
        >
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { isEmpty } from "lodash"
import { DateTime } from "luxon"

import expensesApi from "@/api/expenses-api"

export default {
  name: "EstimateDeleteDialog",
  data: () => ({
    estimate: {},
    showDialog: false,
    loading: false,
  }),
  computed: {
    estimateId() {
      return this.estimate.id
    },
    hasEstimate() {
      return !isEmpty(this.estimate)
    },
  },
  watch: {
    showDialog(value) {
      if (value) {
        if (this.$route.query.showDelete === this.estimate.id.toString()) return

        this.$router.push({ query: { showDelete: this.estimate.id } })
      } else {
        this.$router.push({ query: { showDelete: undefined } })
      }
    },
  },
  methods: {
    show(estimate) {
      this.estimate = estimate
      this.showDialog = true
    },
    close() {
      this.showDialog = false
    },
    deleteAndClose() {
      this.loading = true
      return expensesApi
        .delete(this.estimateId)
        .then(() => {
          this.$emit("deleted")
          this.close()
        })
        .catch((error) => {
          this.$snack(error.message, { color: "error" })
        })
        .finally(() => {
          this.loading = false
        })
    },
    formatDate(date) {
      return DateTime.fromISO(date, { zone: "utc" }).toFormat("d-LLLL-yyyy")
    },
    formatCurrency(amount) {
      const formatter = new Intl.NumberFormat("en-CA", {
        style: "currency",
        currency: "CAD",
      })
      return formatter.format(amount)
    },
  },
}
</script>
