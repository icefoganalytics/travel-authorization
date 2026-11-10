import { TravelAuthorizationError, type TravelAuthorizationErrorOptions } from "@/errors"

export type BaseServiceErrorOptions = TravelAuthorizationErrorOptions

/**
 * Base class for expected service-layer domain failures.
 *
 * Messages must be safe to return to end users. Keep technical details in debugContext.
 */
export class BaseServiceError extends TravelAuthorizationError {
  /** Technical context for logs and debugging; never return directly in API responses. */
  readonly debugContext?: Record<string, unknown>

  constructor(message: string, { debugContext }: BaseServiceErrorOptions = {}) {
    super(message)
    this.debugContext = debugContext
  }
}

export default BaseServiceError
