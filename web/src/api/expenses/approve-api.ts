import http from "@/api/http-client"

import { type ExpenseAsShow, type ExpensePolicy } from "@/api/expenses-api"

export const approveApi = {
  async create(expenseId: number): Promise<{
    expense: ExpenseAsShow
    policy: ExpensePolicy
  }> {
    const { data } = await http.post(`/api/expenses/${expenseId}/approve`)
    return data
  },
}

export default approveApi
