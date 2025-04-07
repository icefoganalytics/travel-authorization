import { Model, Attributes, FindOptions, literal } from "sequelize"

import { User } from "@/models"
import { Path, deepPick } from "@/utils/deep-pick"

export type Actions = "show" | "create" | "update" | "destroy"
export const NO_RECORDS_SCOPE = Object.freeze({ where: literal("1 = 0") })
export const ALL_RECORDS_SCOPE = Object.freeze({})

/**
 * See api/src/policies/policy-factory.ts for policy with scope helpers
 */
export class BasePolicy<M extends Model> {
  protected user: User
  protected record: M

  constructor(user: User, record: M) {
    this.user = user
    this.record = record
  }

  show(): boolean {
    return false
  }

  create(): boolean {
    return false
  }

  update(): boolean {
    return false
  }

  destroy(): boolean {
    return false
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static policyScope<M extends Model>(user: User, ...args: unknown[]): FindOptions<Attributes<M>> {
    throw new Error("Derived classes must implement policyScope method")
  }

  permitAttributes(record: Partial<M>): Partial<M> {
    return deepPick(record, this.permittedAttributes())
  }

  permitAttributesForCreate(record: Partial<M>): Partial<M> {
    if (this.permittedAttributesForCreate !== BasePolicy.prototype.permittedAttributesForCreate) {
      return deepPick(record, this.permittedAttributesForCreate())
    } else {
      return deepPick(record, this.permittedAttributes())
    }
  }

  permitAttributesForUpdate(record: Partial<M>): Partial<M> {
    if (this.permittedAttributesForUpdate !== BasePolicy.prototype.permittedAttributesForUpdate) {
      return deepPick(record, this.permittedAttributesForUpdate())
    } else {
      return deepPick(record, this.permittedAttributes())
    }
  }

  permittedAttributes(): Path[] {
    throw new Error("Not Implemented")
  }

  permittedAttributesForCreate(): Path[] {
    throw new Error("Not Implemented")
  }

  permittedAttributesForUpdate(): Path[] {
    throw new Error("Not Implemented")
  }

  /**
   * Add to support return policy information via this.reponse.json({ someObject, policy })
   *
   * If this method becomes complex, it should be broken out into a serializer.
   *
   * @returns a JSON representation of the policy
   */
  toJSON(): Record<Actions, boolean> {
    return {
      show: this.show(),
      create: this.create(),
      update: this.update(),
      destroy: this.destroy(),
    }
  }
}

export default BasePolicy
