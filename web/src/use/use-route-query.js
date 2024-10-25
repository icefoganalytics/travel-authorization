import { customRef, nextTick, watch } from "vue-demi"
import { toValue, tryOnScopeDispose } from "@vueuse/shared"
import { useRoute, useRouter } from "vue2-helpers/vue-router"

export { integerTransformer } from "@/utils/use-route-query-transformers"

const _queue = new WeakMap()

/**
 * See https://vueuse.org/router/useRouteQuery/
 *
 * code back-ported from https://github.com/vueuse/vueuse/blob/efd507956638328bb74b584712ebb78ed3590112/packages/router/useRouteQuery/index.ts
 */
export function useRouteQuery(name, defaultValue, options = {}) {
  const {
    mode = "replace",
    route = useRoute(),
    router = useRouter(),
    transform = (value) => value,
  } = options

  if (!_queue.has(router)) _queue.set(router, new Map())

  const _queriesQueue = _queue.get(router)

  let query = route.query[name]

  tryOnScopeDispose(() => {
    query = undefined
  })

  /** @type {() => void} */
  let _trigger

  const proxy = customRef((track, trigger) => {
    _trigger = trigger

    return {
      get() {
        track()

        return transform(query !== undefined ? query : toValue(defaultValue))
      },
      set(v) {
        if (query === v) return

        query = v === defaultValue || v === null ? undefined : v
        _queriesQueue.set(name, v === defaultValue || v === null ? undefined : v)

        trigger()

        nextTick(() => {
          if (_queriesQueue.size === 0) return

          const newQueries = Object.fromEntries(_queriesQueue.entries())
          _queriesQueue.clear()

          const { params, query, hash } = route

          router[toValue(mode)]({
            params,
            query: { ...query, ...newQueries },
            hash,
          })
        })
      },
    }
  })

  watch(
    () => route.query[name],
    (v) => {
      query = v

      _trigger()
    },
    { flush: "sync" }
  )

  return proxy
}

export default useRouteQuery
