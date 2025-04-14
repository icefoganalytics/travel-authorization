export const isInteger = (v) => {
  return v == 0 || Number.isInteger(Number(v)) || "This field must be a number"
}

export default isInteger
