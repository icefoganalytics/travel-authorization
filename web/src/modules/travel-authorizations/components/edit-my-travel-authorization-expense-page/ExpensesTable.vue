<template>
  <v-data-table
    :headers="headers"
    :items="items"
    :items-per-page="10"
    :loading="isLoading"
    class="elevation-2"
  >
    <template #top>
      <ExpenseEditDialog
        ref="editDialog"
        @saved="emitChangedAndRefresh"
      />
      <ExpenseDeleteDialog
        ref="deleteDialog"
        @deleted="emitChangedAndRefresh"
      />
    </template>
    <template #item.date="{ value }">
      {{ formatDate(value) }}
    </template>
    <template #item.cost="{ value }">
      {{ formatCurrency(value) }}
    </template>
    <template #item.actions="{ value: actions, item }">
      <div class="d-flex">
        <v-col class="d-flex justify-end">
          <v-btn
            v-if="actions.includes('edit')"
            color="secondary"
            @click="showEditDialog(item)"
            >Edit</v-btn
          >
        </v-col>
        <v-col class="d-flex justify-end">
          <AddReceiptButton
            v-if="item.fileSize === null"
            :expense-id="item.id"
            @uploaded="emitChangedAndRefresh"
          />
          <ViewRecieptLink
            v-else
            :expense-id="item.id"
          />

          <v-btn
            v-if="actions.includes('delete')"
            icon
            class="ml-2"
            color="error"
            title="Delete"
            @click="showDeleteDialog(item)"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-col>
      </div>
    </template>
    <template #foot>
      <tfoot>
        <tr>
          <td
            :class="totalRowClasses"
            colspan="2"
          ></td>
          <td :class="totalRowClasses">Total</td>
          <td :class="totalRowClasses">{{ formatCurrency(totalAmount) }}</td>
          <td
            :class="totalRowClasses"
            colspan="1"
          ></td>
        </tr>
      </tfoot>
    </template>
  </v-data-table>
</template>

<script>
import { sumBy } from "lodash"
import { mapActions, mapGetters } from "vuex"
import { DateTime } from "luxon"

import { TYPES, EXPENSE_TYPES } from "@/api/expenses-api"

import AddReceiptButton from "@/modules/travel-authorizations/components/edit-my-travel-authorization-expense-page/AddReceiptButton.vue"
import ExpenseDeleteDialog from "@/modules/travel-authorizations/components/edit-my-travel-authorization-expense-page/ExpenseDeleteDialog.vue"
import ExpenseEditDialog from "@/modules/travel-authorizations/components/edit-my-travel-authorization-expense-page/ExpenseEditDialog.vue"
import ViewRecieptLink from "@/modules/travel-authorizations/components/edit-my-travel-authorization-expense-page/ViewRecieptLink.vue"

export default {
  name: "ExpensesTable",
  components: {
    AddReceiptButton,
    ExpenseDeleteDialog,
    ExpenseEditDialog,
    ViewRecieptLink,
  },
  props: {
    travelAuthorizationId: {
      type: Number,
      required: true,
    },
  },
  data: () => ({
    headers: [
      { text: "Expense Type", value: "expenseType" },
      { text: "Description", value: "description" },
      { text: "Date", value: "date" },
      { text: "Amount", value: "cost" },
      { text: "", value: "actions" },
    ],
    totalRowClasses: "text-start font-weight-bold text-uppercase",
  }),
  computed: {
    ...mapGetters("expenses", ["items", "isLoading"]),
    // Will need to be calculated in the back-end if data is multi-page.
    totalAmount() {
      return sumBy(this.items, "cost")
    },
  },
  async mounted() {
    await this.ensure({
      where: {
        travelAuthorizationId: this.travelAuthorizationId,
        type: TYPES.EXPENSE,
        expenseType: [EXPENSE_TYPES.ACCOMMODATIONS, EXPENSE_TYPES.TRANSPORTATION],
      },
    })
    this.showEditDialogForRouteQuery()
    this.showDeleteDialogForRouteQuery()
  },
  methods: {
    ...mapActions("expenses", ["ensure", "fetch"]),
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
    refresh() {
      return this.fetch({
        where: {
          travelAuthorizationId: this.travelAuthorizationId,
          type: TYPES.EXPENSE,
          expenseType: [EXPENSE_TYPES.ACCOMMODATIONS, EXPENSE_TYPES.TRANSPORTATION],
        },
      })
    },
    emitChangedAndRefresh() {
      this.$emit("changed")
      return this.refresh()
    },
    showDeleteDialog(item) {
      this.$refs.deleteDialog.show(item)
    },
    showEditDialog(item) {
      this.$refs.editDialog.show(item)
    },
    showEditDialogForRouteQuery() {
      const expenseId = parseInt(this.$route.query.showEdit)
      if (isNaN(expenseId)) return

      const expense = this.items.find((expense) => expense.id === expenseId)
      if (!expense) return

      this.showEditDialog(expense)
    },
    showDeleteDialogForRouteQuery() {
      const expenseId = parseInt(this.$route.query.showDelete)
      if (isNaN(expenseId)) return

      const expense = this.items.find((expense) => expense.id === expenseId)
      if (!expense) return

      this.showDeleteDialog(expense)
    },
  },
}
</script>
