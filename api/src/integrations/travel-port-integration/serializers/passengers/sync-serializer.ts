import { pick } from "lodash"

import { Passenger } from "@/integrations/travel-port-integration/models"
import BaseSerializer from "@/serializers/base-serializer"

export class SyncSerializer extends BaseSerializer<Passenger> {
  perform() {
    const firstName = this.trimSourceValue(this.record.firstName)
    const lastName = this.trimSourceValue(this.record.lastName)

    return {
      ...pick(this.record, ["lastNameElement", "passengerElement"]),
      firstName,
      lastName,
    }
  }

  private trimSourceValue(value: string | null): string | null {
    return value?.trim() ?? null
  }
}

export default SyncSerializer
