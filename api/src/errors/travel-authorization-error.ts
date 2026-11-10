export type TravelAuthorizationErrorOptions = {
  debugContext?: Record<string, unknown>
}

export class TravelAuthorizationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = new.target.name
  }
}

export default TravelAuthorizationError
