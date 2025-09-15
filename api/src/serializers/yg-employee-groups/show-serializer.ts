import { pick } from "lodash"

import { YgEmployeeGroup, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type YgEmployeeGroupShowView = Pick<
  YgEmployeeGroup,
  | "id"
  | "department"
  | "division"
  | "branch"
  | "unit"
  | "order"
  | "lastSyncSuccessAt"
  | "lastSyncFailureAt"
  | "createdAt"
  | "updatedAt"
>

export class ShowSerializer extends BaseSerializer<YgEmployeeGroup> {
  constructor(
    protected record: YgEmployeeGroup,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): YgEmployeeGroupShowView {
    return {
      ...pick(this.record, [
        "id",
        "department",
        "division",
        "branch",
        "unit",
        "order",
        "lastSyncSuccessAt",
        "lastSyncFailureAt",
        "createdAt",
        "updatedAt",
      ]),
    }
  }
}

export default ShowSerializer
