import { Model } from "@sequelize/core"
import { isPromise } from "util/types"

/** Preserve synchronous and asynchronous serializer return types. */
type MaybePromise<R> = [R] extends [Promise<infer Value>] ? Promise<Value> : R

type MaybePromiseArray<R> = [R] extends [Promise<infer Value>] ? Promise<Value[]> : R[]

/**
 * BaseSerializer is a generic class that provides a common interface for all serializers.
 * It is designed to be extended by other serializers, and provides a static `perform` method
 * that can be used to serialize a single record or an array of records.
 *
 * The `perform` method is overloaded to handle both cases, and will return the serialized
 * record or records base on the input. The return type is determined as the return type of the
 * `perform` instance method of the subclass as a single value or an array of values.
 *
 * The `perform` takes its signature from the constructor of the subclass, while also allowing
 * for an array of records to be passed in as the first argument.
 *
 * @param M The model type that the serializer is designed to handle
 *
 * @example
 * class TableSerializer extends BaseSerializer<Dataset> {
 *   constructor(
 *     protected record: Dataset,
 *     protected currentUser: User
 *   ) {
 *     super(record)
 *   }
 *
 *   perform(): DatasetTableView {}
 * }
 *
 * TableSerializer.perform(dataset, currentUser) // => DatasetTableView
 * TableSerializer.perform([dataset1, dataset2], currentUser) // => [DatasetTableView, DatasetTableView]
 */
export class BaseSerializer<M extends Model> {
  constructor(protected record: M) {}

  // Overload for handling a single record
  static perform<M extends Model, Args extends unknown[], Result>(
    this: new (record: M, ...args: Args) => { perform(): Result },
    record: M,
    ...args: Args
  ): MaybePromise<Result>

  // Overload for handling an array of records
  static perform<M extends Model, Args extends unknown[], Result>(
    this: new (record: M, ...args: Args) => { perform(): Result },
    records: M[],
    ...args: Args
  ): MaybePromiseArray<Result>

  // Implementation of the perform method
  static perform<M extends Model, Args extends unknown[], Result>(
    this: new (record: M, ...args: Args) => { perform(): Result },
    recordOrRecords: M | M[],
    ...args: Args
  ): MaybePromise<Result> | MaybePromiseArray<Result> {
    if (Array.isArray(recordOrRecords)) {
      const results = recordOrRecords.map((record) => {
        const instance = new this(record, ...args)
        return instance.perform()
      })
      if (!isPromise(results[0])) {
        return results as MaybePromiseArray<Result>
      }

      return Promise.all(results) as MaybePromiseArray<Result>
    } else {
      const instance = new this(recordOrRecords, ...args)
      const result = instance.perform()
      if (!isPromise(result)) {
        return result as MaybePromise<Result>
      }

      return Promise.resolve(result) as MaybePromise<Result>
    }
  }

  /**
   * Instance `perform()` can be either sync or async:
   */
  perform(): unknown | Promise<unknown> {
    throw new Error("Method not implemented.")
  }
}

export default BaseSerializer
