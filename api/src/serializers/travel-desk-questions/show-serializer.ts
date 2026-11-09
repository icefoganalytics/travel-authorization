import { pick } from "lodash"

import { TravelDeskQuestion } from "@/models"
import BaseSerializer from "@/serializers/base-serializer"

export type TravelDeskQuestionAsShow = Pick<
  TravelDeskQuestion,
  "id" | "travelRequestId" | "requestType" | "question" | "response" | "createdAt" | "updatedAt"
>

export class ShowSerializer extends BaseSerializer<TravelDeskQuestion> {
  perform(): TravelDeskQuestionAsShow {
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

export default ShowSerializer
