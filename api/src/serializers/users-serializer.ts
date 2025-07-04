import { pick } from "lodash"

import { User } from "@/models"
import BaseSerializer from "./base-serializer"

export type UserDetailedView = Partial<User> & { displayName: string }

export class UsersSerializer extends BaseSerializer<User> {
  static asDetailed(user: User): UserDetailedView {
    const serializer = new this(user)
    return serializer.asDetailed()
  }

  asDetailed(): UserDetailedView {
    // Note that "sub" (Auth0 subject attribute) is a restricted field.
    return {
      ...pick(this.record, [
        "id",
        "email",
        "status",
        "firstName",
        "lastName",
        "roles",
        "department",
        "division",
        "branch",
        "unit",
        "mailcode",
        "manager",
        "lastSyncSuccessAt",
        "createdAt",
        "updatedAt",
      ]),
      displayName: `${this.record.firstName} ${this.record.lastName}`,
    }
  }
}

export default UsersSerializer
