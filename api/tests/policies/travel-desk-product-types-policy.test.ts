import { TravelDeskProductType, User } from "@/models"
import { TravelDeskProductTypesPolicy } from "@/policies/travel-desk-product-types-policy"

import { travelDeskProductTypeFactory, userFactory } from "@/factories"

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

    describe("#update", () => {
      test("when the user is a travel desk officer, it rejects product type changes", async () => {
        // Arrange
        const officer = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        const productType = travelDeskProductTypeFactory.build()
        const policy = new TravelDeskProductTypesPolicy(officer, productType)

        // Act
        const result = policy.update()

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

      test("when the product type is custom, it permits administrator deletion", async () => {
        // Arrange
        const admin = await userFactory.create({ roles: [User.Roles.ADMIN] })
        const productType = travelDeskProductTypeFactory.build({ code: "custom-fee" })
        const policy = new TravelDeskProductTypesPolicy(admin, productType)

        // Act
        const result = policy.destroy()

        // Assert
        expect(result).toEqual(true)
      })

      test("when the user is a travel desk officer, it rejects custom product deletion", async () => {
        // Arrange
        const officer = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        const productType = travelDeskProductTypeFactory.build({ code: "custom-fee" })
        const policy = new TravelDeskProductTypesPolicy(officer, productType)

        // Act
        const result = policy.destroy()

        // Assert
        expect(result).toEqual(false)
      })
    })

    describe("#permitAttributesForUpdate", () => {
      test("when immutable attributes are submitted, it keeps only name and description", async () => {
        // Arrange
        const admin = await userFactory.create({ roles: [User.Roles.ADMIN] })
        const productType = travelDeskProductTypeFactory.build()
        const policy = new TravelDeskProductTypesPolicy(admin, productType)

        // Act
        const attributes = policy.permitAttributesForUpdate({
          id: 999999,
          code: "air",
          name: "Renamed Fee",
          description: null,
          deletedAt: new Date(),
        })

        // Assert
        expect(attributes).toEqual({
          name: "Renamed Fee",
          description: null,
        })
      })
    })

    describe(".applyScope", () => {
      test("when the user lacks staff access, it excludes matching products", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [User.Roles.USER] })
        const productType = await travelDeskProductTypeFactory.create()
        const scopedTravelDeskProductTypes = TravelDeskProductTypesPolicy.applyScope([], user)

        // Act
        const productTypes = await scopedTravelDeskProductTypes.findAll({
          where: { id: productType.id },
        })

        // Assert
        expect(productTypes).toEqual([])
      })

      test("when the user has travel desk access, it includes active products", async () => {
        // Arrange
        const officer = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        const productType = await travelDeskProductTypeFactory.create()
        const deletedProductType = await travelDeskProductTypeFactory.create()
        await deletedProductType.destroy()
        const scopedTravelDeskProductTypes = TravelDeskProductTypesPolicy.applyScope([], officer)

        // Act
        const productTypes = await scopedTravelDeskProductTypes.findAll()

        // Assert
        expect(productTypes).toEqual([expect.objectContaining({ id: productType.id })])
      })
    })
  })
})
