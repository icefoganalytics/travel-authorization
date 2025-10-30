import http from "@/api/http-client"

import type { Policy } from "@/api/base-api"
import { type UserDetailedView, USER_ROLES, UserRoles } from "@/api/users-api"

export { type UserDetailedView, USER_ROLES, UserRoles }

export const currentUserApi = {
  ROLES: USER_ROLES,

  async get(): Promise<{
    user: UserDetailedView
    policy: Policy
  }> {
    const { data } = await http.get("/api/current-user")
    return data
  },
}

export default currentUserApi
