import { NextFunction, Request, Response } from "express"
import { Attributes, col, Model, Order, WhereOptions } from "sequelize"
import { type Col } from "sequelize/lib/utils"
import { isEmpty, isNil } from "lodash"

import { AuthorizedRequest } from "@/middleware/authorization-middleware"
import User from "@/models/user"
import { type BaseScopeOptions } from "@/policies"

export type Actions = "index" | "show" | "new" | "edit" | "create" | "update" | "destroy"

/** Keep in sync with web/src/api/base-api.ts */
export type ModelOrder = Order & [string, string]

// Keep in sync with web/src/api/base-api.ts
const MAX_PER_PAGE = 1000
const MAX_PER_PAGE_EQUIVALENT = -1
const DEFAULT_PER_PAGE = 10

export type QueryOptions = {
  where?: Record<string, unknown>
  filters?: Record<string, unknown>
  order?: ModelOrder
  page?: number
  perPage?: number | 1000 | -1
}

/**
 * See https://guides.rubyonrails.org/routing.html#crud-verbs-and-actions
 *
 * Usage:
 * ```ts
 * router
 *   .route("/api/users")
 *   .get(UsersController.index)
 *   .post(UsersController.create)
 * route
 *   .route("/api/users/:userId")
 *   .get(UsersController.show)
 *   .patch(UsersController.update)
 *   .delete(UsersController.destroy)
 * ```
 * or
 * ```ts
 * router.get("/api/users", UsersController.index)
 * // etc
 * ```
 *
 * ```ts
 * router.route("/api/users").get(UsersController.index)
 * ```
 * maps `/api/users` to `UsersController#index` method.
 */
export class BaseController<TModel extends Model = never> {
  protected request: AuthorizedRequest
  protected response: Response
  protected next: NextFunction

  constructor(req: Request, res: Response, next: NextFunction) {
    // Assumes authorization has occured first in
    // api/src/middlewares/jwt-middleware.ts and api/src/middlewares/authorization-middleware.ts
    // At some future point it would make sense to do all that logic as
    // controller actions
    this.request = req as AuthorizedRequest
    this.response = res
    this.next = next
  }

  /**
   * Usage:
   * ```ts
   * router.route("/api/users").get(UsersController.index)
   * ```
   * or
   * ```ts
   * router.get("/api/users", UsersController.index)
   * ```
   */
  static get index() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const controllerInstance = new this(req, res, next)
      return controllerInstance.index().catch(next)
    }
  }

  /**
   * Usage:
   * ```ts
   * router.route("/api/users").post(UsersController.create)
   * ```
   * or
   * ```ts
   * router.post("/api/users", UsersController.create)
   * ```
   */
  static get create() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const controllerInstance = new this(req, res, next)
      return controllerInstance.create().catch(next)
    }
  }

  /**
   * Usage:
   * ```ts
   * router.route("/api/users/:userId").get(UsersController.show)
   * ```
   * or
   * ```ts
   * router.get("/api/users/:userId", UsersController.show)
   * ```
   */
  static get show() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const controllerInstance = new this(req, res, next)
      return controllerInstance.show().catch(next)
    }
  }

  static get update() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const controllerInstance = new this(req, res, next)
      return controllerInstance.update().catch(next)
    }
  }

  static get destroy() {
    return async (req: Request, res: Response, next: NextFunction) => {
      const controllerInstance = new this(req, res, next)
      return controllerInstance.destroy().catch(next)
    }
  }

  index(): Promise<unknown> {
    throw new Error("Not Implemented")
  }

  create(): Promise<unknown> {
    throw new Error("Not Implemented")
  }

  show(): Promise<unknown> {
    throw new Error("Not Implemented")
  }

  update(): Promise<unknown> {
    throw new Error("Not Implemented")
  }

  destroy(): Promise<unknown> {
    throw new Error("Not Implemented")
  }

  // Internal helpers

  // This should have been loaded in the authorization middleware
  // Currently assuming that authorization happens before this controller gets called.
  // Child controllers that are on an non-authorizable route should override this method
  // and return undefined
  get currentUser(): User {
    return this.request.user
  }

  get params() {
    return this.request.params
  }

  get query() {
    return this.request.query
  }

  get pagination() {
    const page = parseInt(this.query.page?.toString() || "") || 1
    const perPage = parseInt(this.query.perPage?.toString() || "") || DEFAULT_PER_PAGE
    const limit = this.determineLimit(perPage)
    const offset = (page - 1) * limit
    return {
      page,
      perPage,
      limit,
      offset,
    }
  }

  buildWhere<TModelOverride extends Model = TModel>(
    overridableOptions: WhereOptions<Attributes<TModelOverride>> = {},
    nonOverridableOptions: WhereOptions<Attributes<TModelOverride>> = {}
  ): WhereOptions<Attributes<TModelOverride>> {
    // TODO: consider if we should add parsing of Sequelize [Op.is] and [Op.not] here
    // or in the api/src/utils/enhanced-qs-decoder.ts function
    const queryWhere = this.query.where as WhereOptions<Attributes<TModelOverride>>
    return {
      ...overridableOptions,
      ...queryWhere,
      ...nonOverridableOptions,
    } as WhereOptions<Attributes<TModelOverride>>
  }

  buildFilterScopes<FilterOptions extends Record<string, unknown>>(
    initialScopes: BaseScopeOptions[] = []
  ): BaseScopeOptions[] {
    const filters = this.query.filters as FilterOptions
    const scopes = initialScopes
    if (!isEmpty(filters)) {
      Object.entries(filters).forEach(([key, value]) => {
        scopes.push({ method: [key, value] })
      })
    }

    return scopes
  }

  buildOrder(
    overridableOrder: ModelOrder[] = [],
    nonOverridableOrder: ModelOrder[] = []
  ): [Col, string][] | undefined {
    const orderQuery = this.query.order as unknown as ModelOrder[] | undefined

    if (isNil(orderQuery)) {
      const rawOrder = [...nonOverridableOrder, ...overridableOrder]
      const orderAsColumns = this.columnifyOrderings(rawOrder)
      return orderAsColumns
    }

    const rawOrder = [...nonOverridableOrder, ...orderQuery, ...overridableOrder]
    const orderAsColumns = this.columnifyOrderings(rawOrder)
    return orderAsColumns
  }

  private determineLimit(perPage: number) {
    if (perPage === MAX_PER_PAGE_EQUIVALENT) {
      return MAX_PER_PAGE
    }

    return Math.max(1, Math.min(perPage, MAX_PER_PAGE))
  }

  private columnifyOrderings(orderings: ModelOrder[]) {
    return orderings.map<[Col, string]>(([column, order]) => {
      if (typeof column === "string") {
        return [col(column), order]
      }

      return [column, order]
    })
  }
}

export default BaseController
