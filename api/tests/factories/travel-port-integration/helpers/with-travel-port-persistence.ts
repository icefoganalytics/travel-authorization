import { Model, type ModelStatic } from "@sequelize/core"
import type { FactoryInterface } from "factory-shark"

import travelPortMigrationClient from "@/integrations/travel-port-integration/db/db-migration-client"

/**
 * Persists synthetic external-source fixtures without Sequelize's datetime encoding.
 * Sequelize validation and save hooks are bypassed; factory lifecycle hooks are retained.
 */
export function withTravelPortPersistence<T extends Model>(
  model: ModelStatic<T>,
  factory: FactoryInterface<T>
) {
  return factory.onCreate(async (record) => {
    const columns: Record<string, unknown> = {}
    for (const [name, attribute] of Object.entries(model.getAttributes())) {
      const value = record.get(name)
      if (value !== undefined) {
        columns[attribute.columnName ?? name] = value
      }
    }
    const { table } = model
    await travelPortMigrationClient.table(table.tableName).insert(columns)
    record.isNewRecord = false
    return record
  })
}

export default withTravelPortPersistence
