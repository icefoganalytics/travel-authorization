/**
 * See https://vueuse.org/router/useRouteQuery/ (v14.0.0)
 *
 * Code back-ported from https://github.com/vueuse/vueuse/blob/1c00755cb14d7344abb69800a11ef62379037271/packages/router/useRouteQuery/index.ts
 * use-route-query types taken from https://github.com/vueuse/vueuse/blob/1c00755cb14d7344abb69800a11ef62379037271/packages/router/_types.ts
 * Vue-router types taken from https://github.com/vuejs/router/blob/0d1529371204084c3792e105c3ff82c49cd7861d/packages/router/src/types/index.ts#L41
 */

import type { Ref } from "vue"
import { customRef, nextTick, watch } from "vue-demi"
import { type MaybeRefOrGetter, type MaybeRef, tryOnScopeDispose, toValue } from "@vueuse/shared"
import { useRoute, useRouter, type Router } from "vue2-helpers/vue-router"

export * from "@/utils/use-route-query-transformers"

export type RouteParamValue = string
export type RouteParamValueRaw = RouteParamValue | number | null | undefined
export type RouteQueryValueRaw = RouteParamValueRaw | string[]
export interface ReactiveRouteOptions {
  /**
   * Mode to update the router query, ref is also acceptable
   *
   * @default 'replace'
   */
  mode?: MaybeRef<"replace" | "push">

  /**
   * Route instance, use `useRoute()` if not given
   */
  route?: ReturnType<typeof useRoute>

  /**
   * Router instance, use `useRouter()` if not given
   */
  router?: ReturnType<typeof useRouter>
}
export interface ReactiveRouteOptionsWithTransform<V, R> extends ReactiveRouteOptions {
  /**
   * Function to transform data before return, or an object with one or both functions:
   * `get` to transform data before returning, and `set` to transform data before setting
   */
  transform?:
    | ((val: V) => R)
    | {
        get?: (value: V) => R
        set?: (value: R) => V
      }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _queue = new WeakMap<Router, Map<string, any>>()

export function useRouteQuery(name: string): Ref<undefined | null | string | string[]>

export function useRouteQuery<T extends RouteQueryValueRaw = RouteQueryValueRaw, K = T>(
  name: string,
  defaultValue?: MaybeRefOrGetter<T>,
  options?: ReactiveRouteOptionsWithTransform<T, K>
): Ref<K>

export function useRouteQuery<T extends RouteQueryValueRaw = RouteQueryValueRaw, K = T>(
  name: string,
  defaultValue?: MaybeRefOrGetter<T>,
  options: ReactiveRouteOptionsWithTransform<T, K> = {}
): Ref<K> {
  const { mode = "replace", route = useRoute(), router = useRouter(), transform } = options

  let transformGet = (value: T) => value as unknown as K
  let transformSet = (value: K) => value as unknown as T

  if (typeof transform === "function") {
    transformGet = transform
  } else if (transform) {
    if (transform.get) transformGet = transform.get
    if (transform.set) transformSet = transform.set
  }

  if (!_queue.has(router)) _queue.set(router, new Map())

  const _queriesQueue = _queue.get(router)!

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let query = route.query[name] as any

  tryOnScopeDispose(() => {
    query = undefined
  })

  let _trigger: () => void

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const proxy = customRef<any>((track, trigger) => {
    _trigger = trigger

    return {
      get() {
        track()

        return transformGet(query !== undefined ? query : toValue(defaultValue))
      },
      set(v) {
        v = transformSet(v)

        if (query === v) return

        query = v === toValue(defaultValue) ? undefined : v
        _queriesQueue.set(name, v === toValue(defaultValue) ? undefined : v)

        trigger()

        nextTick(() => {
          if (_queriesQueue.size === 0) return

          const newQueries = Object.fromEntries(_queriesQueue.entries())
          _queriesQueue.clear()

          const { params, query, hash } = route

          // Check if the new query is actually different before navigating
          const newQueryParams = { ...query, ...newQueries }
          if (JSON.stringify(newQueryParams) === JSON.stringify(route.query)) {
            return // Stop navigation if nothing changed
          }

          router[toValue(mode)]({
            params,
            query: { ...query, ...newQueries },
            hash,
          })
          // If you actually want to try to debug the nav duplication error, use the following.
          // .catch((error) => {
          //   if (error.name === "NavigationDuplicated") {
          //     console.warn(error)
          //   } else {
          //     console.error(error)
          //   }
          // })
        })
      },
    }
  })

  watch(
    () => route.query[name],
    (v) => {
      if (query === transformGet(v as T)) return

      query = v

      _trigger()
    },
    { flush: "sync" }
  )

  return proxy as Ref<K>
}

export default useRouteQuery
