import { ref, watch, type Ref } from "vue"
import { isEqual } from "lodash"

type JsonPrimitive = string | number | boolean | null
type JsonArray = JsonValue[]
type JsonObject = { [key: string]: JsonValue }
type JsonValue = JsonPrimitive | JsonArray | JsonObject

export function useSessionStorage<T extends JsonValue>(key: string, defaultValue: T): Ref<T> {
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

  return data
}

export default useSessionStorage
