import { Model, type ModelStatic } from "@sequelize/core"
import type { FactoryInterface, FactoryParams } from "factory-shark"

import sourceDatabase from "@/integrations/travel-port-integration/db/db-migration-client"

/**
 * Persists synthetic external-source fixtures without Sequelize's datetime encoding.
 * Only build/create are supported; Sequelize validation and save hooks are bypassed.
 * Replace with upstream factory support when TravelAuth issue #468 is resolved.
 */
export function withTravelPortPersistence<T extends Model>(
  model: ModelStatic<T>,
  factory: FactoryInterface<T>
) {
  return {
    build(params?: FactoryParams<T>): T {
      return factory.build(params)
    },
    async create(params?: FactoryParams<T>): Promise<T> {
      const record = factory.build(params)
      const columns: Record<string, unknown> = {}
      for (const [name, attribute] of Object.entries(model.getAttributes())) {
        const value = record.get(name)
        if (value !== undefined) {
          columns[attribute.columnName ?? name] = value
        }
      }
      const table = model.table
      await sourceDatabase.table(table.tableName).insert(columns)
      record.isNewRecord = false
      return record
    },
  }
}

export default withTravelPortPersistence
