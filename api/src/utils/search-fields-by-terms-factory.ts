import {
  fn,
  literal,
  Model,
  Op,
  type Attributes,
  type FindOptions,
  type WhereOptions,
  where,
} from "@sequelize/core"

import arrayWrap from "@/utils/array-wrap"
import { type AttributeNames } from "@/utils/utility-types"

/**
 * Generates a search scope for Sequelize models that allows for custom SQL conditions per term.
 */
export function searchFieldsByTermsFactory<M extends Model>(
  fields: AttributeNames<M>[]
): (termOrTerms: string | string[]) => FindOptions<Attributes<M>> {
  return (termOrTerms: string | string[]): FindOptions<Attributes<M>> => {
    const terms = arrayWrap(termOrTerms)
    if (terms.length === 0) {
      return {}
    }

    // TODO: rebuild as successive scope calls if
    // https://github.com/sequelize/sequelize/issues/17337 gets implemented
    // (we would no longer need the and operator in the where clause)
    const whereQuery: {
      [Op.and]?: WhereOptions<M>[]
    } = {}

    const whereConditions: WhereOptions<M>[] = terms.map((term: string) => {
      const termPattern = `%${term}%`
      const fieldsQuery = fields.map((field) => {
        return where(fn("LOWER", literal(field)), Op.iLike, termPattern)
      })

      return {
        [Op.or]: fieldsQuery,
      }
    })

    whereQuery[Op.and] = whereConditions

    return {
      where: whereQuery,
    }
  }
}

export default searchFieldsByTermsFactory
