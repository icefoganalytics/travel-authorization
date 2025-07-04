import { DataTypes } from "@sequelize/core"
import { DateTime } from "luxon"

export class DATETIME extends DataTypes.ABSTRACT<Date> {
  toSql() {
    return "DATETIME"
  }

  stringify(value: Date | string | number): string {
    if (typeof value === "string") {
      return value
    } else if (typeof value === "number") {
      const date = new Date(value)
      const datetime = DateTime.fromJSDate(date)
      return datetime.toFormat("yyyy-MM-dd HH:mm:ss")
    }

    const datetime = DateTime.fromJSDate(value)
    return datetime.toFormat("yyyy-MM-dd HH:mm:ss")
  }
}

export default DATETIME
