import { pick } from "lodash"

import { TravelAuthorizationActionLog, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelAuthorizationActionLogAsIndex = Pick<
  TravelAuthorizationActionLog,
  | "id"
  | "travelAuthorizationId"
  | "actorId"
  | "assigneeId"
  | "action"
  | "note"
  | "createdAt"
  | "updatedAt"
>

export class IndexSerializer extends BaseSerializer<TravelAuthorizationActionLog> {
  constructor(
    protected record: TravelAuthorizationActionLog,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): TravelAuthorizationActionLogAsIndex {
    return pick(this.record, [
      "id",
      "travelAuthorizationId",
      "actorId",
      "assigneeId",
      "action",
      "note",
      "createdAt",
      "updatedAt",
    ])
  }
}

export default IndexSerializer
