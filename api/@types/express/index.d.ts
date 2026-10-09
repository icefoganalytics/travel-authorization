namespace Express {
  export interface Request {
    user?: any
    store?: any
    oidc?: any

    isAuthenticated(): boolean

    // express-fileupload
    files?: Record<string, any>
  }
}
