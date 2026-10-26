import { TravelDeskQuestion, User } from "@/models"

import BaseService from "@/services/base-service"

type Attributes = Partial<TravelDeskQuestion>

export class UpdateService extends BaseService {
  constructor(
    protected travelDeskQuestion: TravelDeskQuestion,
    protected attributes: Attributes,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<TravelDeskQuestion> {
    return this.travelDeskQuestion.update(this.attributes)
  }
}

export default UpdateService
