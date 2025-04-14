export function greaterThanOrEqualTo(b, { referenceFieldLabel } = {}) {
  return (a) => {
    return a >= b || `This field must be greater than or equal to ${referenceFieldLabel || b}`
  }
}

export default greaterThanOrEqualTo
