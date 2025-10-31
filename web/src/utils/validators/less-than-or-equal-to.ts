export function lessThanOrEqualTo(
  b: number,
  { referenceFieldLabel }: { referenceFieldLabel?: string } = {}
) {
  return (a: number) => {
    return a <= b || `This field must be less than or equal to ${referenceFieldLabel || b}`
  }
}

export default lessThanOrEqualTo
