import http from "@/api/http-client"

import type { Policy } from "@/api/base-api"
import { type UserDetailedView, UserRoles } from "@/api/users-api"

export { type UserDetailedView, UserRoles }

export const currentUserApi = {
  async get(): Promise<{
    user: UserDetailedView
    policy: Policy
  }> {
    const { data } = await http.get("/api/current-user")
    return data
  },
}

export default currentUserApi
