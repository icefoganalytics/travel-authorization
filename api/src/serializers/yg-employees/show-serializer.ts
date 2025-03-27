import { pick } from "lodash"

import { YgEmployee, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type YgEmployeeShowView = Pick<
  YgEmployee,
  | "id"
  | "firstName"
  | "lastName"
  | "department"
  | "fullName"
  | "email"
  | "mobile"
  | "office"
  | "address"
  | "community"
  | "postalCode"
  | "lastSyncSuccessAt"
  | "lastSyncFailureAt"
  | "createdAt"
  | "updatedAt"
> & {
  businessPhone: YgEmployee["phoneOffice"]
}

export class ShowSerializer extends BaseSerializer<YgEmployee> {
  constructor(
    protected record: YgEmployee,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): YgEmployeeShowView {
    return {
      ...pick(this.record.dataValues, [
        "id",
        "firstName",
        "lastName",
        "department",
        "fullName",
        "email",
        "mobile",
        "office",
        "address",
        "community",
        "postalCode",
        "lastSyncSuccessAt",
        "lastSyncFailureAt",
        "createdAt",
        "updatedAt",
      ]),
      businessPhone: this.record.phoneOffice,
    }
  }
}

export default ShowSerializer
