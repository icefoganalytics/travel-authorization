import { flushPromises } from "@vue/test-utils"
import { effectScope, nextTick, ref, type EffectScope } from "vue"

import travelDeskFlightOptionsApi, {
  type TravelDeskFlightOption,
} from "@/api/travel-desk-flight-options-api"

import travelDeskFlightOptionFactory from "@/tests/factories/travel-desk-flight-option-factory"
import { useTravelDeskFlightOptions } from "@/use/use-travel-desk-flight-options"

vi.mock("@/api/http-client", () => ({
  default: {},
}))

vi.mock("@/api/travel-desk-flight-options-api")

type TravelDeskFlightOptionsResponse = {
  travelDeskFlightOptions: TravelDeskFlightOption[]
  totalCount: number
}

function createDeferredPromise<T>() {
  let resolvePromise: (value: T | PromiseLike<T>) => void = () => {}
  let rejectPromise: (reason?: unknown) => void = () => {}
  const promise = new Promise<T>((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject
  })

  return {
    promise,
    resolve: resolvePromise,
    reject: rejectPromise,
  }
}

describe("web/src/use/use-travel-desk-flight-options.js", () => {
  const travelDeskFlightOptionsApiMock = vi.mocked(travelDeskFlightOptionsApi)
  let scope: EffectScope | undefined

  beforeEach(() => {
    travelDeskFlightOptionsApiMock.list.mockReset()
  })

  afterEach(() => {
    scope?.stop()
    scope = undefined
  })

  describe("useTravelDeskFlightOptions", () => {
    test("when an older page request completes last, keeps the newer page results", async () => {
      // Arrange
      const earlierRequest = createDeferredPromise<TravelDeskFlightOptionsResponse>()
      const laterRequest = createDeferredPromise<TravelDeskFlightOptionsResponse>()
      const earlierOption = travelDeskFlightOptionFactory.build({ id: 101 })
      const laterOption = travelDeskFlightOptionFactory.build({ id: 202 })
      travelDeskFlightOptionsApiMock.list
        .mockReturnValueOnce(earlierRequest.promise)
        .mockReturnValueOnce(laterRequest.promise)

      const options = ref({ page: 1, perPage: 10 })
      const shouldSkipWatch = ref(true)
      scope = effectScope()
      const composable = scope.run(() =>
        useTravelDeskFlightOptions(options, {
          skipWatchIf: () => shouldSkipWatch.value,
        })
      )
      if (!composable) throw new Error("Composable must run inside its effect scope")

      // Act
      shouldSkipWatch.value = false
      await nextTick()
      options.value.page = 2
      await nextTick()

      laterRequest.resolve({
        travelDeskFlightOptions: [laterOption],
        totalCount: 20,
      })
      await flushPromises()
      earlierRequest.resolve({
        travelDeskFlightOptions: [earlierOption],
        totalCount: 10,
      })
      await flushPromises()

      // Assert
      expect(composable.travelDeskFlightOptions.value).toEqual([laterOption])
      expect(composable.totalCount.value).toBe(20)
      expect(composable.isErrored.value).toBe(false)
      expect(composable.isLoading.value).toBe(false)
    })

    test("when an older page request completes during a newer request, keeps loading", async () => {
      // Arrange
      const earlierRequest = createDeferredPromise<TravelDeskFlightOptionsResponse>()
      const laterRequest = createDeferredPromise<TravelDeskFlightOptionsResponse>()
      const laterOption = travelDeskFlightOptionFactory.build({ id: 202 })
      travelDeskFlightOptionsApiMock.list
        .mockReturnValueOnce(earlierRequest.promise)
        .mockReturnValueOnce(laterRequest.promise)

      const options = ref({ page: 1, perPage: 10 })
      const shouldSkipWatch = ref(true)
      scope = effectScope()
      const composable = scope.run(() =>
        useTravelDeskFlightOptions(options, {
          skipWatchIf: () => shouldSkipWatch.value,
        })
      )
      if (!composable) throw new Error("Composable must run inside its effect scope")

      shouldSkipWatch.value = false
      await nextTick()
      options.value.page = 2
      await nextTick()

      // Act
      earlierRequest.resolve({
        travelDeskFlightOptions: [travelDeskFlightOptionFactory.build({ id: 101 })],
        totalCount: 10,
      })
      await flushPromises()

      // Assert
      expect(composable.travelDeskFlightOptions.value).toEqual([])
      expect(composable.totalCount.value).toBe(0)
      expect(composable.isErrored.value).toBe(false)
      expect(composable.isLoading.value).toBe(true)

      laterRequest.resolve({
        travelDeskFlightOptions: [laterOption],
        totalCount: 20,
      })
      await flushPromises()

      expect(composable.travelDeskFlightOptions.value).toEqual([laterOption])
      expect(composable.totalCount.value).toBe(20)
      expect(composable.isLoading.value).toBe(false)
    })

    test("when an older request fails, it does not set the current error state", async () => {
      // Arrange
      const earlierRequest = createDeferredPromise<TravelDeskFlightOptionsResponse>()
      const laterRequest = createDeferredPromise<TravelDeskFlightOptionsResponse>()
      const laterOption = travelDeskFlightOptionFactory.build({ id: 202 })
      travelDeskFlightOptionsApiMock.list
        .mockReturnValueOnce(earlierRequest.promise)
        .mockReturnValueOnce(laterRequest.promise)

      const options = ref({ page: 1, perPage: 10 })
      const shouldSkipWatch = ref(true)
      scope = effectScope()
      const composable = scope.run(() =>
        useTravelDeskFlightOptions(options, {
          skipWatchIf: () => shouldSkipWatch.value,
        })
      )
      if (!composable) throw new Error("Composable must run inside its effect scope")

      const earlierFetch = composable.fetch()
      const laterFetch = composable.fetch()
      const requestError = new Error("Earlier page failed")

      // Act
      earlierRequest.reject(requestError)
      await expect(earlierFetch).rejects.toBe(requestError)

      // Assert
      expect(composable.isErrored.value).toBe(false)
      expect(composable.isLoading.value).toBe(true)

      laterRequest.resolve({
        travelDeskFlightOptions: [laterOption],
        totalCount: 20,
      })
      await expect(laterFetch).resolves.toEqual([laterOption])

      expect(composable.travelDeskFlightOptions.value).toEqual([laterOption])
      expect(composable.totalCount.value).toBe(20)
      expect(composable.isErrored.value).toBe(false)
      expect(composable.isLoading.value).toBe(false)
    })
  })
})
