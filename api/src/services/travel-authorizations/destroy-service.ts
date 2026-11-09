import BaseService from "@/services/base-service"

import { TravelAuthorization, User } from "@/models"

export class DestroyService extends BaseService {
  private travelAuthorization: TravelAuthorization
  private currentUser: User

  constructor(travelAuthorization: TravelAuthorization, currentUser: User) {
    super()
    this.travelAuthorization = travelAuthorization
    this.currentUser = currentUser
  }

  async perform(): Promise<void> {
    await this.travelAuthorization.destroy().catch((error) => {
      throw new Error(`Could not delete TravelAuthorization: ${error}`)
    })

    return
  }
}

export default DestroyService
