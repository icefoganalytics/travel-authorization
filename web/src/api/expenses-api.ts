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

export enum ExpenseTypes {
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

export enum ExpenseExpenseTypes {
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
  type: ExpenseTypes
  expenseType: ExpenseExpenseTypes
  approverId: number | null
  approvedAt: string | null
  rejectorId: number | null
  rejectedAt: string | null
  rejectionNote: string | null
  createdAt: string
  updatedAt: string
}

export type ExpenseAsIndex = Expense & {
  receipt: AttachmentAsReference | null
}

export type ExpenseAsShow = Expense & {
  receipt: AttachmentAsReference | null
}

export type ExpenseAsReference = Pick<
  Expense,
  | "id"
  | "travelAuthorizationId"
  | "description"
  | "date"
  | "cost"
  | "currency"
  | "type"
  | "expenseType"
  | "createdAt"
  | "updatedAt"
>

export type ExpensePolicy = Policy

export type ExpenseWhereOptions = WhereOptions<
  Expense,
  "id" | "travelAuthorizationId" | "date" | "currency" | "type" | "expenseType"
>

/** add as needed, must match model scopes */
export type ExpenseFiltersOptions = FiltersOptions<{
  isExpenseClaimApproved: boolean
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
    expense: ExpenseAsShow
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
    attributes: Partial<ExpenseAsShow>
  ): Promise<{
    expense: ExpenseAsShow
    policy: Policy
  }> {
    const { data } = await http.patch(`/api/expenses/${expenseId}`, attributes)
    return data
  },
  async delete(expenseId: number): Promise<void> {
    const { data } = await http.delete(`/api/expenses/${expenseId}`)
    return data
  },
}

export default expensesApi
