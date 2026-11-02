import { API_BASE_URL } from "@/config"

export const reportsApi = {
  downloadPath(format: "csv" | "pdf"): string {
    return `${API_BASE_URL}/api/downloads/travel-desk-travel-requests?format=${format}`
  },
}

export default reportsApi
