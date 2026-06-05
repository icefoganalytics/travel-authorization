# Backend IndexService Template

This template documents the IndexService pattern for paginated list endpoints that return
summary aggregates alongside records and total count.

## Full IndexService

```typescript
import { Attributes, ModelStatic, WhereOptions } from "@sequelize/core"

import { Model, User } from "@/models"
import { type BaseScopeOptions, ModelPolicy } from "@/policies"
import { type ModelOrder } from "@/controllers/base-controller"
import BaseService from "@/services/base-service"

export type ModelIndexSummaries = {
  totalField: number
}

export class IndexService extends BaseService {
  constructor(
    private where: WhereOptions<Attributes<Model>>,
    private scopes: BaseScopeOptions[],
    private order: ModelOrder[] | undefined,
    private limit: number,
    private offset: number,
    private currentUser: User
  ) {
    super()
  }

  async perform(): Promise<{
    [modelPlural]: Model[]
    totalCount: number
    summaries: ModelIndexSummaries
  }> {
    const scopedModel = ModelPolicy.applyScope(this.scopes, this.currentUser)

    const totalCount = await scopedModel.count({ where: this.where })
    const records = await scopedModel.findAll({
      where: this.where,
      order: this.order,
      limit: this.limit,
      offset: this.offset,
    })
    const summaries = await this.computeSummaries(scopedModel, this.where)

    return {
      [modelPlural]: records,
      totalCount,
      summaries,
    }
  }

  private async computeSummaries(
    scopedModel: ModelStatic<Model>,
    where: WhereOptions<Attributes<Model>>
  ): Promise<ModelIndexSummaries> {
    const totalField = await this.computeTotalField(scopedModel, where)
    return {
      totalField,
    }
  }

  /**
   * See https://github.com/sequelize/sequelize/blob/52e3c30d2927879ed47cbcf19f55e5cc10ba3771/packages/core/test/integration/model/scope/aggregate.test.js
   */
  private async computeTotalField(
    scopedModel: ModelStatic<Model>,
    where: WhereOptions<Attributes<Model>>
  ): Promise<number> {
    const totalField = await scopedModel.aggregate<number | null, Model>(
      "fieldName",
      "SUM",
      {
        where,
        // Query enhancers
        plain: true,
        // @ts-expect-error Not in AggregateOptions type but supported at runtime
        includeIgnoreAttributes: false,
        limit: null,
        offset: null,
        order: null,
        attributes: [],
      }
    )
    return totalField ?? 0
  }
}

export default IndexService
```

## Why the extra aggregate options

`Model.aggregate()` does not set `includeIgnoreAttributes`, `limit`, `offset`, or `order`
internally (unlike `Model.count()`, which does). When the policy scope produces a JOIN,
those options must be set explicitly to prevent the joined columns from leaking into
the aggregate's SELECT clause. Without them, PostgreSQL raises:
`... must appear in the GROUP BY clause or be used in an aggregate function`.

The `plain: true` ensures the aggregate returns a scalar value (e.g. `number | null`)
rather than an object. The `?? 0` coalesces the `null` that aggregate returns when
no rows match the query.

## Test Structure

Corresponding tests should follow this layout:

```typescript
import { IndexService } from "@/services/model"
import { modelFactory, travelAuthorizationFactory, userFactory } from "@/factories"
import { User } from "@/models"

describe("api/src/services/model/index-service.ts", () => {
  describe("IndexService", () => {
    describe(".perform", () => {
      test("when called without filters, it returns all records and their total", async () => {
        // Arrange
        const user = await userFactory.create({
          roles: [User.Roles.ADMIN],
        })
        // ... create records via factories

        // Act
        const result = await IndexService.perform(
          {},
          [],
          undefined,
          10,
          0,
          user
        )

        // Assert
        expect(result).toEqual({
          [modelPlural]: [
            expect.objectContaining({ id: record1.id }),
            expect.objectContaining({ id: record2.id }),
          ],
          totalCount: 2,
          summaries: {
            totalField: 300,
          },
        })
      })

      // Additional tests: where filter, pagination, empty results, policy scope
    })
  })
})
```

Always use `roles: [User.Roles.ADMIN]` to create admin users — `isAdmin` is a virtual
getter with no setter and is silently ignored by Fishery.
