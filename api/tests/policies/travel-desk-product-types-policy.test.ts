import { TravelDeskProductType, User } from "@/models"
import { travelDeskProductTypeFactory, userFactory } from "@/factories"

import { TravelDeskProductTypesPolicy } from "@/policies/travel-desk-product-types-policy"

describe("api/src/policies/travel-desk-product-types-policy.ts", () => {
  describe("TravelDeskProductTypesPolicy", () => {
    describe("#show", () => {
      test("when the user is a travel desk officer, it allows reading product types", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        const productType = TravelDeskProductType.build({
          code: "air",
          name: "Air",
        })
        const policy = new TravelDeskProductTypesPolicy(user, productType)

        // Act
        const result = policy.show()

        // Assert
        expect(result).toEqual(true)
      })
    })

    describe("#create", () => {
      test("when the user is a travel desk officer, it rejects product type creation", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        const productType = travelDeskProductTypeFactory.build()
        const policy = new TravelDeskProductTypesPolicy(user, productType)

        // Act
        const result = policy.create()

        // Assert
        expect(result).toEqual(false)
      })
    })

    describe("#destroy", () => {
      test("when the product type is built in, it rejects administrator deletion", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [User.Roles.ADMIN] })
        const productType = TravelDeskProductType.build({
          code: "service-fee",
          name: "Service Fee",
        })
        const policy = new TravelDeskProductTypesPolicy(user, productType)

        // Act
        const result = policy.destroy()

        // Assert
        expect(result).toEqual(false)
      })
    })
  })
})
