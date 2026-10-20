import { CanceledError } from "axios"
import { flushPromises } from "@vue/test-utils"
import { isUndefined } from "lodash"
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
  let resolvePromise: ((value: T | PromiseLike<T>) => void) | undefined
  let rejectPromise: ((reason?: unknown) => void) | undefined
  const promise = new Promise<T>((resolve, reject) => {
    resolvePromise = resolve
    rejectPromise = reject
  })
  if (isUndefined(resolvePromise) || isUndefined(rejectPromise)) {
    throw new Error("Deferred promise callbacks must be initialized")
  }

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
  if (isUndefined(signal)) {
    throw new Error("An abort signal must be provided")
  }

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

  afterEach(() => {
    scope?.stop()
    scope = undefined
  })

  describe("useTravelDeskFlightOptions", () => {
    test("when the query changes during a request, cancels the stale request and keeps the latest request loading", async () => {
      // Arrange
      const staleRequest = createDeferredPromise<TravelDeskFlightOptionsResponse>()
      const latestRequest = createDeferredPromise<TravelDeskFlightOptionsResponse>()
      let staleSignal: AbortSignal | undefined
      let latestSignal: AbortSignal | undefined
      travelDeskFlightOptionsApiMock.list
        .mockImplementationOnce((_params, requestOptions = {}) => {
          staleSignal = requestOptions.signal
          return rejectWhenAborted(staleRequest, staleSignal)
        })
        .mockImplementationOnce((_params, requestOptions = {}) => {
          latestSignal = requestOptions.signal
          return rejectWhenAborted(latestRequest, latestSignal)
        })

      const options = ref({ page: 1, perPage: 10 })
      const shouldSkipWatch = ref(true)
      scope = effectScope()
      const composable = scope.run(() =>
        useTravelDeskFlightOptions(options, {
          skipWatchIf: () => shouldSkipWatch.value,
        })
      )
      if (isUndefined(composable)) {
        throw new Error("Composable must run inside its effect scope")
      }

      // Act
      const staleFetch = composable.fetch()
      options.value.page = 2
      shouldSkipWatch.value = false
      await nextTick()
      await staleFetch

      // Assert
      expect(staleSignal).toMatchObject({ aborted: true })
      expect(latestSignal).toMatchObject({ aborted: false })
      expect(composable.travelDeskFlightOptions.value).toEqual([])
      expect(composable.totalCount.value).toBe(0)
      expect(composable.isErrored.value).toBe(false)
      expect(composable.isLoading.value).toBe(true)
    })

    test("when the latest request succeeds, displays its results and clears loading", async () => {
      // Arrange
      const request = createDeferredPromise<TravelDeskFlightOptionsResponse>()
      const latestOption = travelDeskFlightOptionFactory.build({ id: 202 })
      travelDeskFlightOptionsApiMock.list.mockReturnValueOnce(request.promise)

      const shouldSkipWatch = ref(true)
      scope = effectScope()
      const composable = scope.run(() =>
        useTravelDeskFlightOptions(ref({ page: 2, perPage: 10 }), {
          skipWatchIf: () => shouldSkipWatch.value,
        })
      )
      if (isUndefined(composable)) {
        throw new Error("Composable must run inside its effect scope")
      }

      // Act
      const latestFetch = composable.fetch()
      request.resolve({
        travelDeskFlightOptions: [latestOption],
        totalCount: 20,
      })
      await latestFetch
      await flushPromises()

      // Assert
      expect(composable.travelDeskFlightOptions.value).toEqual([latestOption])
      expect(composable.totalCount.value).toBe(20)
      expect(composable.isErrored.value).toBe(false)
      expect(composable.isLoading.value).toBe(false)
    })

    test("when the effect scope is disposed during a request, cancels it without marking an error", async () => {
      // Arrange
      const pendingRequest = createDeferredPromise<TravelDeskFlightOptionsResponse>()
      let requestSignal: AbortSignal | undefined
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
      if (isUndefined(composable)) {
        throw new Error("Composable must run inside its effect scope")
      }
      const pendingFetch = composable.fetch()

      // Act
      scope.stop()
      await pendingFetch

      // Assert
      expect(requestSignal).toMatchObject({ aborted: true })
      expect(composable.isErrored.value).toBe(false)
    })

    test("when an API request fails, preserves the error for its caller", async () => {
      // Arrange
      const requestError = new Error("Flight options request failed")
      travelDeskFlightOptionsApiMock.list.mockRejectedValueOnce(requestError)

      const shouldSkipWatch = ref(true)
      scope = effectScope()
      const composable = scope.run(() =>
        useTravelDeskFlightOptions(ref({ page: 1, perPage: 10 }), {
          skipWatchIf: () => shouldSkipWatch.value,
        })
      )
      if (isUndefined(composable)) {
        throw new Error("Composable must run inside its effect scope")
      }

      // Act / Assert
      await expect(composable.fetch()).rejects.toBe(requestError)
    })

    test("when an API request fails, clears loading and marks the request errored", async () => {
      // Arrange
      travelDeskFlightOptionsApiMock.list.mockRejectedValueOnce(
        new Error("Flight options request failed")
      )
      scope = effectScope()
      const composable = scope.run(() =>
        useTravelDeskFlightOptions(ref({ page: 1, perPage: 10 }), {
          skipWatchIf: () => true,
        })
      )
      if (isUndefined(composable)) {
        throw new Error("Composable must run inside its effect scope")
      }

      // Act
      await Promise.allSettled([composable.fetch()])

      // Assert
      expect(composable).toMatchObject({
        isErrored: { value: true },
        isLoading: { value: false },
      })
    })
  })
})
