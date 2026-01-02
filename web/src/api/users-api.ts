import { isString } from "lodash"

import http from "@/api/http-client"

import debounceWithArgsCache from "@/utils/debounce-with-args-cache"
import {
  type FiltersOptions,
  type Policy,
  type QueryOptions,
  type WhereOptions,
} from "@/api/base-api"

export enum UserRoles {
  ADMIN = "admin",
  DEPARTMENT_ADMIN = "department_admin",
  FINANCE_USER = "finance_user",
  PRE_APPROVED_TRAVEL_ADMIN = "pre_approved_travel_admin",
  TRAVEL_DESK_USER = "travel_desk_user",
  USER = "user",
}

/**
 * sub - Auth0 subject attribute
 * Keep in sync with api/src/models/user.ts
 */
export type User = {
  id: number
  sub: string
  email: string
  status: string
  firstName: string | null
  lastName: string | null
  roles: UserRoles[]
  department: string | null
  division: string | null
  branch: string | null
  unit: string | null
  mailcode: string | null
  manager: string | null
  lastSyncSuccessAt: string | null
  lastSyncFailureAt: string | null
  createdAt: string
  updatedAt: string
}

export type UserDetailedView = User & {
  displayName: string
}

export type UserAsReference = Pick<
  User,
  | "id"
  | "email"
  | "status"
  | "firstName"
  | "lastName"
  | "roles"
  | "department"
  | "division"
  | "branch"
  | "unit"
  | "mailcode"
  | "manager"
  | "lastSyncSuccessAt"
  | "createdAt"
  | "updatedAt"
> & { displayName: string }

/** Keep in sync with api/src/models/user.ts */
export type UserWhereOptions = WhereOptions<
  User,
  | "id"
  | "sub"
  | "email"
  | "status"
  | "firstName"
  | "lastName"
  | "roles"
  | "department"
  | "division"
  | "branch"
  | "unit"
  | "mailcode"
  | "manager"
>

/** add as needed, must match model scopes */
export type UserFiltersOptions = FiltersOptions<{
  search: string | string[]
  isTravelDeskUser: boolean
}>

export type UserQueryOptions = QueryOptions<UserWhereOptions, UserFiltersOptions>

export const usersApi = {
  async list(params: UserQueryOptions = {}): Promise<{
    users: User[]
    totalCount: number
  }> {
    const { data } = await http.get("/api/users", { params })
    return data
  },

  async get(userId: number): Promise<{
    user: UserDetailedView
    policy: Policy
  }> {
    const { data } = await http.get(`/api/users/${userId}`)
    return data
  },

  async update(
    userId: number,
    attributes: Partial<User>
  ): Promise<{
    user: UserDetailedView
    policy: Policy
  }> {
    const { data } = await http.patch(`/api/users/${userId}`, attributes)
    return data
  },

  /** @deprecated - prefer web/src/api/current-user-api.js */
  async me(): Promise<{
    user: UserDetailedView
  }> {
    const { data } = await http.get("/api/user/me")
    return data
  },

  /**
   * @deprecated - prefer web/src/api/users-api.js with filter param.
   *
   * TODO: update to newer pattern of list + search filter param.
   * Or move this to a new api endpoint specific to ActiveDirectory lookups.
   */
  async search(
    params: {
      email?: string
      [key: string]: unknown
    } = {}
  ): Promise<{ emails: string[] }> {
    const { email, ...otherParams } = params
    if (isString(email) && email.length >= 3) {
      const { data } = await http.get("/api/lookup/emailList", { params: { email, otherParams } })
      return { emails: data }
    } else {
      return Promise.resolve({ emails: [] })
    }
  },

  async ygGovernmentDirectorySync(userId: number): Promise<{
    user: UserDetailedView
    policy: Policy
  }> {
    const { data } = await http.post(`/api/users/${userId}/yg-government-directory-sync`)
    return data
  },
}

usersApi.get = debounceWithArgsCache(usersApi.get)

export default usersApi
