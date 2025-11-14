import { DataTypes } from "@sequelize/core"
import { DateTime } from "luxon"

/**
 * See https://sequelize.org/docs/v7/other-topics/extending-data-types/
 */
export class DATETIME extends DataTypes.ABSTRACT<Date> {
  toSql() {
    return "DATETIME"
  }

  toBindableValue(value: Date | string | number): string {
    if (typeof value === "string") {
      return DateTime.fromISO(value).toFormat("yyyy-MM-dd HH:mm:ss")
    } else if (typeof value === "number") {
      return DateTime.fromMillis(value).toFormat("yyyy-MM-dd HH:mm:ss")
    } else if (value instanceof Date) {
      return DateTime.fromJSDate(value).toFormat("yyyy-MM-dd HH:mm:ss")
    }

    throw new Error(
      `Unsupported value type: ${value} -> ${typeof value} -> ${JSON.stringify(value)}`
    )
  }
}

export default DATETIME
