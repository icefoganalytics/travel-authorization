import { pick } from "lodash"

import { User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type UserAsReference = Pick<
  User,
  | "id"
  | "email"
  | "status"
  | "firstName"
  | "lastName"
  | "roles"
  | "department"
  | "division"
  | "branch"
  | "unit"
  | "mailcode"
  | "manager"
  | "lastSyncSuccessAt"
  | "createdAt"
  | "updatedAt"
> & { displayName: string }

export class ReferenceSerializer extends BaseSerializer<User> {
  perform(): UserAsReference {
    const { firstName, lastName } = this.record
    const displayName = [firstName, lastName].filter(Boolean).join(" ")

    return {
      // Note that "sub" (Auth0 subject attribute) is a restricted field.
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
      displayName,
    }
  }
}

export default ReferenceSerializer
