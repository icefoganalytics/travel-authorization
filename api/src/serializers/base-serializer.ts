import { Model } from "sequelize"
import { isPromise } from "util/types"

type RemainingConstructorParameters<C extends new (...args: any[]) => any> = C extends new (
  head: any,
  ...tail: infer TT
) => any
  ? TT
  : []

/**
 * For a function type F, returns either:
 *    - Promise<R> if `F` returns `Promise<R>`, or
 *    - R if `F` returns a non-promise type `R`
 */
type MaybePromiseOf<F extends (...args: any[]) => any> =
  ReturnType<F> extends Promise<infer R> ? Promise<R> : ReturnType<F>

/**
 * Same logic, but returns an array type or `Promise<array>`.
 */
type MaybePromiseOfArray<F extends (...args: any[]) => any> =
  ReturnType<F> extends Promise<infer R> ? Promise<R[]> : ReturnType<F>[]

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
  static perform<T extends BaseSerializer<any>, C extends new (...args: any[]) => T>(
    this: C,
    ...args: ConstructorParameters<C>
  ): MaybePromiseOf<InstanceType<C>["perform"]>

  // Overload for handling an array of records
  static perform<T extends BaseSerializer<any>, C extends new (...args: any[]) => T>(
    this: C,
    ...args: [ConstructorParameters<C>[0][], ...RemainingConstructorParameters<C>]
  ): MaybePromiseOfArray<InstanceType<C>["perform"]>

  // Implementation of the perform method
  static perform<T extends BaseSerializer<any>, C extends new (...args: any[]) => T>(
    this: C,
    ...args:
      | ConstructorParameters<C>
      | [ConstructorParameters<C>[0][], ...RemainingConstructorParameters<C>]
  ): MaybePromiseOf<InstanceType<C>["perform"]> | MaybePromiseOfArray<InstanceType<C>["perform"]> {
    if (Array.isArray(args[0])) {
      const records = args[0] as ConstructorParameters<C>[0][]
      const results = records.map((record) => {
        const instance = new this(record, ...args.slice(1))
        return instance.perform()
      })
      if (!isPromise(results[0])) {
        return results as MaybePromiseOfArray<InstanceType<C>["perform"]>
      }

      return Promise.all(results) as MaybePromiseOfArray<InstanceType<C>["perform"]>
    } else {
      const instance = new this(...args)
      const result = instance.perform()
      if (!isPromise(result)) {
        return result as MaybePromiseOf<InstanceType<C>["perform"]>
      }

      return Promise.resolve(result) as MaybePromiseOf<InstanceType<C>["perform"]>
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
