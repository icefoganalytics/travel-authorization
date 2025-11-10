import { DataTypes } from "@sequelize/core"
import { DateTime } from "luxon"

/**
 * See https://sequelize.org/docs/v7/other-topics/extending-data-types/
 */
export class DATETIME extends DataTypes.ABSTRACT<Date> {
  toSql() {
    return "DATETIME"
  }

  toBindableValue(value: Date): string {
    return DateTime.fromJSDate(value).toFormat("yyyy-MM-dd HH:mm:ss")
  }
}

export default DATETIME
