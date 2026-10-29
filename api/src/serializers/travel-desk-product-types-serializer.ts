import { TravelDeskProductType } from "@/models"

export class TravelDeskProductTypesSerializer {
  static asIndex(travelDeskProductTypes: TravelDeskProductType[]) {
    return travelDeskProductTypes.map((travelDeskProductType) => this.asShow(travelDeskProductType))
  }

  static asShow(travelDeskProductType: TravelDeskProductType) {
    return {
      id: travelDeskProductType.id,
      code: travelDeskProductType.code,
      name: travelDeskProductType.name,
      description: travelDeskProductType.description,
    }
  }
}

export default TravelDeskProductTypesSerializer
