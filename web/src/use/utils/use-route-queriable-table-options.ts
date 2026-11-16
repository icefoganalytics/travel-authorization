import useRouteQueryPagination from "@/use/utils/use-route-query-pagination"
import useVuetifySortByToSafeRouteQuery, {
  type SortItem,
} from "@/use/utils/use-vuetify-sort-by-to-safe-route-query"
import useVuetifySortByToSequelizeSafeOrder from "@/use/utils/use-vuetify-sort-by-to-sequelize-safe-order"

export function useRouteQueriableTableOptions({
  page: defaultPage,
  perPage: defaultPerPage,
  sortBy: defaultSortBy,
  routeQuerySuffix = "",
}: {
  page?: number
  perPage?: number
  sortBy?: SortItem[]
  routeQuerySuffix?: string
} = {}) {
  const { page, perPage } = useRouteQueryPagination({
    page: defaultPage,
    perPage: defaultPerPage,
    routeQuerySuffix,
  })
  const sortBy = useVuetifySortByToSafeRouteQuery(`sortBy${routeQuerySuffix}`, defaultSortBy)
  const order = useVuetifySortByToSequelizeSafeOrder(sortBy)

  return {
    page,
    perPage,
    sortBy,
    order,
  }
}

export default useRouteQueriableTableOptions
