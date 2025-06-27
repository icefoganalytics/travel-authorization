import { Utils } from "@sequelize/core"
import { DateTime } from "luxon"

import ABSTRACT from "@/integrations/trav-com-integration/db/mssql-type-extensions/abstract"

class MSSQL_DATETIME extends ABSTRACT {
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

// Wrap it on `Utils.classToInvokable` to be able to use this datatype directly without having to call `new` on it.
export const DATETIME = Utils.classToInvokable(MSSQL_DATETIME)

export default DATETIME
