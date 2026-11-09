import { yukonGovernmentIntegration } from "@/integrations"
import { TravelAuthorization, TravelDeskTravelRequest } from "@/models"
import { CreateService, PrefillFlightRequestsService } from "@/services/travel-desk-travel-requests"
import {
  travelAuthorizationFactory,
  travelPurposeFactory,
  travelSegmentFactory,
  userFactory,
} from "@/factories"

vi.mock("@/integrations/yukon-government-integration", () => ({
  yukonGovernmentIntegration: {
    fetchEmployee: vi.fn(),
  },
}))
const yukonGovernmentIntegrationMock = vi.mocked(yukonGovernmentIntegration)

vi.mock("@/services/travel-desk-travel-requests/prefill-flight-requests-service", () => {
  const PrefillFlightRequestsServiceMock = {
    perform: vi.fn(),
  }

  return {
    PrefillFlightRequestsService: PrefillFlightRequestsServiceMock,
    default: PrefillFlightRequestsServiceMock,
  }
})

describe("api/src/services/travel-desk-travel-requests/create-service.ts", () => {
  describe("CreateServices", () => {
    describe(".perform", () => {
      test("when employee found in directory, it creates a travel desk travel request with traveler details from directory", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const user = await userFactory.create()
        const purpose = await travelPurposeFactory.create()
        const travelAuthorization = await travelAuthorizationFactory
          .associations({
            purpose,
            user,
          })
          .create({
            status: TravelAuthorization.Statuses.SUBMITTED,
          })

        yukonGovernmentIntegrationMock.fetchEmployee.mockResolvedValue({
          full_name: "John.Doe",
          first_name: "John",
          last_name: "Doe",
          address: "1234 Example Street",
          postal_code: "X0X 0X0",
          community: "Whitehorse",
          organization: null,
          department: "Example Department",
          division: null,
          branch: null,
          unit: null,
          title: "Example Title",
          email: "John.Doe@yukon.ca",
          suite: "",
          phone_office: "123-456-7890",
          fax_office: "",
          mobile: "987-654-3210",
          office: "Example Office Location",
          po_box: "100",
          mailcode: "XYZ",
          manager: "Jane.Manager",
          username: "jdoe",
          latitude: null,
          longitude: null,
        })

        // Act
        const result = await CreateService.perform(
          {
            travelAuthorizationId: travelAuthorization.id,
            legalFirstName: user.firstName || "",
            legalLastName: user.lastName || "",
            strAddress: "",
            city: "",
            province: "",
            postalCode: "",
            busPhone: "",
            busEmail: user.email,
            travelPurpose: purpose.purpose,
          },
          currentUser
        )

        // Assert
        expect.assertions(1)
        expect(result).toEqual(
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            legalFirstName: "John",
            legalLastName: "Doe",
            strAddress: "1234 Example Street",
            city: "Whitehorse",
            province: "Yukon",
            postalCode: "X0X 0X0",
            busPhone: "123-456-7890",
            busEmail: "john.doe@yukon.ca",
            travelContact: true,
            travelEmail: user.email,
            travelPhone: "987-654-3210",
            travelPurpose: purpose.purpose,
            status: TravelDeskTravelRequest.Statuses.DRAFT,
          })
        )
      })

      test("when employee not found in directory, it creates a minimal travel desk travel request", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const user = await userFactory.create()
        const purpose = await travelPurposeFactory.create()
        const travelAuthorization = await travelAuthorizationFactory
          .associations({
            purpose,
            user,
          })
          .create({
            status: TravelAuthorization.Statuses.SUBMITTED,
          })

        yukonGovernmentIntegrationMock.fetchEmployee.mockResolvedValue(null)

        // Act
        const result = await CreateService.perform(
          {
            travelAuthorizationId: travelAuthorization.id,
            legalFirstName: user.firstName || "",
            legalLastName: user.lastName || "",
            strAddress: "",
            city: "",
            province: "",
            postalCode: "",
            busPhone: "",
            busEmail: user.email,
            travelPurpose: purpose.purpose,
          },
          currentUser
        )

        // Assert
        expect.assertions(1)
        expect(result).toEqual(
          expect.objectContaining({
            travelAuthorizationId: travelAuthorization.id,
            legalFirstName: user.firstName || "",
            legalLastName: user.lastName || "",
            strAddress: "",
            city: "",
            province: "",
            postalCode: "",
            busPhone: "",
            busEmail: user.email,
            travelPurpose: purpose.purpose,
            status: TravelDeskTravelRequest.Statuses.DRAFT,
          })
        )
      })

      test("when travel segments exist, it calls the prefill flight requests service", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const user = await userFactory.create()
        const purpose = await travelPurposeFactory.create()
        const travelAuthorization = await travelAuthorizationFactory
          .associations({
            purpose,
            user,
          })
          .create({
            status: TravelAuthorization.Statuses.SUBMITTED,
          })
        const travelSegment1 = await travelSegmentFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          segmentNumber: 1,
        })
        const travelSegment2 = await travelSegmentFactory.create({
          travelAuthorizationId: travelAuthorization.id,
          segmentNumber: 2,
        })

        yukonGovernmentIntegrationMock.fetchEmployee.mockResolvedValue(null)
        const prefillFlightRequestsServicePerformSpy = vi.spyOn(
          PrefillFlightRequestsService,
          "perform"
        )

        // Act
        const travelDeskTravelRequest = await CreateService.perform(
          {
            travelAuthorizationId: travelAuthorization.id,
            legalFirstName: user.firstName || "",
            legalLastName: user.lastName || "",
            strAddress: "",
            city: "",
            province: "",
            postalCode: "",
            busPhone: "",
            busEmail: user.email,
            travelPurpose: purpose.purpose,
          },
          currentUser
        )

        // Assert
        expect.assertions(1)
        expect(prefillFlightRequestsServicePerformSpy).toHaveBeenCalledWith(
          travelDeskTravelRequest,
          [
            expect.objectContaining({ id: travelSegment1.id, segmentNumber: 1 }),
            expect.objectContaining({ id: travelSegment2.id, segmentNumber: 2 }),
          ],
          currentUser
        )
      })

      test("when travel segments do not exist, it does not call the prefill flight requests service", async () => {
        // Arrange
        const currentUser = await userFactory.create()
        const user = await userFactory.create()
        const purpose = await travelPurposeFactory.create()
        const travelAuthorization = await travelAuthorizationFactory
          .associations({
            purpose,
            user,
          })
          .create({
            status: TravelAuthorization.Statuses.SUBMITTED,
          })

        yukonGovernmentIntegrationMock.fetchEmployee.mockResolvedValue(null)
        const prefillFlightRequestsServicePerformSpy = vi.spyOn(
          PrefillFlightRequestsService,
          "perform"
        )

        // Act
        await CreateService.perform(
          {
            travelAuthorizationId: travelAuthorization.id,
            legalFirstName: user.firstName || "",
            legalLastName: user.lastName || "",
            strAddress: "",
            city: "",
            province: "",
            postalCode: "",
            busPhone: "",
            busEmail: user.email,
            travelPurpose: purpose.purpose,
          },
          currentUser
        )

        // Assert
        expect(prefillFlightRequestsServicePerformSpy).not.toHaveBeenCalled()
      })
    })
  })
})
