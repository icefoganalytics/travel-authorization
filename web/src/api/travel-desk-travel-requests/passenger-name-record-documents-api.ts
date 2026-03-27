import http from "@/api/http-client"

import { Attachment } from "@/api/attachments-api"

export const passengerNameRecordDocumentsApi = {
  async create(
    travelDeskTravelRequestId: number,
    file: File
  ): Promise<{
    passengerNameRecordDocument: Attachment
  }> {
    const formData = new FormData()
    // Field name must match api/src/controllers/travel-desk-travel-requests/passenger-name-record-document-controller.ts
    formData.append("content", file)

    const { data } = await http.post(
      `/api/travel-desk-travel-requests/${travelDeskTravelRequestId}/passenger-name-record-document`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    return data
  },
}

export default passengerNameRecordDocumentsApi
