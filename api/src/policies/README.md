# Policies

Policies are used to control access to data in a controller, before it is returned to the client.

## Naming Convention

Policy classes should use the **singular** model name (e.g., `StopPolicy`, `AccessGrantPolicy`, `TravelAuthorizationPolicy`), not the plural form.
Why? There is _one_ policy for a given model.

## Usage

Polices can be used in the following ways:

1. Build a policy instance and check the controller action matching boolean function.
   Controller#update -> Policy#update

   ```ts
   export class AccessGrantsController extends BaseController {
     async update() {
       try {
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

         const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
         const updatedAccessGrant = await UpdateService.perform(
           accessGrant,
           permittedAttributes,
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

     private async loadAccessGrant(): Promise<AccessGrant | null> {
       return AccessGrant.findByPk(this.params.accessGrantId)
     }

     private buildPolicy(accessGrant: AccessGrant) {
       return new AccessGrantPolicy(this.currentUser, accessGrant)
     }
   }
   ```

2. The previous example also demostrates a second way of using policies. The "permitted attributes" pattern. A policy can also be used to provide an "allow list" of attributes that a user is allowed to submit for a given controller action.

   ```ts
   export class AccessGrantPolicy extends BasePolicy<AccessGrant> {
     permittedAttributes(): Path[] {
       return ["supportId", "grantLevel", "accessType", "isProjectDescriptionRequired"]
     }
   }
   ```

3. Policies can also be used to restrict the results of an "index" or list action in a controller.
   In this case a bunch of scoping conditions are built up, and then passed to the "apply scope" function. This produces a query that, when executed, will only return the records that the current user is allowed to see.

   ```ts
   export class AccessGrantsController extends BaseController<AccessGrant> {
     async index() {
       try {
         const where = this.buildWhere()
         const scopes = this.buildFilterScopes()
         const order = this.buildOrder()
         const scopedAccessGrants = AccessGrantPolicy.applyScope(scopes, this.currentUser)

         const totalCount = await scopedAccessGrants.count({ where })
         const accessGrants = await scopedAccessGrants.findAll({
           where,
           order,
           limit: this.pagination.limit,
           offset: this.pagination.offset,
         })

         return this.response.json({
           accessGrants,
           totalCount,
         })
       } catch (error) {
         logger.error(`Error fetching access grants: ${error}`, { error })
         return this.response.status(400).json({
           message: `Failed to retrieve access grants: ${error}`,
         })
       }
     }
   }
   ```

## Policy#policyScope

The `policyScope` method is used to add a scope to the given model. This scope is permanently added to the model, though it likely shouldn't be used outside of the policy.

i.e.

```ts
export class AccessRequestPolicy extends PolicyFactory(AccessRequest) {
  static policyScope(user: User): FindOptions<Attributes<AccessRequest>> {
    if (user.isSystemAdmin || user.isBusinessAnalyst) return ALL_RECORDS_SCOPE

    if (user.isDataOwner) {
      return {
        include: [
          {
            association: "dataset",
            where: {
              ownerId: user.id,
            },
          },
        ],
      }
    }

    return {
      where: {
        requestorId: user.id,
      },
    }
  }
}
```

can be considered equivalent to

```ts
AccessReqeuest.addScope("policyScope", (user: User) => {
  if (user.isSystemAdmin || user.isBusinessAnalyst) return ALL_RECORDS_SCOPE

  if (user.isDataOwner) {
    return {
      include: [
        {
          association: "dataset",
          where: {
            ownerId: user.id,
          },
        },
      ],
    }
  }

  return {
    where: {
      requestorId: user.id,
    },
  }
})
```

# Full Example

Here is a simple example of a controller using a policy to control access to a resource.
The full cases might be more complex, but the "policy" pattern leaves space for that complexity to exist without cluttering the controller.

```ts
export class AccessGrantsController extends BaseController<AccessGrant> {
  async index() {
    try {
      const where = this.buildWhere()
      const scopes = this.buildFilterScopes()
      const order = this.buildOrder()
      const scopedAccessGrants = AccessGrantPolicy.applyScope(scopes, this.currentUser)

      const totalCount = await scopedAccessGrants.count({ where })
      const accessGrants = await scopedAccessGrants.findAll({
        where,
        order,
        limit: this.pagination.limit,
        offset: this.pagination.offset,
      })

      return this.response.json({
        accessGrants,
        totalCount,
      })
    } catch (error) {
      logger.error(`Error fetching access grants: ${error}`, { error })
      return this.response.status(400).json({
        message: `Failed to retrieve access grants: ${error}`,
      })
    }
  }

  async create() {
    try {
      const accessGrant = await this.buildAccessGrant()
      if (isNil(accessGrant)) {
        return this.response.status(404).json({
          message: "Dataset not found.",
        })
      }

      const policy = this.buildPolicy(accessGrant)
      if (!policy.create()) {
        return this.response.status(403).json({
          message: "You are not authorized to add access grants for this dataset.",
        })
      }

      const permittedAttributes = policy.permitAttributesForCreate(this.request.body)
      const newAccessGrant = await CreateService.perform(permittedAttributes, this.currentUser)
      return this.response.status(201).json({
        accessGrant: newAccessGrant,
        policy,
      })
    } catch (error) {
      logger.error(`Error creating access grant: ${error}`, { error })
      return this.response.status(422).json({
        message: `Access grant creation failed: ${error}`,
      })
    }
  }

  async update() {
    try {
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

      const permittedAttributes = policy.permitAttributesForUpdate(this.request.body)
      const updatedAccessGrant = await UpdateService.perform(
        accessGrant,
        permittedAttributes,
        this.currentUser
      )
      return this.response.status(200).json({
        accessGrant: updatedAccessGrant,
        policy,
      })
    } catch (error) {
      logger.error(`Error updating access grant: ${error}`, { error })
      return this.response.status(422).json({
        message: `Access grant update failed: ${error}`,
      })
    }
  }

  private async buildAccessGrant(): Promise<AccessGrant> {
    return AccessGrant.build(this.request.body)
  }

  private async loadAccessGrant(): Promise<AccessGrant | null> {
    return AccessGrant.findByPk(this.params.accessGrantId)
  }

  private buildPolicy(accessGrant: AccessGrant) {
    return new AccessGrantPolicy(this.currentUser, accessGrant)
  }
}
```

and the policy

```ts
export class AccessGrantPolicy extends BasePolicy<AccessGrant> {
  create(): boolean {
    // some code that might returns true
    return false
  }

  update(): boolean {
    // some code that might returns true
    return false
  }

  destroy(): boolean {
    // some code that might returns true
    return false
  }

  permittedAttributes(): Path[] {
    return ["supportId", "grantLevel", "accessType", "isProjectDescriptionRequired"]
  }

  permittedAttributesForCreate(): Path[] {
    return ["datasetId", ...this.permittedAttributes()]
  }
}
```
