import {
  Attributes,
  BulkCreateOptions,
  CreationAttributes,
  FindOptions,
  Model,
  ModelStatic,
  ScopeOptions,
  WhereOptions,
} from "@sequelize/core"
import { AllowReadonlyArray, Nullish } from "@sequelize/utils"

import { type AttributeNames } from "@/utils/utility-types"
import searchFieldsByTermsFactory from "@/utils/search-fields-by-terms-factory"

type BaseModelStatic<M extends BaseModel> = typeof BaseModel & ModelStatic<M>

// See api/node_modules/@sequelize/core/lib/model.d.ts -> Model
export abstract class BaseModel<
  // eslint-disable-next-line @typescript-eslint/ban-types, @typescript-eslint/no-explicit-any
  TModelAttributes extends {} = any,
  // eslint-disable-next-line @typescript-eslint/ban-types
  TCreationAttributes extends {} = TModelAttributes,
> extends Model<TModelAttributes, TCreationAttributes> {
  public static withScope<M extends BaseModel>(
    this: ModelStatic<M>,
    scopes?: AllowReadonlyArray<string | ScopeOptions> | WhereOptions<Attributes<M>> | Nullish
  ): BaseModelStatic<M> {
    return super.withScope(scopes) as BaseModelStatic<M>
  }

  static addSearchScope<M extends BaseModel>(this: ModelStatic<M>, fields: AttributeNames<M>[]) {
    const searchScopeFunction = searchFieldsByTermsFactory<M>(fields)
    this.addScope("search", searchScopeFunction)
  }

  // static findByPk<M extends Model, R = Attributes<M>>(
  //   this: ModelStatic<M>,
  //   identifier: unknown,
  //   options: FindByPkOptions<M> & { raw: true; rejectOnEmpty?: false },
  // ): Promise<R | null>;
  // static findByPk<M extends Model, R = Attributes<M>>(
  //   this: ModelStatic<M>,
  //   identifier: unknown,
  //   options: NonNullFindByPkOptions<M> & { raw: true },
  // ): Promise<R>;
  // static findByPk<M extends Model>(
  //   this: ModelStatic<M>,
  //   identifier: unknown,
  //   options: NonNullFindByPkOptions<M>,
  // ): Promise<M>;
  // static findByPk<M extends Model>(
  //   this: ModelStatic<M>,
  //   identifier: unknown,
  //   options?: FindByPkOptions<M>,
  // ): Promise<M | null>;
  public static async findBySlugOrPk<M extends BaseModel>(
    this: ModelStatic<M>,
    slugOrPk: string | number,
    options?: Omit<FindOptions<Attributes<M>>, "where">
  ): Promise<M | null> {
    if (typeof slugOrPk === "number" || !isNaN(Number(slugOrPk))) {
      const primaryKey = slugOrPk
      return this.findByPk(primaryKey, options)
    }

    const slug = slugOrPk
    if (!("slug" in this.getAttributes())) {
      throw new Error(`${this.name} does not have a 'slug' attribute.`)
    }

    return this.findOne({
      ...options,
      // @ts-expect-error - We know that the model has a slug attribute, and are ignoring the TS error
      where: { slug },
    })
  }

  // See api/node_modules/@sequelize/core/lib/model.d.ts -> findAll
  // Taken from https://api.rubyonrails.org/v7.1.0/classes/ActiveRecord/Batches.html#method-i-find_each
  // Enforces sort by id, overwriting any supplied order
  public static async findEach<M extends BaseModel>(
    this: ModelStatic<M>,
    processFunction: (record: M) => Promise<void>
  ): Promise<void>
  public static async findEach<M extends BaseModel, R = Attributes<M>>(
    this: ModelStatic<M>,
    options: Omit<FindOptions<Attributes<M>>, "raw"> & {
      raw: true
      batchSize?: number
    },
    processFunction: (record: R) => Promise<void>
  ): Promise<void>
  public static async findEach<M extends BaseModel>(
    this: ModelStatic<M>,
    options: FindOptions<Attributes<M>> & {
      batchSize?: number
    },
    processFunction: (record: M) => Promise<void>
  ): Promise<void>
  public static async findEach<M extends BaseModel, R = Attributes<M>>(
    this: ModelStatic<M>,
    optionsOrFunction:
      | ((record: M) => Promise<void>)
      | (Omit<FindOptions<Attributes<M>>, "raw"> & { raw: true; batchSize?: number })
      | (FindOptions<Attributes<M>> & { batchSize?: number }),
    maybeFunction?: (record: R | M) => Promise<void>
  ): Promise<void> {
    let options:
      | (FindOptions<Attributes<M>> & { batchSize?: number })
      | (Omit<FindOptions<Attributes<M>>, "raw"> & { raw: true; batchSize?: number })

    // TODO: fix types so that process function is M when not raw
    // and R when raw. Raw is usable, just incorrectly typed.
    let processFunction: (record: M) => Promise<void>

    if (typeof optionsOrFunction === "function") {
      options = {}
      processFunction = optionsOrFunction
    } else if (maybeFunction === undefined) {
      throw new Error("findEach requires a processFunction")
    } else {
      options = optionsOrFunction
      processFunction = maybeFunction
    }

    const batchSize = options.batchSize ?? 1000
    let offset: number = 0
    let continueProcessing = true

    while (continueProcessing) {
      const records = await this.findAll({
        ...options,
        offset,
        limit: batchSize,
      })

      for (const record of records) {
        await processFunction(record)
      }

      offset += records.length

      if (records.length < batchSize) {
        continueProcessing = false
      }
    }
  }

  /**
   * Add the missing batchSize option to bulkCreate.
   */
  public static async bulkCreateBatched<M extends BaseModel>(
    this: ModelStatic<M>,
    records: CreationAttributes<M>[],
    options?: BulkCreateOptions<Attributes<M>> & {
      batchSize?: number
    }
  ): Promise<void> {
    const batchSize = options?.batchSize ?? 1000

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize)
      await this.bulkCreate(batch, options)
    }
  }
}

export default BaseModel
