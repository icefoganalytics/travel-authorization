import { computed, watch } from "vue"

import { MAX_PER_PAGE } from "@/api/base-api"
import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"

const DEFAULT_PAGE = 1
const DEFAULT_PER_PAGE = 10

function isValidPage(value: number): boolean {
  return Number.isFinite(value) && Number.isInteger(value) && value > 0
}

function isValidPerPage(value: number): boolean {
  return isValidPage(value) && value <= MAX_PER_PAGE
}

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
  const defaultPage = isValidPage(page) ? page : DEFAULT_PAGE
  const defaultPerPage = isValidPerPage(perPage) ? perPage : DEFAULT_PER_PAGE

  const queryPage = useRouteQuery<string, number>(
    `page${routeQuerySuffix}`,
    defaultPage.toString(),
    {
      transform: integerTransformer,
    }
  )

  const queryPerPage = useRouteQuery<string, number>(
    `perPage${routeQuerySuffix}`,
    defaultPerPage.toString(),
    {
      transform: integerTransformer,
    }
  )

  const normalizedPage = computed({
    get() {
      return isValidPage(queryPage.value) ? queryPage.value : defaultPage
    },
    set(value: number) {
      queryPage.value = isValidPage(value) ? value : defaultPage
    },
  })

  const normalizedPerPage = computed({
    get() {
      return isValidPerPage(queryPerPage.value) ? queryPerPage.value : defaultPerPage
    },
    set(value: number) {
      queryPerPage.value = isValidPerPage(value) ? value : defaultPerPage
    },
  })

  watch(
    queryPage,
    (value) => {
      if (!isValidPage(value)) queryPage.value = defaultPage
    },
    { immediate: true }
  )

  watch(
    queryPerPage,
    (value) => {
      if (!isValidPerPage(value)) queryPerPage.value = defaultPerPage
    },
    { immediate: true }
  )

  return {
    page: normalizedPage,
    perPage: normalizedPerPage,
  }
}

export default useRouteQueryPagination
