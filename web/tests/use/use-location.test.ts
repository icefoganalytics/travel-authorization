import { flushPromises } from "@vue/test-utils"
import { effectScope, nextTick, ref } from "vue"

import { type LocationAsShow } from "@/api/locations-api"

import { locationFactory } from "@/tests/factories"
import { mockHttpGetRoute } from "@/tests/support"

import useLocation from "@/use/use-location"

describe("web/src/use/use-location.ts", () => {
  describe("useLocation", () => {
    test("when a destination is selected, loads its location", async () => {
      // Arrange
      const savedLocation = locationFactory.build({ id: 1, city: "Vancouver" })
      mockHttpGetRoute("/api/locations/1", () => ({ location: savedLocation }))
      const locationId = ref<number | null>(1)
      const scope = effectScope()
      const locationState = scope.run(() => useLocation(locationId))
      if (!locationState) throw new Error("Location state did not initialize")

      try {
        // Act
        await flushPromises()

        // Assert
        expect(locationState.location.value).toEqual(savedLocation)
      } finally {
        scope.stop()
      }
    })

    test("when a destination is cleared during loading, a late response does not restore it", async () => {
      // Arrange
      const savedLocation = locationFactory.build({ id: 1, city: "Vancouver" })
      const { promise, resolve } = Promise.withResolvers<{ location: LocationAsShow }>()
      mockHttpGetRoute("/api/locations/1", () => promise)
      const locationId = ref<number | null>(1)
      const scope = effectScope()
      const locationState = scope.run(() => useLocation(locationId))
      if (!locationState) throw new Error("Location state did not initialize")

      try {
        // Act
        locationId.value = null
        await nextTick()
        resolve({ location: savedLocation })
        await flushPromises()

        // Assert
        expect(locationState.location.value).toBeNull()
      } finally {
        scope.stop()
      }
    })
  })
})
