import { User } from "@/models"

import { travelDeskProductTypeFactory, userFactory } from "@/factories"

import { mockCurrentUser, request } from "@/support"

describe("api/src/controllers/travel-desk-product-types-controller.ts", () => {
  describe("TravelDeskProductTypesController", () => {
    describe("GET /api/travel-desk-product-types", () => {
      test("when the user has no staff access, it returns an empty collection", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [] })
        mockCurrentUser(user)

        // Act
        const response = await request().get("/api/travel-desk-product-types")

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskProductTypes: [],
          totalCount: 0,
        })
      })
    })

    describe("DELETE /api/travel-desk-product-types/:travelDeskProductTypeId", () => {
      test("when the product type is built in, it rejects deletion", async () => {
        // Arrange
        const admin = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(admin)
        const productType = await travelDeskProductTypeFactory.create({
          code: "air",
          name: "Air",
        })

        // Act
        const response = await request().delete(`/api/travel-desk-product-types/${productType.id}`)

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "This product type cannot be deleted.",
        })
      })
    })
  })
})
