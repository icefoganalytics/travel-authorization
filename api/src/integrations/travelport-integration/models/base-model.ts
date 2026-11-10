import { Model, type Attributes, type FindOptions, type ModelStatic } from "@sequelize/core"

export class BaseModel<T extends object, C extends object = T> extends Model<T, C> {
  // Callers must supply a deterministic order ending in a unique key.
  static async findEach<M extends Model>(
    this: ModelStatic<M>,
    options: FindOptions<Attributes<M>> & { batchSize?: number },
    processRecord: (record: M) => Promise<void>
  ): Promise<void> {
    const { batchSize = 1000, ...findOptions } = options
    let offset = 0
    let hasMoreRecords = true

    while (hasMoreRecords) {
      const records = await this.findAll({ ...findOptions, limit: batchSize, offset })
      for (const record of records) {
        await processRecord(record)
      }

      hasMoreRecords = records.length === batchSize
      offset += records.length
    }
  }
}

export default BaseModel
