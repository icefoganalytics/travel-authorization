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
      expect(pagination).toMatchObject({
        page: { value: 4 },
        perPage: { value: 25 },
      })
    })

    test("when the URL has no pagination, leaves pagination query keys absent", async () => {
      // Arrange
      const router = mockRouter([{ path: "/", component: { render: () => null } }])
      await router.push("/")
      await router.isReady()

      const host = defineComponent({
        setup() {
          useRouteQueryPagination({ page: 4, perPage: 25 })
          return () => null
        },
      })

      // Act
      mount(host, {
        global: {
          plugins: [router],
        },
      })
      await flushPromises()

      // Assert
      expect(router.currentRoute.value.query).toEqual({})
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
      expect(router.currentRoute.value.query).toEqual({
        page: "6",
        perPage: "60",
      })
    })

    test("when one collection page changes, preserves both collections' URL state", async () => {
      // Arrange
      const router = mockRouter([{ path: "/", component: { render: () => null } }])
      await router.push("/?pageTraveller=2&perPageTraveller=5&pageFlights=4&perPageFlights=9")
      await router.isReady()

      let travellerPagination: PaginationState | undefined
      const host = defineComponent({
        setup() {
          travellerPagination = useRouteQueryPagination({ routeQuerySuffix: "Traveller" })
          useRouteQueryPagination({ routeQuerySuffix: "Flights" })
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
      await flushPromises()

      // Act
      travellerPagination.page.value = 7
      await flushPromises()

      // Assert
      expect(router.currentRoute.value.query).toEqual({
        pageTraveller: "7",
        perPageTraveller: "5",
        pageFlights: "4",
        perPageFlights: "9",
      })
    })
  })
})
