import http from "@/api/http-client"

import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"
import { type AttachmentAsReference } from "@/api/attachments-api"

/** @deprecated - prefer enum equivalent `Types` */
export const TYPES = Object.freeze({
  ESTIMATE: "Estimate",
  EXPENSE: "Expense",
})

export enum Types {
  ESTIMATE = "Estimate",
  EXPENSE = "Expense",
}

/** @deprecated - prefer enum equivalent `ExpenseTypes` */
export const EXPENSE_TYPES = Object.freeze({
  ACCOMMODATIONS: "Accommodations",
  TRANSPORTATION: "Transportation",
  MEALS_AND_INCIDENTALS: "Meals & Incidentals",
  NON_TRAVEL_STATUS: "Non-Travel Status",
})

export enum ExpenseTypes {
  ACCOMMODATIONS = "Accommodations",
  TRANSPORTATION = "Transportation",
  MEALS_AND_INCIDENTALS = "Meals & Incidentals",
  NON_TRAVEL_STATUS = "Non-Travel Status",
}

/** Keep in sync with api/src/models/expense.ts */
export type Expense = {
  id: number
  travelAuthorizationId: number
  description: string
  date: string | null
  cost: number
  currency: string
  type: Types
  expenseType: ExpenseTypes
  createdAt: string
  updatedAt: string
}

export type ExpenseAsIndex = Expense & {
  receipt: AttachmentAsReference | null
}

export type ExpenseWhereOptions = WhereOptions<
  Expense,
  "id" | "travelAuthorizationId" | "date" | "currency" | "type" | "expenseType"
>

export type ExpenseFiltersOptions = FiltersOptions<{
  // add as needed
}>

export type ExpenseQueryOptions = QueryOptions<ExpenseWhereOptions, ExpenseFiltersOptions>

export const expensesApi = {
  TYPES,
  EXPENSE_TYPES,

  async list(params: ExpenseQueryOptions = {}): Promise<{
    expenses: ExpenseAsIndex[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/expenses", { params })
    return data
  },
  async get(expenseId: number): Promise<{
    expense: Expense
    policy: Policy
  }> {
    const { data } = await http.get(`/api/expenses/${expenseId}`)
    return data
  },
  async create(attributes: Partial<Expense>): Promise<{
    expense: Expense
  }> {
    const { data } = await http.post("/api/expenses", attributes)
    return data
  },
  async update(
    expenseId: number,
    attributes: Partial<Expense>
  ): Promise<{
    expense: Expense
    policy: Policy
  }> {
    const { data } = await http.patch(`/api/expenses/${expenseId}`, attributes)
    return data
  },
  async delete(expenseId: number): Promise<void> {
    const { data } = await http.delete(`/api/expenses/${expenseId}`)
    return data
  },
  async upload(
    expenseId: number,
    file: File
  ): Promise<{
    expense: Expense
  }> {
    const formData = new FormData()
    formData.append("receipt", file)
    const { data } = await http.post(`/api/expenses/${expenseId}/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    return data
  },
  /**
   * TODO: switch this to use more traditional download pattern
   */
  async download(expenseId: number): Promise<{
    expense: {
      id: number
      receiptImage: Blob
      fileName: string
    }
  }> {
    const response = await http.get(`/api/expenses/${expenseId}/upload`, {
      responseType: "blob",
    })
    // NOTE: requires exposing Content-Disposition header in api response or CORS config.
    // Matches format set in api/src/controllers/expenses/upload-controller.ts
    const fileName = response.headers["content-disposition"].split("filename=")[1]
    return {
      expense: {
        id: expenseId,
        receiptImage: response.data,
        fileName,
      },
    }
  },
}

export default expensesApi
