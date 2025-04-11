export function lessThan(b, { referenceFieldLabel } = {}) {
  return (a) => {
    return a < b || `This field must be less than ${referenceFieldLabel || b}`
  }
}

export default lessThan
