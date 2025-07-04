import { pick } from "lodash"

import { YgEmployee, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type YgEmployeeIndexView = Pick<
  YgEmployee,
  | "id"
  | "firstName"
  | "lastName"
  | "department"
  | "fullName"
  | "email"
  | "lastSyncSuccessAt"
  | "lastSyncFailureAt"
  | "createdAt"
  | "updatedAt"
> & {
  businessPhone: YgEmployee["phoneOffice"]
}

export class IndexSerializer extends BaseSerializer<YgEmployee> {
  constructor(
    protected record: YgEmployee,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): YgEmployeeIndexView {
    return {
      ...pick(this.record, [
        "id",
        "firstName",
        "lastName",
        "department",
        "fullName",
        "email",
        "lastSyncSuccessAt",
        "lastSyncFailureAt",
        "createdAt",
        "updatedAt",
      ]),
      businessPhone: this.record.phoneOffice,
    }
  }
}

export default IndexSerializer
