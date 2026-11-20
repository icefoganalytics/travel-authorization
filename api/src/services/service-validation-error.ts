import BaseServiceError from "@/services/base-service-error"

export class ServiceValidationError extends BaseServiceError {
  readonly field?: string

  constructor(details: string | { field: string; text: string }) {
    super(typeof details === "string" ? details : details.text)
    if (typeof details !== "string") this.field = details.field
  }
}

export default ServiceValidationError
