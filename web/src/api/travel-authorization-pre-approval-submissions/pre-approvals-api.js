import http from "@/api/http-client"

export const preApprovalsApi = {
  /**
   * @param {number} travelAuthorizationPreApprovalSubmissionId
   * @param {number} travelAuthorizationPreApprovalId
   * @returns {Promise<void>}
   */
  async destroy(travelAuthorizationPreApprovalSubmissionId, travelAuthorizationPreApprovalId) {
    const { data } = await http.delete(
      `/api/travel-authorization-pre-approval-submissions/${travelAuthorizationPreApprovalSubmissionId}/pre-approvals/${travelAuthorizationPreApprovalId}`
    )
    return data
  },
}

export default preApprovalsApi
