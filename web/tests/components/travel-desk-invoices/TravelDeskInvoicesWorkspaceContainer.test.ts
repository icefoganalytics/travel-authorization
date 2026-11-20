import { flushPromises, type VueWrapper } from "@vue/test-utils"

import { UserRoles } from "@/api/current-user-api"
import type { TravelDeskBookingEventAsIndex } from "@/api/travel-desk-booking-events-api"
import {
  TravelDeskInvoiceItemProductTypes,
  TravelDeskInvoiceItemSaleTypes,
} from "@/api/travel-desk-invoices-api"

import useCurrentUser from "@/use/use-current-user"

import {
  travelDeskInvoiceFactory,
  travelDeskInvoiceItemFactory,
} from "@/tests/factories/travel-desk-invoice-factory"
import {
  mockHttpClient,
  mockHttpGetRoute,
  mockHttpGetRoutes,
  mockRouter,
  mountWithDefaultPlugins,
} from "@/tests/support"

import TravelDeskInvoiceItemEditCard from "@/components/travel-desk-invoices/TravelDeskInvoiceItemEditCard.vue"
import TravelDeskInvoicesWorkspaceContainer from "@/components/travel-desk-invoices/TravelDeskInvoicesWorkspaceContainer.vue"

const INVOICES_PATH = "/api/travel-desk-travel-requests/42/travel-desk-invoices"

function getButton(wrapper: VueWrapper, label: string) {
  const button = wrapper.findAll("button").find((candidate) => candidate.text() === label)
  if (!button) throw new Error(`Missing ${label} button`)

  return button
}

