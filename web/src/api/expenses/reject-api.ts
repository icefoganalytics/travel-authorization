import http from "@/api/http-client"

import { type Expense, type ExpenseAsShow, type ExpensePolicy } from "@/api/expenses-api"

export type RejectAttributes = Partial<Pick<Expense, "rejectionNote">>

export const rejectApi = {
  async create(
    expenseId: number,
    attributes: RejectAttributes
  ): Promise<{
    expense: ExpenseAsShow
    policy: ExpensePolicy
  }> {
    const { data } = await http.post(`/api/expenses/${expenseId}/reject`, attributes)
    return data
  },
}

export default rejectApi
