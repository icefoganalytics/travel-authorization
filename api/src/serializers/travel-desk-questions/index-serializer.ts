import { pick } from "lodash"

import { TravelDeskQuestion, User } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelDeskQuestionAsIndex = Pick<
  TravelDeskQuestion,
  "id" | "travelRequestId" | "requestType" | "question" | "response" | "createdAt" | "updatedAt"
>

export class IndexSerializer extends BaseSerializer<TravelDeskQuestion> {
  constructor(
    protected record: TravelDeskQuestion,
    protected currentUser: User
  ) {
    super(record)
  }

  perform(): TravelDeskQuestionAsIndex {
    return {
      ...pick(this.record, [
        "id",
        "travelRequestId",
        "requestType",
        "question",
        "response",
        "createdAt",
        "updatedAt",
      ]),
    }
  }
}

export default IndexSerializer