describe("web/src/components/travel-desk-invoices/TravelDeskInvoicesWorkspaceContainer.vue", () => {
  describe("TravelDeskInvoicesWorkspaceContainer", () => {
    beforeEach(async () => {
      mockHttpGetRoute("/api/current-user", () => ({
        user: { roles: [UserRoles.TRAVEL_DESK_USER] },
      }))
      await useCurrentUser().fetch()
    })

    afterEach(() => {
      useCurrentUser().reset()
    })

    test("when a booking is invoiced, sends its new line as nested item attributes", async () => {
      // Arrange
      const bookingEvent: TravelDeskBookingEventAsIndex = {
        travelOrderIdentifier: 73,
        bookingFileVersionNumber: 1,
        eventType: "BOOK",
        bookingReference: "ABC123",
        reservationSystemDescription: null,
        externalCreatedAt: "2026-11-02T00:00:00Z",
        hostEventTimestamp: null,
        passengerNameRecordCreatedAt: "2026-11-02T00:00:00Z",
        owningAgencyName: null,
        transactionAgencyName: null,
        transactionAgent: "Travel Agent",
        creatingAgencyInternationalAirTransportAssociationNumber: null,
        passengers: [],
        airReservationSegments: [
          {
            airSegmentNumber: 7,
            segmentStatus: null,
            carrierCode: "4N",
            boardPoint: "YXY",
            offPoint: "YVR",
            flightNumber: "501",
            departureDate: null,
            departureTime: null,
            arrivalTime: null,
            changeOfDay: null,
          },
        ],
        serviceFeeTransaction: null,
      }
      const savedItem = travelDeskInvoiceItemFactory.build({
        sourceAirSegmentNumber: 7,
        vendor: "4N",
        description: "4N 501 YXY YVR",
        grossAmount: "125.500",
      })
      const savedInvoice = travelDeskInvoiceFactory.build({
        travelDeskTravelRequestId: 42,
        externalBookingEventIdentifier: 73,
        bookingAgentName: "Travel Agent",
        bookingDate: "2026-11-02",
        grossAmount: "125.500",
        items: [savedItem],
      })
      const httpClient = mockHttpClient()
      mockHttpGetRoutes({
        [INVOICES_PATH]: () => ({ travelDeskInvoices: [], totalCount: 0 }),
        "/api/travel-desk-flight-segments": () => ({ travelDeskFlightSegments: [], totalCount: 0 }),
        "/api/travel-desk-travel-requests/42/travel-desk-booking-events": () => ({
          travelDeskBookingEvents: [bookingEvent],
          totalCount: 1,
        }),
      })
      httpClient.post.mockResolvedValueOnce({ data: {} })
      httpClient.post.mockResolvedValueOnce({ data: { travelDeskInvoice: savedInvoice } })
      const router = mockRouter([{ path: "/", component: { template: "<div />" } }])
      await router.push("/")
      const wrapper = mountWithDefaultPlugins(TravelDeskInvoicesWorkspaceContainer, {
        props: { travelDeskTravelRequestId: "42" },
        global: { plugins: [router] },
      })
      await flushPromises()

      // Act
      await getButton(wrapper, "New invoice").trigger("click")
      await wrapper.get('input[maxlength="6"]').setValue("ABC123")
      await wrapper.get("form").trigger("submit")
      await flushPromises()
      await wrapper.get('input[type="radio"]').setValue()
      await getButton(wrapper, "Use selected booking").trigger("click")
      await wrapper.get('input[maxlength="3"]').setValue("CAD")
      const itemCard = wrapper.getComponent(TravelDeskInvoiceItemEditCard)
      await itemCard.get('input[inputmode="decimal"]').setValue("125.500")
      await getButton(wrapper, "Save invoice").trigger("click")
      await flushPromises()

      // Assert
      expect(httpClient.post).toHaveBeenLastCalledWith(INVOICES_PATH, {
        externalBookingEventIdentifier: 73,
        sourceServiceFeeEventExternalIdentifiers: [],
        currencyCode: "CAD",
        invoiceNumber: null,
        invoiceDate: null,
        warrantNumber: null,
        clientNumber: null,
        clientName: null,
        department: null,
        mailcode: null,
        iataNumber: null,
        bookingAgentName: "Travel Agent",
        ticketingAgentName: null,
        bookingDate: "2026-11-02",
        itemsAttributes: [
          {
            productType: "air",
            travelDeskFlightSegmentId: null,
            sourceAirSegmentNumber: 7,
            sourceServiceFeeEventExternalIdentifier: null,
            passengerName: null,
            ticketNumber: null,
            vendor: "4N",
            description: "4N 501 YXY YVR",
            saleType: "sale",
            grossAmount: "125.500",
            position: 0,
          },
        ],
      })
    })

    test("when a saved line is edited, sends item attributes without its ID", async () => {
      // Arrange
      const savedItem = travelDeskInvoiceItemFactory.build({
        id: 51,
        productType: TravelDeskInvoiceItemProductTypes.AIR,
        sourceAirSegmentNumber: 7,
        vendor: "4N",
        description: "4N 501 YXY YVR",
        saleType: TravelDeskInvoiceItemSaleTypes.SALE,
        grossAmount: "125.500",
      })
      const savedInvoice = travelDeskInvoiceFactory.build({
        id: 23,
        travelDeskTravelRequestId: 42,
        invoiceNumber: "INV-23",
        grossAmount: "125.500",
        items: [savedItem],
      })
      const updatedInvoiceItem = { ...savedItem, id: 52, grossAmount: "140.000" }
      const updatedInvoice = {
        ...savedInvoice,
        grossAmount: "140.000",
        items: [updatedInvoiceItem],
      }
      const httpClient = mockHttpClient()
      mockHttpGetRoutes({
        [INVOICES_PATH]: () => ({ travelDeskInvoices: [savedInvoice], totalCount: 1 }),
        [`${INVOICES_PATH}/23`]: () => ({ travelDeskInvoice: savedInvoice }),
        "/api/travel-desk-flight-segments": () => ({ travelDeskFlightSegments: [], totalCount: 0 }),
      })
      httpClient.patch.mockResolvedValue({ data: { travelDeskInvoice: updatedInvoice } })
      const router = mockRouter([{ path: "/", component: { template: "<div />" } }])
      await router.push("/")
      const wrapper = mountWithDefaultPlugins(TravelDeskInvoicesWorkspaceContainer, {
        props: { travelDeskTravelRequestId: "42" },
        global: { plugins: [router] },
      })
      await flushPromises()

      // Act
      await wrapper.get('[aria-label="Invoices"] .v-list-item').trigger("click")
      await flushPromises()
      await getButton(wrapper, "Edit").trigger("click")
      const itemCard = wrapper.getComponent(TravelDeskInvoiceItemEditCard)
      await itemCard.get('input[inputmode="decimal"]').setValue("140.000")
      await getButton(wrapper, "Save invoice").trigger("click")
      await flushPromises()

      // Assert
      expect(httpClient.patch).toHaveBeenCalledWith(`${INVOICES_PATH}/23`, {
        currencyCode: "CAD",
        invoiceNumber: "INV-23",
        invoiceDate: null,
        warrantNumber: null,
        clientNumber: null,
        clientName: null,
        department: null,
        mailcode: null,
        iataNumber: null,
        bookingAgentName: null,
        ticketingAgentName: null,
        bookingDate: null,
        itemsAttributes: [
          {
            productType: "air",
            travelDeskFlightSegmentId: null,
            sourceAirSegmentNumber: 7,
            sourceServiceFeeEventExternalIdentifier: null,
            passengerName: null,
            ticketNumber: null,
            vendor: "4N",
            description: "4N 501 YXY YVR",
            saleType: "sale",
            grossAmount: "140.000",
            position: 0,
          },
        ],
      })
    })
  })
})
