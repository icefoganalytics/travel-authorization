import http from "@/api/http-client"

import { type ExpenseAsIndex } from "@/api/expenses-api"

export const generateApi = {
  async create(travelAuthorizationId: number): Promise<{
    estimates: ExpenseAsIndex[]
    message: string
  }> {
    const { data } = await http.post(
      `/api/travel-authorizations/${travelAuthorizationId}/estimates/generate`
    )
    return data
  },
}

export default generateApi
