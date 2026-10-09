import { createSSRApp, h, ref } from "vue"
import { renderToString } from "@vue/server-renderer"
import { createVuetify } from "vuetify"

import TravelDeskFlightOptionsDataIterator from "@/components/travel-desk-flight-options/TravelDeskFlightOptionsDataIterator.vue"

const { flightOptions } = vi.hoisted(() => ({
  flightOptions: Array.from({ length: 12 }, (_, index) => ({
    id: index + 1,
    cost: String(300 + index),
    flightPreferenceOrder: String(index + 1) as string | null,
    additionalInformation: null as string | null,
  })),
}))

vi.mock("@/api/http-client", () => ({
  default: {},
}))

vi.mock("@/use/use-travel-desk-flight-options", () => {
  return {
    default: () => ({
      travelDeskFlightOptions: ref(flightOptions),
      totalCount: ref(flightOptions.length),
      isLoading: ref(false),
      isErrored: ref(false),
    }),
  }
})

vi.mock("@/use/use-travel-desk-flight-segments", () => {
  return {
    default: () => ({
      travelDeskFlightSegments: ref([]),
      isLoading: ref(false),
    }),
  }
})

async function renderFlightOptions() {
  const app = createSSRApp({
    render: () => h(TravelDeskFlightOptionsDataIterator),
  })
  app.use(createVuetify())
  return renderToString(app)
}

describe("web/src/components/travel-desk-flight-options/TravelDeskFlightOptionsDataIterator.vue", () => {
  test("shows options beyond the iterator's default first page", async () => {
    // Act
    const html = await renderFlightOptions()

    // Assert
    expect(html).toContain('value="12"')
    expect(html).toContain('value="$311.00"')
  })

  test("distinguishes rejected and unranked options and shows the rejection explanation", async () => {
    // Arrange
    flightOptions[0].flightPreferenceOrder = "Does Not Work"
    flightOptions[0].additionalInformation = "Arrives too late for the meeting."
    flightOptions[1].flightPreferenceOrder = null

    // Act
    const html = await renderFlightOptions()

    // Assert
    expect(html).toContain('value="Does Not Work"')
    expect(html).toContain('value="Not Ranked"')
    expect(html).toContain("Arrives too late for the meeting.")
  })
})
