import { flushPromises, mount } from "@vue/test-utils"
import { defineComponent, type Ref } from "vue"

import { MAX_PER_PAGE } from "@/api/base-api"
import { mockRouter } from "@/tests/support"
import useRouteQueryPagination from "@/use/utils/use-route-query-pagination"

type PaginationOptions = Parameters<typeof useRouteQueryPagination>[0]
type PaginationState = {
  page: Ref<number>
  perPage: Ref<number>
}

async function mountPagination(url: string, options: PaginationOptions = {}) {
  const router = mockRouter([{ path: "/", component: { render: () => null } }])
  await router.push(url)
  await router.isReady()

  let pagination: PaginationState | undefined
  const host = defineComponent({
    setup() {
      pagination = useRouteQueryPagination(options)
      return () => null
    },
  })
  mount(host, {
    global: {
      plugins: [router],
    },
  })

  if (pagination === undefined) throw new Error("Pagination composable was not mounted")

  await flushPromises()

  return { pagination, router }
}

describe("web/src/use/utils/use-route-query-pagination.ts", () => {
  describe("useRouteQueryPagination", () => {
    test.each(["0", "-3", "not-a-number"])(
      "when the URL page is %s, restores the caller's default and corrects the query",
      async (invalidPage) => {
        // Arrange
        const { pagination, router } = await mountPagination(
          `/?page=${encodeURIComponent(invalidPage)}&perPage=25`,
          { page: 4, perPage: 25 }
        )

        // Assert
        expect(pagination.page.value).toBe(4)
        expect(pagination.perPage.value).toBe(25)
        expect(router.currentRoute.value.query.page).toBeUndefined()
        expect(router.currentRoute.value.query.perPage).toBe("25")
      }
    )

    test.each(["0", "-3", "not-a-number", "1001"])(
      "when the URL page size is %s, restores the caller's default and corrects the query",
      async (invalidPerPage) => {
        // Arrange
        const { pagination, router } = await mountPagination(
          `/?page=6&perPage=${encodeURIComponent(invalidPerPage)}`,
          { page: 4, perPage: 30 }
        )

        // Assert
        expect(pagination.page.value).toBe(6)
        expect(pagination.perPage.value).toBe(30)
        expect(router.currentRoute.value.query.page).toBe("6")
        expect(router.currentRoute.value.query.perPage).toBeUndefined()
      }
    )

    test("when caller defaults are invalid, uses the standard defaults", async () => {
      // Arrange
      const { pagination, router } = await mountPagination("/?page=0&perPage=1001", {
        page: -2,
        perPage: 1001,
      })

      // Assert
      expect(pagination.page.value).toBe(1)
      expect(pagination.perPage.value).toBe(10)
      expect(router.currentRoute.value.query.page).toBeUndefined()
      expect(router.currentRoute.value.query.perPage).toBeUndefined()
    })

    test("when the URL provides valid values, keeps the URL overrides including the API page-size maximum", async () => {
      // Arrange
      const { pagination, router } = await mountPagination(`/?page=3&perPage=${MAX_PER_PAGE}`, {
        page: 4,
        perPage: 25,
      })

      // Assert
      expect(pagination.page.value).toBe(3)
      expect(pagination.perPage.value).toBe(MAX_PER_PAGE)
      expect(router.currentRoute.value.query.page).toBe("3")
      expect(router.currentRoute.value.query.perPage).toBe(MAX_PER_PAGE.toString())
    })

    test("when the caller has valid defaults and the URL has no pagination, keeps those defaults", async () => {
      // Arrange
      const { pagination, router } = await mountPagination("/", {
        page: 4,
        perPage: 25,
      })

      // Assert
      expect(pagination.page.value).toBe(4)
      expect(pagination.perPage.value).toBe(25)
      expect(router.currentRoute.value.query.page).toBeUndefined()
      expect(router.currentRoute.value.query.perPage).toBeUndefined()
    })

    test("when the pager writes new values, updates the corresponding URL query values", async () => {
      // Arrange
      const { pagination, router } = await mountPagination("/", {
        page: 4,
        perPage: 25,
      })

      // Act
      pagination.page.value = 6
      pagination.perPage.value = 60
      await flushPromises()

      // Assert
      expect(pagination.page.value).toBe(6)
      expect(pagination.perPage.value).toBe(60)
      expect(router.currentRoute.value.query.page).toBe("6")
      expect(router.currentRoute.value.query.perPage).toBe("60")
    })

    test("when collections use suffixes, keeps their URL state independent", async () => {
      // Arrange
      const router = mockRouter([{ path: "/", component: { render: () => null } }])
      await router.push("/?pageTraveller=2&perPageTraveller=5&pageFlights=4&perPageFlights=9")
      await router.isReady()

      let travellerPagination: PaginationState | undefined
      let flightsPagination: PaginationState | undefined
      const host = defineComponent({
        setup() {
          travellerPagination = useRouteQueryPagination({ routeQuerySuffix: "Traveller" })
          flightsPagination = useRouteQueryPagination({ routeQuerySuffix: "Flights" })
          return () => null
        },
      })
      mount(host, {
        global: {
          plugins: [router],
        },
      })
      if (travellerPagination === undefined || flightsPagination === undefined) {
        throw new Error("Pagination composables were not mounted")
      }
      await flushPromises()

      // Act
      travellerPagination.page.value = 7
      await flushPromises()

      // Assert
      expect(travellerPagination.page.value).toBe(7)
      expect(flightsPagination.page.value).toBe(4)
      expect(router.currentRoute.value.query.pageTraveller).toBe("7")
      expect(router.currentRoute.value.query.perPageTraveller).toBe("5")
      expect(router.currentRoute.value.query.pageFlights).toBe("4")
      expect(router.currentRoute.value.query.perPageFlights).toBe("9")
    })
  })
})
