import http from "@/api/http-client"

import { Attachment } from "@/api/attachments-api"

export const receiptApi = {
  async create(
    expenseId: number,
    file: File
  ): Promise<{
    receipt: Attachment
  }> {
    const formData = new FormData()
    formData.append("content", file)

    const { data } = await http.post(`/api/expenses/${expenseId}/receipt`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return data
  },
  async update(
    expenseId: number,
    receiptId: number,
    file: File
  ): Promise<{
    receipt: Attachment
  }> {
    const formData = new FormData()
    formData.append("content", file)
    const { data } = await http.patch(`/api/expenses/${expenseId}/receipt/${receiptId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return data
  },
  async delete(expenseId: number, receiptId: number): Promise<void> {
    const { data } = await http.delete(`/api/expenses/${expenseId}/receipt/${receiptId}`)
    return data
  },
}

export default receiptApi
