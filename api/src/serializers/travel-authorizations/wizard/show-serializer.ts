import { pick } from "lodash"

import { TravelAuthorization } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelAuthorizationWizardAsShow = Pick<
  TravelAuthorization,
  "id" | "status" | "wizardStepName"
>

export class ShowSerializer extends BaseSerializer<TravelAuthorization> {
  perform(): TravelAuthorizationWizardAsShow {
    return pick(this.record, ["id", "status", "wizardStepName"])
  }
}

export default ShowSerializer
