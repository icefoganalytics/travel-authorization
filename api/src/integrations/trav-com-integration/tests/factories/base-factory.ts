import { BuildOptions, DeepPartial, Factory } from "fishery"
import { Model } from "@sequelize/core"

// Must keep type signature in sync with fishery's Factory type
// See api/node_modules/fishery/dist/factory.d.ts
export class BaseFactory<T extends Model, I = any, C = T> extends Factory<T, I, C> {
  // See https://thoughtbot.github.io/factory_bot/ref/build-strategies.html#attributes_for
  attributesFor(params?: DeepPartial<T>, options?: BuildOptions<T, I>): T {
    const model = this.build(params, options)
    return model.dataValues
  }
}

export default BaseFactory
