import { flushPromises, mount } from "@vue/test-utils"
import { isUndefined } from "lodash"
import { defineComponent } from "vue"

import useRouteQueriableTableOptions, {
  type RouteQueriableTableOptions,
} from "@/use/utils/use-route-queriable-table-options"

import { mockRouter } from "@/tests/support"

describe("web/src/use/utils/use-route-queriable-table-options.ts", () => {
  describe("useRouteQueriableTableOptions", () => {
    test("when a bookmark supplies table options, restores pagination and nested API ordering", async () => {
      // Arrange
      const router = mockRouter([{ path: "/", component: { render: () => null } }])
      await router.push("/?pageMeals=3&perPageMeals=-1&sortByMeals=traveller.lastName_desc")
      await router.isReady()
      let options: RouteQueriableTableOptions | undefined
      const host = defineComponent({
        setup() {
          options = useRouteQueriableTableOptions({
            routeQuerySuffix: "Meals",
            page: 2,
            perPage: 25,
            sortBy: [{ key: "date", order: "asc" }],
          })
          return () => null
        },
      })

      // Act
      mount(host, { global: { plugins: [router] } })
      await flushPromises()

      // Assert
      expect(options).toMatchObject({
        page: { value: 3 },
        perPage: { value: -1 },
        sortBy: {
          value: [
            {
              key: "traveller.lastName",
              order: "desc",
            },
          ],
        },
        order: { value: [["traveller", "lastName", "DESC"]] },
      })
    })

    test("when no bookmark is present, applies caller pagination and multi-column sort defaults", async () => {
      // Arrange
      const router = mockRouter([{ path: "/", component: { render: () => null } }])
      await router.push("/")
      await router.isReady()
      let options: RouteQueriableTableOptions | undefined
      const host = defineComponent({
        setup() {
          options = useRouteQueriableTableOptions({
            page: 4,
            perPage: 25,
            sortBy: [
              { key: "date", order: "asc" },
              { key: "cost", order: "desc" },
            ],
          })
          return () => null
        },
      })

      // Act
      mount(host, { global: { plugins: [router] } })
      await flushPromises()

      // Assert
      expect(options).toMatchObject({
        page: { value: 4 },
        perPage: { value: 25 },
        order: {
          value: [
            ["date", "ASC"],
            ["cost", "DESC"],
          ],
        },
      })
    })

    test("when sorting is not requested, leaves API ordering unspecified", async () => {
      // Arrange
      const router = mockRouter([{ path: "/", component: { render: () => null } }])
      await router.push("/")
      await router.isReady()
      let options: RouteQueriableTableOptions | undefined
      const host = defineComponent({
        setup() {
          options = useRouteQueriableTableOptions()
          return () => null
        },
      })

      // Act
      mount(host, { global: { plugins: [router] } })
      await flushPromises()

      // Assert
      expect(options).toMatchObject({
        page: { value: 1 },
        perPage: { value: 10 },
        sortBy: { value: undefined },
        order: { value: undefined },
      })
    })

    test("when one table changes, preserves the other table and unrelated query parameters", async () => {
      // Arrange
      const router = mockRouter([{ path: "/", component: { render: () => null } }])
      await router.push(
        "/?pageMeals=2&perPageMeals=5&sortByMeals=date_asc&pageCodings=4&perPageCodings=25&sortByCodings=code_desc&filter=active"
      )
      await router.isReady()
      let options: RouteQueriableTableOptions | undefined
      const host = defineComponent({
        setup() {
          options = useRouteQueriableTableOptions({ routeQuerySuffix: "Meals" })
          useRouteQueriableTableOptions({ routeQuerySuffix: "Codings" })
          return () => null
        },
      })
      mount(host, { global: { plugins: [router] } })
      if (isUndefined(options)) {
        throw new Error("Table options composable was not mounted")
      }
      await flushPromises()

      // Act
      options.page.value = 6
      options.perPage.value = -1
      options.sortBy.value = [{ key: "cost", order: "desc" }]
      await flushPromises()

      // Assert
      expect(router.currentRoute.value.query).toEqual({
        pageMeals: "6",
        perPageMeals: "-1",
        sortByMeals: ["cost_desc"],
        pageCodings: "4",
        perPageCodings: "25",
        sortByCodings: "code_desc",
        filter: "active",
      })
    })

    test("when sorting is cleared, removes the previous API ordering", async () => {
      // Arrange
      const router = mockRouter([{ path: "/", component: { render: () => null } }])
      await router.push("/?sortBy=date_desc")
      await router.isReady()
      let options: RouteQueriableTableOptions | undefined
      const host = defineComponent({
        setup() {
          options = useRouteQueriableTableOptions()
          return () => null
        },
      })
      mount(host, { global: { plugins: [router] } })
      if (isUndefined(options)) {
        throw new Error("Table options composable was not mounted")
      }
      await flushPromises()

      // Act
      options.sortBy.value = []
      await flushPromises()

      // Assert
      expect(options.order.value).toBeUndefined()
    })

    test("when navigation returns to a saved query, restores its table options", async () => {
      // Arrange
      const router = mockRouter([{ path: "/", component: { render: () => null } }])
      await router.push("/?pageMeals=3&perPageMeals=25&sortByMeals=date_desc")
      await router.isReady()
      let options: RouteQueriableTableOptions | undefined
      const host = defineComponent({
        setup() {
          options = useRouteQueriableTableOptions({ routeQuerySuffix: "Meals" })
          return () => null
        },
      })
      mount(host, { global: { plugins: [router] } })
      await router.push("/?pageMeals=2&sortByMeals=cost_asc")
      await flushPromises()

      // Act
      router.back()
      await flushPromises()

      // Assert
      expect(options).toMatchObject({
        page: { value: 3 },
        perPage: { value: 25 },
        sortBy: {
          value: [
            {
              key: "date",
              order: "desc",
            },
          ],
        },
        order: { value: [["date", "DESC"]] },
      })
    })
  })
})
