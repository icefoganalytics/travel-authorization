import { computed, createSSRApp, h, ref, unref, type Ref } from "vue"
import { renderToString } from "@vue/server-renderer"
import { createMemoryHistory, createRouter } from "vue-router"
import { createVuetify } from "vuetify"

import type { TravelDeskFlightOptionsQueryOptions } from "@/api/travel-desk-flight-options-api"

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
    default: (query: Ref<TravelDeskFlightOptionsQueryOptions>) => ({
      travelDeskFlightOptions: computed(() => {
        const { page = 1, perPage = 5 } = unref(query)
        const firstOptionIndex = (page - 1) * perPage
        return flightOptions.slice(firstOptionIndex, firstOptionIndex + perPage)
      }),
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

async function renderFlightOptions(pages: Record<string, number> = { Leg1: 2 }) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: "/", component: { render: () => null } }],
  })
  const app = createSSRApp({
    render: () =>
      h(
        "div",
        Object.keys(pages).map((leg) =>
          h(TravelDeskFlightOptionsDataIterator, {
            routeQuerySuffix: `FlightOptions${leg}`,
          })
        )
      ),
  })
  app.use(createVuetify({ ssr: { clientWidth: 1440 } }))
  app.use(router)
  await router.push({
    path: "/",
    query: Object.fromEntries(
      Object.entries(pages).map(([leg, page]) => [`pageFlightOptions${leg}`, String(page)])
    ),
  })
  await router.isReady()
  return renderToString(app)
}

function selectedPages(html: string) {
  return Array.from(
    html.matchAll(/<button[^>]*aria-current="true"[^>]*>([\s\S]*?)<\/button>/g),
    ([, content]) => content.replace(/<[^>]*>/g, "").trim()
  )
}

describe("web/src/components/travel-desk-flight-options/TravelDeskFlightOptionsDataIterator.vue", () => {
  beforeEach(() => {
    flightOptions.forEach((option, index) => {
      option.flightPreferenceOrder = String(index + 1)
      option.additionalInformation = null
    })
  })

  test("shows the selected server page without slicing its rows a second time", async () => {
    // Act
    const html = await renderFlightOptions()

    // Assert
    expect(selectedPages(html)).toEqual(["2"])
    expect(html).toContain('value="6"')
    expect(html).toContain('value="10"')
    expect(html).not.toContain('value="1"')
    expect(html).not.toContain('value="12"')
  })

  test("keeps each leg's selected page independent", async () => {
    // Act
    const html = await renderFlightOptions({ Leg1: 2, Leg2: 1 })

    // Assert
    expect(selectedPages(html)).toEqual(["2", "1"])
    expect(html).toContain('value="6"')
    expect(html).toContain('value="1"')
  })

  test("distinguishes rejected and unranked options and shows the rejection explanation", async () => {
    // Arrange
    flightOptions[5].flightPreferenceOrder = "Does Not Work"
    flightOptions[5].additionalInformation = "Arrives too late for the meeting."
    flightOptions[6].flightPreferenceOrder = null

    // Act
    const html = await renderFlightOptions()

    // Assert
    expect(html).toContain('value="Does Not Work"')
    expect(html).toContain('value="Not Ranked"')
    expect(html).toContain("Arrives too late for the meeting.")
  })
})
