import http from "@/api/http-client"
import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"

/** Keep in sync with api/src/models/travel-desk-question.ts */
export enum TravelDeskQuestionsRequestTypes {
  FLIGHT = "flight",
  HOTEL = "hotel",
  TRANSPORTATION = "transportation",
  RENTAL_CAR = "rental_car",
}

/** @deprecated - prefer enum equivalent `TravelDeskQuestionsRequestTypes` */
export const TRAVEL_DESK_QUESTION_REQUEST_TYPES = Object.freeze({
  FLIGHT: "flight",
  HOTEL: "hotel",
  TRANSPORTATION: "transportation",
  RENTAL_CAR: "rental_car",
})

/** Keep in sync with api/src/models/travel-desk-question.ts */
export type TravelDeskQuestion = {
  id: number
  travelRequestId: number
  requestType: string
  question: string
  response: string | null
  createdAt: string
  updatedAt: string
}

export type TravelDeskQuestionWhereOptions = WhereOptions<
  TravelDeskQuestion,
  "id" | "travelRequestId" | "requestType"
>

/** must match model scopes */
export type TravelDeskQuestionFiltersOptions = FiltersOptions<Record<never, never>>

export type TravelDeskQuestionsQueryOptions = QueryOptions<
  TravelDeskQuestionWhereOptions,
  TravelDeskQuestionFiltersOptions
>

export const travelDeskQuestionsApi = {
  REQUEST_TYPES: TRAVEL_DESK_QUESTION_REQUEST_TYPES,

  async list(params: TravelDeskQuestionsQueryOptions = {}): Promise<{
    travelDeskQuestions: TravelDeskQuestion[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/travel-desk-questions", {
      params,
    })
    return data
  },

  async get(travelDeskQuestionId: number): Promise<{
    travelDeskQuestion: TravelDeskQuestion
    policy: Policy
  }> {
    const { data } = await http.get(`/api/travel-desk-questions/${travelDeskQuestionId}`)
    return data
  },

  async create(attributes: Partial<TravelDeskQuestion>): Promise<{
    travelDeskQuestion: TravelDeskQuestion
  }> {
    const { data } = await http.post("/api/travel-desk-questions", attributes)
    return data
  },

  async update(
    travelDeskQuestionId: number,
    attributes: Partial<TravelDeskQuestion>
  ): Promise<{
    travelDeskQuestion: TravelDeskQuestion
  }> {
    const { data } = await http.patch(
      `/api/travel-desk-questions/${travelDeskQuestionId}`,
      attributes
    )
    return data
  },

  async delete(travelDeskQuestionId: number): Promise<void> {
    await http.delete(`/api/travel-desk-questions/${travelDeskQuestionId}`)
  },
}

export default travelDeskQuestionsApi
