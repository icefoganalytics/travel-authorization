import { User } from "@/models"

import { mockCurrentUser, request } from "@/support"

import {
  travelDeskInvoiceItemFactory,
  travelDeskProductTypeFactory,
  userFactory,
} from "@/factories"

describe("api/src/controllers/travel-desk-product-types-controller.ts", () => {
  describe("TravelDeskProductTypesController", () => {
    describe("GET /api/travel-desk-product-types", () => {
      test("when the user has no staff access, it returns an empty collection", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [] })
        await travelDeskProductTypeFactory.create()
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

      test("when a staff user filters and paginates, it applies requested ordering and matching totals", async () => {
        // Arrange
        const officer = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        await travelDeskProductTypeFactory.create({
          code: "custom-a",
          name: "Custom A",
          description: "Matching",
        })
        const productType2 = await travelDeskProductTypeFactory.create({
          code: "custom-b",
          name: "Custom B",
          description: "Matching",
        })
        await travelDeskProductTypeFactory.create({
          code: "custom-c",
          name: "Custom C",
          description: "Other",
        })
        mockCurrentUser(officer)

        // Act
        const response = await request()
          .get("/api/travel-desk-product-types")
          .query({
            "where[description]": "Matching",
            "order[0][0]": "name",
            "order[0][1]": "ASC",
            page: 2,
            perPage: 1,
          })

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskProductTypes: [
            {
              id: productType2.id,
              code: "custom-b",
              name: "Custom B",
              description: "Matching",
            },
          ],
          totalCount: 2,
        })
      })
    })

    describe("GET /api/travel-desk-product-types/:travelDeskProductTypeId", () => {
      test("when a travel desk officer views a product type, it returns its detail and policy", async () => {
        // Arrange
        const officer = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        const productType = await travelDeskProductTypeFactory.create({
          code: "custom-fee",
          name: "Custom Fee",
          description: null,
        })
        mockCurrentUser(officer)

        // Act
        const response = await request().get(`/api/travel-desk-product-types/${productType.id}`)

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskProductType: {
            id: productType.id,
            code: "custom-fee",
            name: "Custom Fee",
            description: null,
          },
          policy: {
            show: true,
            create: false,
            update: false,
            destroy: false,
          },
        })
      })

      test("when a non-staff user views a product type, it denies access", async () => {
        // Arrange
        const user = await userFactory.create({ roles: [User.Roles.USER] })
        const productType = await travelDeskProductTypeFactory.create()
        mockCurrentUser(user)

        // Act
        const response = await request().get(`/api/travel-desk-product-types/${productType.id}`)

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "You are not authorized to view this product type.",
        })
      })

      test("when a product type is deleted, it returns not found", async () => {
        // Arrange
        const officer = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        const productType = await travelDeskProductTypeFactory.create()
        await productType.destroy()
        mockCurrentUser(officer)

        // Act
        const response = await request().get(`/api/travel-desk-product-types/${productType.id}`)

        // Assert
        expect(response.status).toEqual(404)
        expect(response.body).toEqual({
          message: "Travel desk product type not found.",
        })
      })
    })

    describe("POST /api/travel-desk-product-types", () => {
      test("when an administrator creates a product type, it normalizes supported fields", async () => {
        // Arrange
        const admin = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(admin)

        // Act
        const response = await request()
          .post("/api/travel-desk-product-types")
          .send({
            code: " custom-fee ",
            name: " Custom Fee ",
            description: " A custom fee ",
            deletedAt: "2026-01-01",
          })

        // Assert
        expect(response.status).toEqual(201)
        expect(response.body).toEqual({
          travelDeskProductType: {
            id: expect.any(Number),
            code: "custom-fee",
            name: "Custom Fee",
            description: "A custom fee",
          },
        })
      })

      test("when a travel desk officer creates a product type, it denies access", async () => {
        // Arrange
        const officer = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        mockCurrentUser(officer)

        // Act
        const response = await request()
          .post("/api/travel-desk-product-types")
          .send({ code: "custom-fee", name: "Custom Fee" })

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "You are not authorized to create product types.",
        })
      })

      test("when the code is not kebab case, it returns the creation error", async () => {
        // Arrange
        const admin = await userFactory.create({ roles: [User.Roles.ADMIN] })
        mockCurrentUser(admin)

        // Act
        const response = await request()
          .post("/api/travel-desk-product-types")
          .send({ code: "Invalid Code", name: "Custom Fee" })

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({
          message: "Failed to create travel desk product type: Error: Code must be kebab-case.",
        })
      })
    })

    describe("PATCH /api/travel-desk-product-types/:travelDeskProductTypeId", () => {
      test("when an administrator renames a product type, it normalizes text without changing its code", async () => {
        // Arrange
        const admin = await userFactory.create({ roles: [User.Roles.ADMIN] })
        const productType = await travelDeskProductTypeFactory.create({
          code: "custom-fee",
          name: "Custom Fee",
          description: "Original description",
        })
        mockCurrentUser(admin)

        // Act
        const response = await request()
          .patch(`/api/travel-desk-product-types/${productType.id}`)
          .send({ code: "air", name: " Renamed Fee " })

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskProductType: {
            id: productType.id,
            code: "custom-fee",
            name: "Renamed Fee",
            description: "Original description",
          },
        })
      })

      test("when an administrator clears a description, it preserves the omitted name", async () => {
        // Arrange
        const admin = await userFactory.create({ roles: [User.Roles.ADMIN] })
        const productType = await travelDeskProductTypeFactory.create({
          code: "custom-fee",
          name: "Custom Fee",
          description: "Original description",
        })
        mockCurrentUser(admin)

        // Act
        const response = await request()
          .patch(`/api/travel-desk-product-types/${productType.id}`)
          .send({ description: null })

        // Assert
        expect(response.status).toEqual(200)
        expect(response.body).toEqual({
          travelDeskProductType: {
            id: productType.id,
            code: "custom-fee",
            name: "Custom Fee",
            description: null,
          },
        })
      })

      test("when the name contains only whitespace, it returns the update error", async () => {
        // Arrange
        const admin = await userFactory.create({ roles: [User.Roles.ADMIN] })
        const productType = await travelDeskProductTypeFactory.create()
        mockCurrentUser(admin)

        // Act
        const response = await request()
          .patch(`/api/travel-desk-product-types/${productType.id}`)
          .send({ name: "   " })

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({
          message: "Failed to update travel desk product type: Error: Name is required.",
        })
      })

      test("when a travel desk officer updates a product type, it denies access", async () => {
        // Arrange
        const officer = await userFactory.create({ roles: [User.Roles.TRAVEL_DESK_USER] })
        const productType = await travelDeskProductTypeFactory.create()
        mockCurrentUser(officer)

        // Act
        const response = await request()
          .patch(`/api/travel-desk-product-types/${productType.id}`)
          .send({ name: "Renamed Fee" })

        // Assert
        expect(response.status).toEqual(403)
        expect(response.body).toEqual({
          message: "You are not authorized to update this product type.",
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

      test("when an administrator deletes an unused custom product, it returns no content", async () => {
        // Arrange
        const admin = await userFactory.create({ roles: [User.Roles.ADMIN] })
        const productType = await travelDeskProductTypeFactory.create()
        mockCurrentUser(admin)

        // Act
        const response = await request().delete(`/api/travel-desk-product-types/${productType.id}`)

        // Assert
        expect(response.status).toEqual(204)
        expect(response.body).toEqual({})
      })

      test("when an invoice item references a product, it rejects deletion", async () => {
        // Arrange
        const admin = await userFactory.create({ roles: [User.Roles.ADMIN] })
        const productType = await travelDeskProductTypeFactory.create()
        await travelDeskInvoiceItemFactory.create({
          travelDeskProductTypeId: productType.id,
        })
        mockCurrentUser(admin)

        // Act
        const response = await request().delete(`/api/travel-desk-product-types/${productType.id}`)

        // Assert
        expect(response.status).toEqual(422)
        expect(response.body).toEqual({
          message:
            "Failed to delete travel desk product type: Error: A product type used by an invoice cannot be deleted.",
        })
      })
    })
  })
})
