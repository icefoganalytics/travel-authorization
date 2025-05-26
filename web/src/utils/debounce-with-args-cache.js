import { debounce } from "lodash"

/** @typedef {Parameters<typeof debounce>["0"]} DebounceableFunction */

/**
 * @param {DebounceableFunction} fn
 * @param {Object} [options={}]
 * @param {number}  [options.wait=300] - [300]
 * @param {boolean} [options.leading=true] - [true]
 * @param {boolean} [options.trailing=true] - [true]
 * @param {number}  [options.cacheSize=10] - [10]
 *
 * @example
 * ```
 * const usersApi = {
 *   async get(userId, params = {}) {
 *     console.trace(`usersApi.get: Fetching user: ${userId} with params:`, params)
 *     const { data } = await http.get(`/api/users/${userId}`, { params })
 *     return data
 *   },
 * }
 *
 * usersApi.get = debounceWithArgsCache(usersApi.get, 300, 10)
 *
 * usersApi.get(1, { role: "admin" })
 * usersApi.get(2, { role: "user" })
 * usersApi.get(1, { role: "admin" })
 * setTimeout(() => usersApi.get(1, { role: "admin" }), 400)
 * ```
 */
export function debounceWithArgsCache(
  fn,
  { wait = 300, leading = true, trailing = true, cacheSize = 10 } = {}
) {
  const invocationCache = new Map()

  return (...args) => {
    const argsKey = JSON.stringify(args)

    if (invocationCache.has(argsKey)) {
      const debouncedFn = invocationCache.get(argsKey)
      const result = debouncedFn(...args)
      return result
    }

    if (invocationCache.size >= cacheSize) {
      const oldestInvocation = invocationCache.keys().next().value
      invocationCache.delete(oldestInvocation)
    }

    const debouncedFn = debounce(fn, wait, { leading, trailing })
    invocationCache.set(argsKey, debouncedFn)

    const result = debouncedFn(...args)
    return result
  }
}

export default debounceWithArgsCache
