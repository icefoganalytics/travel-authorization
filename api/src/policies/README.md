# Policies

Policies control access to records and attributes before data is returned to the client or mutated
through the API.

## Intent

Keep authorization logic out of controllers and services so access rules stay centralized,
reviewable, and reusable.

## Common Uses

Policies are typically used in three ways:

1. Check whether the current user can perform a controller action such as `show`, `create`,
   `update`, or `destroy`
2. Define the permitted attribute allow-list for create and update operations
3. Apply policy-backed scoping for index/list actions

## Naming

Policy classes should use the singular model name:

- `TravelAuthorizationPolicy`
- `ExpensePolicy`
- `TravelDeskTravelRequestPolicy`

There is one policy per model, not one policy per collection.

## Controller Usage Pattern

```typescript
export class AccessGrantsController extends BaseController<AccessGrant> {
  async index() {
    const where = this.buildWhere()
    const scopes = this.buildFilterScopes()
    const scopedAccessGrants = AccessGrantPolicy.applyScope(scopes, this.currentUser)

    const totalCount = await scopedAccessGrants.count({ where })
    const accessGrants = await scopedAccessGrants.findAll({
      where,
      limit: this.pagination.limit,
      offset: this.pagination.offset,
    })

    return this.response.json({
      accessGrants,
      totalCount,
    })
  }

  async update() {
    const accessGrant = await this.loadAccessGrant()
    if (isNil(accessGrant)) {
      return this.response.status(404).json({
        message: "Access grant not found.",
      })
    }

    const policy = this.buildPolicy(accessGrant)
    if (!policy.update()) {
      return this.response.status(403).json({
        message: "You are not authorized to update access grants on this dataset.",
      })
    }

    const permittedAttributes = policy.permittedAttributes()

    try {
      const updatedAccessGrant = await UpdateService.perform(
        accessGrant,
        pick(this.request.body, permittedAttributes),
        this.currentUser
      )

      return this.response.status(200).json({
        accessGrant: updatedAccessGrant,
        policy,
      })
    } catch (error) {
      return this.response.status(422).json({
        message: `Access grant update failed: ${error}`,
      })
    }
  }
}
```

## `policyScope()`

The modern pattern is a static `policyScope(user)` method on a `PolicyFactory(...)` class.

```typescript
export class AccessRequestPolicy extends PolicyFactory(AccessRequest) {
  static policyScope(user: User): FindOptions<Attributes<AccessRequest>> {
    if (user.isAdmin) return ALL_RECORDS_SCOPE

    return {
      where: {
        requestorId: user.id,
      },
    }
  }
}
```

This is the preferred place to express record visibility rules.

## Permitted Attributes

Policies should also define the attributes a user is allowed to submit.

```typescript
export class AccessGrantPolicy extends BasePolicy<AccessGrant> {
  permittedAttributes(): Path[] {
    return ["supportId", "grantLevel", "accessType"]
  }
}
```

Keep these allow-lists in the policy instead of duplicating them in controllers.

## Local Rules

- Prefer `PolicyFactory(Model)` for new or updated policies
- Use `policyScope()` for visibility rules
- Use `permittedAttributes()` for create/update allow-lists
- Keep controllers responsible for orchestration, not authorization logic
- Return the policy object in create/update/show responses when the surrounding controller pattern
  already does so

For broader policy conventions, see [../../../AGENTS.md](../../../AGENTS.md).
