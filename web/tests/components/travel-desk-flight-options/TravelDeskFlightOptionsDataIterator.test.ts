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

async function renderFlightOptions(
  pages: Record<string, number> = { Leg1: 2 },
  {
    defaultPerPage,
    perPages = {},
  }: {
    defaultPerPage?: number
    perPages?: Record<string, number>
  } = {}
) {
  const routeQuery: Record<string, string> = {}
  for (const [leg, page] of Object.entries(pages)) {
    routeQuery[`pageFlightOptions${leg}`] = String(page)
  }
  for (const [leg, perPage] of Object.entries(perPages)) {
    routeQuery[`perPageFlightOptions${leg}`] = String(perPage)
  }

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
            defaultPerPage,
          })
        )
      ),
  })
  app.use(createVuetify({ ssr: { clientWidth: 1440 } }))
  app.use(router)
  await router.push({
    path: "/",
    query: routeQuery,
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

function renderedPreferences(html: string) {
  return Array.from(html.matchAll(/<input[^>]*value="(\d+)"[^>]*>/g), ([, value]) => value)
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
    expect(renderedPreferences(html)).toEqual(["6", "7", "8", "9", "10"])
  })

  test("keeps each leg's selected page independent", async () => {
    // Act
    const html = await renderFlightOptions({ Leg1: 2, Leg2: 1 })

    // Assert
    expect(selectedPages(html)).toEqual(["2", "1"])
    expect(renderedPreferences(html)).toEqual(["6", "7", "8", "9", "10", "1", "2", "3", "4", "5"])
  })

  test("uses the caller's page size for the server rows and page controls", async () => {
    // Act
    const html = await renderFlightOptions({ Leg1: 2 }, { defaultPerPage: 3 })

    // Assert
    expect(selectedPages(html)).toEqual(["2"])
    expect(renderedPreferences(html)).toEqual(["4", "5", "6"])
    expect(html).toContain('aria-label="Go to page 4"')
  })

  test("restores the URL page size instead of the caller's default", async () => {
    // Act
    const html = await renderFlightOptions(
      { Leg1: 2 },
      { defaultPerPage: 4, perPages: { Leg1: 2 } }
    )

    // Assert
    expect(selectedPages(html)).toEqual(["2"])
    expect(renderedPreferences(html)).toEqual(["3", "4"])
    expect(html).toContain('aria-label="Go to page 6"')
  })

  test("keeps each leg's page size independent", async () => {
    // Act
    const html = await renderFlightOptions({ Leg1: 2, Leg2: 2 }, { perPages: { Leg1: 3, Leg2: 4 } })

    // Assert
    expect(selectedPages(html)).toEqual(["2", "2"])
    expect(renderedPreferences(html)).toEqual(["4", "5", "6", "5", "6", "7", "8"])
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
