import { flushPromises, mount } from "@vue/test-utils"
import { isUndefined } from "lodash"
import { defineComponent, type Ref } from "vue"

import { mockRouter } from "@/tests/support"
import useRouteQueryPagination from "@/use/utils/use-route-query-pagination"

type PaginationState = {
  page: Ref<number>
  perPage: Ref<number>
}

describe("web/src/use/utils/use-route-query-pagination.ts", () => {
  describe("useRouteQueryPagination", () => {
    test("when the URL has no pagination, keeps the caller's valid defaults", async () => {
      // Arrange
      const router = mockRouter([{ path: "/", component: { render: () => null } }])
      await router.push("/")
      await router.isReady()

      let pagination: PaginationState | undefined
      const host = defineComponent({
        setup() {
          pagination = useRouteQueryPagination({ page: 4, perPage: 25 })
          return () => null
        },
      })
      // Act
      mount(host, {
        global: {
          plugins: [router],
        },
      })
      if (isUndefined(pagination)) {
        throw new Error("Pagination composable was not mounted")
      }
      await flushPromises()

      // Assert
      expect(pagination.page.value).toBe(4)
      expect(pagination.perPage.value).toBe(25)
      expect(router.currentRoute.value.query.page).toBeUndefined()
      expect(router.currentRoute.value.query.perPage).toBeUndefined()
    })

    test("when the pager writes new values, updates the corresponding URL query values", async () => {
      // Arrange
      const router = mockRouter([{ path: "/", component: { render: () => null } }])
      await router.push("/")
      await router.isReady()

      let pagination: PaginationState | undefined
      const host = defineComponent({
        setup() {
          pagination = useRouteQueryPagination({ page: 4, perPage: 25 })
          return () => null
        },
      })
      mount(host, {
        global: {
          plugins: [router],
        },
      })
      if (isUndefined(pagination)) {
        throw new Error("Pagination composable was not mounted")
      }
      await flushPromises()

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

    test("when one collection page changes, preserves the other collection's URL state", async () => {
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
      if (isUndefined(travellerPagination)) {
        throw new Error("Traveller pagination composable was not mounted")
      }
      if (isUndefined(flightsPagination)) {
        throw new Error("Flights pagination composable was not mounted")
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
