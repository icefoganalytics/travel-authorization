import { type NextFunction, type Request, type Response } from "express"
import enhancedQsDecoder from "@/utils/enhanced-qs-decoder"

export function betterFormDataBodyParserMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  if (
    req.headers["content-type"]?.includes("multipart/form-data") &&
    req.body &&
    typeof req.body === "object"
  ) {
    req.body = enhancedQsDecoder(req.body)
  }
  next()
}

export default betterFormDataBodyParserMiddleware
