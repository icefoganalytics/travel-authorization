import { pick } from "lodash"

import { Passenger } from "@/integrations/travel-port-integration/models"
import BaseSerializer from "@/serializers/base-serializer"

export class SyncSerializer extends BaseSerializer<Passenger> {
  perform() {
    return {
      ...pick(this.record, ["lastNameElement", "passengerElement"]),
      firstName: this.record.firstName?.trim() ?? null,
      lastName: this.record.lastName?.trim() ?? null,
    }
  }
}

export default SyncSerializer
