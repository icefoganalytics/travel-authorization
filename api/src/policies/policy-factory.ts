import { Model, ModelStatic, ScopeOptions } from "@sequelize/core"

import { User } from "@/models"
import BasePolicy from "@/policies/base-policy"

// See api/node_modules/sequelize/types/model.d.ts -> Model -> scope
export type BaseScopeOptions = string | ScopeOptions

export const POLICY_SCOPE_NAME = "policyScope"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AllArgsButFirstOne<T extends any[]> = T extends [any, ...infer Rest] ? Rest : never

export function PolicyFactory<
  ModelInstance extends Model,
  PolicyRecord extends Model = ModelInstance,
  ScopedMethods = object,
>(
  modelClass: {
    withScope(
      this: ModelStatic<NoInfer<ModelInstance>>,
      scopes: BaseScopeOptions[]
    ): ModelStatic<NoInfer<ModelInstance>> & ScopedMethods
  } & ModelStatic<ModelInstance>
) {
  const policyClass = class Policy extends BasePolicy<PolicyRecord> {
    static applyScope<PolicyClass extends typeof Policy>(
      this: PolicyClass,
      scopes: BaseScopeOptions[],
      user: User,
      ...extraPolicyScopeArgs: AllArgsButFirstOne<Parameters<PolicyClass["policyScope"]>>
    ): ModelStatic<ModelInstance> & Omit<ScopedMethods, "prototype"> {
      this.ensurePolicyScope()

      return modelClass.withScope([
        ...scopes,
        { method: [POLICY_SCOPE_NAME, user, ...extraPolicyScopeArgs] },
      ])
    }

    /**
     * Just in time scope creation for model class.
     * TODO: to have scope creation occur at definition time, instead of execution time.
     */
    static ensurePolicyScope() {
      if (Object.prototype.hasOwnProperty.call(modelClass.options.scopes, POLICY_SCOPE_NAME)) {
        return
      }

      modelClass.addScope(POLICY_SCOPE_NAME, this.policyScope.bind(modelClass))
    }
  }

  return policyClass
}

export default PolicyFactory
