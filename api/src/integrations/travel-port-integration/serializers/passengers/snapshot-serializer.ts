import { Passenger } from "@/integrations/travel-port-integration/models"
import BaseSerializer from "@/serializers/base-serializer"

export class SnapshotSerializer extends BaseSerializer<Passenger> {
  perform() {
    return {
      TravelOrderIdentifier: this.record.travelOrderIdentifier,
      LastNameElement: this.record.lastNameElement,
      PassengerElement: this.record.passengerElement,
      AbsoluteNameElement: this.record.absoluteNameElement,
      FirstName: this.record.firstName,
      LastName: this.record.lastName,
      NameRemark: this.record.nameRemark,
    }
  }
}

export default SnapshotSerializer
