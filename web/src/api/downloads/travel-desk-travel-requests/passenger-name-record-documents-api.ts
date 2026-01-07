import { API_BASE_URL } from "@/config"
import http from "@/api/http-client"

export const passengerNameRecordDocumentsApi = {
  downloadPath(travelDeskTravelRequestId: number) {
    return `${API_BASE_URL}/api/downloads/travel-desk-travel-requests/${travelDeskTravelRequestId}/passenger-name-record-document`
  },

  async get(travelDeskTravelRequestId: number): Promise<Blob> {
    const path = this.downloadPath(travelDeskTravelRequestId)
    const { data } = await http.get(path, {
      responseType: "blob",
    })
    return data
  },

  async create(travelDeskTravelRequestId: number): Promise<Blob> {
    const path = this.downloadPath(travelDeskTravelRequestId)
    const { data } = await http.post(path, undefined, {
      responseType: "blob",
    })
    return data
  },
}

export default passengerNameRecordDocumentsApi
