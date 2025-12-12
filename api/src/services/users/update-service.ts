import { User } from "@/models"
import BaseService from "@/services/base-service"

export type UserUpdateAttributes = Partial<User>

export class UpdateService extends BaseService {
  constructor(
    protected user: User,
    protected attributes: UserUpdateAttributes,
    protected currentUser: User
  ) {
    super()
  }

  async perform(): Promise<User> {
    return this.user.update(this.attributes)
  }
}

export default UpdateService
