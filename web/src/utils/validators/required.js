import { isNull, isUndefined, isArray, isString, isObject, isEmpty } from "lodash"

export const required = (v) => {
  if (isNull(v) || isUndefined(v)) {
    return "This field is required"
  }

  if (v instanceof File) {
    return v.size > 0 || "This field is required"
  }

  if ((isArray(v) || isString(v) || isObject(v)) && isEmpty(v)) {
    return "This field is required"
  }

  return true
}

export default required
