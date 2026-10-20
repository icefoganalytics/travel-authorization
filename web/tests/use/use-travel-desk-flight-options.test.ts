import { CanceledError } from "axios"
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

function rejectWhenAborted<T>(
  request: { promise: Promise<T>; reject: (reason?: unknown) => void },
  signal: AbortSignal | undefined
) {
  if (!signal) throw new Error("An abort signal must be provided")

  const rejectAsCanceled = () => request.reject(new CanceledError("canceled"))
  if (signal.aborted) {
    rejectAsCanceled()
  } else {
    signal.addEventListener("abort", rejectAsCanceled, { once: true })
  }

  return request.promise
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
    test("cancels stale query requests and displays the latest results", async () => {
      // Arrange
      const earlierRequest = createDeferredPromise<TravelDeskFlightOptionsResponse>()
      const laterRequest = createDeferredPromise<TravelDeskFlightOptionsResponse>()
      const laterOption = travelDeskFlightOptionFactory.build({ id: 202 })
      let earlierSignal: AbortSignal | undefined
      let laterSignal: AbortSignal | undefined
      const consoleError = vi.spyOn(console, "error")

      travelDeskFlightOptionsApiMock.list
        .mockImplementationOnce((_params, requestOptions = {}) => {
          earlierSignal = requestOptions.signal
          return rejectWhenAborted(earlierRequest, earlierSignal)
        })
        .mockImplementationOnce((_params, requestOptions = {}) => {
          laterSignal = requestOptions.signal
          return rejectWhenAborted(laterRequest, laterSignal)
        })

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
      const earlierFetch = composable.fetch()
      options.value.page = 2
      shouldSkipWatch.value = false
      await nextTick()
      await expect(earlierFetch).resolves.toEqual([])

      // Assert
      expect(earlierSignal?.aborted).toBe(true)
      expect(laterSignal?.aborted).toBe(false)
      expect(composable.travelDeskFlightOptions.value).toEqual([])
      expect(composable.totalCount.value).toBe(0)
      expect(composable.isErrored.value).toBe(false)
      expect(composable.isLoading.value).toBe(true)
      expect(consoleError).not.toHaveBeenCalled()

      laterRequest.resolve({
        travelDeskFlightOptions: [laterOption],
        totalCount: 20,
      })
      await flushPromises()

      expect(composable.travelDeskFlightOptions.value).toEqual([laterOption])
      expect(composable.totalCount.value).toBe(20)
      expect(composable.isErrored.value).toBe(false)
      expect(composable.isLoading.value).toBe(false)
    })

    test("aborts pending requests on scope disposal without surfacing cancellation", async () => {
      // Arrange
      const pendingRequest = createDeferredPromise<TravelDeskFlightOptionsResponse>()
      let requestSignal: AbortSignal | undefined
      const consoleError = vi.spyOn(console, "error")
      travelDeskFlightOptionsApiMock.list.mockImplementationOnce((_params, requestOptions = {}) => {
        requestSignal = requestOptions.signal
        return rejectWhenAborted(pendingRequest, requestSignal)
      })

      const shouldSkipWatch = ref(true)
      scope = effectScope()
      const composable = scope.run(() =>
        useTravelDeskFlightOptions(ref({ page: 1, perPage: 10 }), {
          skipWatchIf: () => shouldSkipWatch.value,
        })
      )
      if (!composable) throw new Error("Composable must run inside its effect scope")

      const pendingFetch = composable.fetch()

      // Act
      scope.stop()
      await expect(pendingFetch).resolves.toEqual([])

      // Assert
      expect(requestSignal?.aborted).toBe(true)
      expect(composable.isErrored.value).toBe(false)
      expect(consoleError).not.toHaveBeenCalled()
    })

    test("when an API request fails, preserves the error for its caller", async () => {
      // Arrange
      const requestError = new Error("Flight options request failed")
      const consoleError = vi.spyOn(console, "error")
      travelDeskFlightOptionsApiMock.list.mockRejectedValueOnce(requestError)

      const scopeOptions = ref({ page: 1, perPage: 10 })
      const shouldSkipWatch = ref(true)
      scope = effectScope()
      const composable = scope.run(() =>
        useTravelDeskFlightOptions(scopeOptions, {
          skipWatchIf: () => shouldSkipWatch.value,
        })
      )
      if (!composable) throw new Error("Composable must run inside its effect scope")

      // Act
      await expect(composable.fetch()).rejects.toBe(requestError)

      // Assert
      expect(composable.isErrored.value).toBe(true)
      expect(composable.isLoading.value).toBe(false)
      expect(consoleError).toHaveBeenCalledWith(
        "Failed to fetch travel desk flight options:",
        requestError
      )
    })
  })
})
