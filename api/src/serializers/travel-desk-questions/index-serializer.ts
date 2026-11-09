import { pick } from "lodash"

import { TravelDeskQuestion } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelDeskQuestionAsIndex = Pick<
  TravelDeskQuestion,
  "id" | "travelRequestId" | "requestType" | "question" | "response" | "createdAt" | "updatedAt"
>

export class IndexSerializer extends BaseSerializer<TravelDeskQuestion> {
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
