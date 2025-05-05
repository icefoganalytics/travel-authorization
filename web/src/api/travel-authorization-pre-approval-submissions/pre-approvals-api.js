import http from "@/api/http-client"

export const preApprovalsApi = {
  /**
   * @param {Partial<TravelAuthorizationPreApproval>} attributes
   * @returns {Promise<void>}
   */
  async create(travelAuthorizationPreApprovalSubmissionId, travelAuthorizationPreApprovalId) {
    const { data } = await http.post(
      `/api/travel-authorization-pre-approval-submissions/${travelAuthorizationPreApprovalSubmissionId}/pre-approvals/${travelAuthorizationPreApprovalId}`
    )
    return data
  },
  /**
   * @param {number} travelAuthorizationPreApprovalSubmissionId
   * @param {number} travelAuthorizationPreApprovalId
   * @returns {Promise<void>}
   */
  async delete(travelAuthorizationPreApprovalSubmissionId, travelAuthorizationPreApprovalId) {
    const { data } = await http.delete(
      `/api/travel-authorization-pre-approval-submissions/${travelAuthorizationPreApprovalSubmissionId}/pre-approvals/${travelAuthorizationPreApprovalId}`
    )
    return data
  },
}

export default preApprovalsApi
