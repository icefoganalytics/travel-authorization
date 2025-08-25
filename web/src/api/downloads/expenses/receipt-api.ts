import { API_BASE_URL } from "@/config"
import http from "@/api/http-client"

export const receiptApi = {
  downloadPath(expenseId: number) {
    return `${API_BASE_URL}/api/downloads/expenses/${expenseId}/receipt`
  },
  async get(expenseId: number): Promise<Blob> {
    const path = this.downloadPath(expenseId)
    const { data } = await http.get(path, {
      responseType: "blob",
    })
    return data
  },
  async create(expenseId: number): Promise<Blob> {
    const path = this.downloadPath(expenseId)
    const { data } = await http.post(path, undefined, {
      responseType: "blob",
    })
    return data
  },
}

export default receiptApi
