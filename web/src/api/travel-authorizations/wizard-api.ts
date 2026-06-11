import http from "@/api/http-client"

import {
  type TravelAuthorizationStatuses,
  type TravelAuthorizationWizardStepNames,
} from "@/api/travel-authorizations-api"

/** Keep in sync with api/src/serializers/travel-authorizations/wizard/show-serializer.ts */
export type TravelAuthorizationWizardAsShow = {
  id: number
  status: TravelAuthorizationStatuses | null
  wizardStepName: TravelAuthorizationWizardStepNames | null
}

export const wizardApi = {
  async get(travelAuthorizationId: number): Promise<{
    travelAuthorization: TravelAuthorizationWizardAsShow
  }> {
    const { data } = await http.get(`/api/travel-authorizations/${travelAuthorizationId}/wizard`)
    return data
  },
  async update(
    travelAuthorizationId: number,
    attributes: Partial<TravelAuthorizationWizardAsShow>
  ): Promise<{
    travelAuthorization: TravelAuthorizationWizardAsShow
  }> {
    const { data } = await http.patch(
      `/api/travel-authorizations/${travelAuthorizationId}/wizard`,
      attributes
    )
    return data
  },
}

export default wizardApi
