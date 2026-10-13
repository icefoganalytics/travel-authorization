import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"

const DEFAULT_PAGE = 1
const DEFAULT_PER_PAGE = 10

/** Use with EnhancedPagination and a unique suffix for each collection. */
export function useRouteQueryPagination({
  page = DEFAULT_PAGE,
  perPage = DEFAULT_PER_PAGE,
  routeQuerySuffix = "",
}: {
  page?: number
  perPage?: number
  routeQuerySuffix?: string
} = {}) {
  const queryPage = useRouteQuery<string, number>(`page${routeQuerySuffix}`, page.toString(), {
    transform: integerTransformer,
  })

  const queryPerPage = useRouteQuery<string, number>(
    `perPage${routeQuerySuffix}`,
    perPage.toString(),
    {
      transform: integerTransformer,
    }
  )

  return {
    page: queryPage,
    perPage: queryPerPage,
  }
}

export default useRouteQueryPagination
