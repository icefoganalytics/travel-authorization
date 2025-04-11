import http from "@/api/http-client"

/** @typedef {import('@/api/base-api.js').Policy} Policy */
/** @typedef {import("@/api/base-api").ModelOrder} ModelOrder */

// Must match types in src/api/models/expense.ts
export const TYPES = Object.freeze({
  ESTIMATE: "Estimate",
  EXPENSE: "Expense",
})

/** @typedef {TYPES[keyof TYPES]} Types */

export const EXPENSE_TYPES = Object.freeze({
  ACCOMMODATIONS: "Accommodations",
  TRANSPORTATION: "Transportation",
  MEALS_AND_INCIDENTALS: "Meals & Incidentals",
  NON_TRAVEL_STATUS: "Non-Travel Status",
})

/** @typedef {EXPENSE_TYPES[keyof EXPENSE_TYPES]} ExpenseTypes */

/**
 * Keep in sync with api/src/models/expense.ts
 * @typedef {{
 *   id: number;
 *   travelAuthorizationId: number;
 *   description: string;
 *   date: string | null;
 *   cost: number;
 *   currency: string;
 *   type: Types;
 *   receiptImage: Blob | null;
 *   fileSize: number | null;
 *   fileName: string | null;
 *   expenseType: ExpenseTypes;
 *   createdAt: string;
 *   updatedAt: string;
 * }} Expense
 */

/**
 * @typedef {{
 *   id?: number;
 *   travelAuthorizationId?: number;
 *   date?: string | null;
 *   currency?: string;
 *   type?: Types;
 *   expenseType?: ExpenseTypes;
 * }} ExpenseWhereOptions
 */

/**
 * Must match model scopes signatures
 * @typedef {{
 * }} ExpenseFiltersOptions
 */

/**
 * @typedef {{
 *   where?: ExpenseWhereOptions;
 *   filters?: ExpenseFiltersOptions;
 *   order?: ModelOrder[];
 *   page?: number;
 *   perPage?: number
 * }} ExpenseQueryOptions
 */

export const expensesApi = {
  TYPES,
  EXPENSE_TYPES,
  /**
   *
   * @param {ExpenseQueryOptions} [params={}]
   * @returns
   */
  async list(params = {}) {
    const { data } = await http.get("/api/expenses", { params })
    return data
  },
  /**
   * @param {number} expenseId
   * @returns {Promise<{
   *   expense: Expense;
   *   policy: Policy;
   * }>}
   */
  async get(expenseId) {
    const { data } = await http.get(`/api/expenses/${expenseId}`)
    return data
  },
  /**
   * @param {Partial<Expense>} attributes
   * @returns {Promise<{
   *   expense: Expense;
   * }>}
   */
  async create(attributes) {
    const { data } = await http.post("/api/expenses", attributes)
    return data
  },
  /**
   * @param {number} expenseId
   * @param {Partial<Expense>} attributes
   * @returns {Promise<{
   *   expense: Expense;
   *   policy: Policy;
   * }>}
   */
  async update(expenseId, attributes) {
    const { data } = await http.patch(`/api/expenses/${expenseId}`, attributes)
    return data
  },
  /**
   * @param {number} expenseId
   * @returns {Promise<void>}
   */
  async delete(expenseId) {
    const { data } = await http.delete(`/api/expenses/${expenseId}`)
    return data
  },
  /**
   * @param {number} expenseId
   * @param {File} file
   * @returns {Promise<void>}
   */
  async upload(expenseId, file) {
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
   * @param {number} expenseId
   * @returns {Promise<{
   *   expense: {
   *     id: number;
   *     receiptImage: Blob;
   *     fileName: string;
   *   };
   *   policy: Policy;
   * }>}
   */
  async download(expenseId) {
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
