import { DataTypes } from "@sequelize/core"

/** Matches legacy datetime columns while preserving the client's UTC interpretation. */
export class UtcSqlServerDateTime extends DataTypes.DATE {
  toSql(): string {
    return "DATETIME"
  }

  toBindableValue(value: Date): string {
    return value.toISOString().slice(0, -1)
  }
}
