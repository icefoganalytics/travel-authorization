import { ref, watch, type Ref } from "vue"
import { isEqual } from "lodash"

/**
 * Store and retrieve JSON-serializable values in session storage.
 * Valid JSON types: string, number, boolean, null, arrays, and plain objects.
 * Invalid: undefined, functions, symbols, bigint, circular references.
 */
export function useSessionStorage<T>(key: string, defaultValue: T): Ref<T> {
  const storedValue = sessionStorage.getItem(key)
  const data = ref<T>(storedValue ? JSON.parse(storedValue) : defaultValue)

  watch(
    data,
    (newValue) => {
      if (isEqual(newValue, defaultValue)) {
        sessionStorage.removeItem(key)
      } else {
        sessionStorage.setItem(key, JSON.stringify(newValue))
      }
    },
    { deep: true }
  )

  return data as Ref<T>
}

export default useSessionStorage
