import type { User } from "@/models"

import "express-fileupload"

declare global {
  namespace Express {
    export interface Request {
      user?: User

      isAuthenticated(): boolean
    }
  }
}
