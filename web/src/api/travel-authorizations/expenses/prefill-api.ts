import http from "@/api/http-client"

import { type ExpenseAsIndex } from "@/api/expenses-api"

export const prefillApi = {
  async create(travelAuthorizationId: number): Promise<{
    expenses: ExpenseAsIndex[]
  }> {
    const { data } = await http.post(
      `/api/travel-authorizations/${travelAuthorizationId}/expenses/prefill`
    )
    return data
  },
}

export default prefillApi
