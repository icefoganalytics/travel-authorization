import type { User } from "@/models"

import "express-fileupload"
import "express-openid-connect"

declare global {
  namespace Express {
    export interface Request {
      user?: User
      store?: unknown

      isAuthenticated(): boolean
    }
  }
}
