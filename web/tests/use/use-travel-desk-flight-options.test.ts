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

describe("web/src/use/use-travel-desk-flight-options.js", () => {
  const travelDeskFlightOptionsApiMock = vi.mocked(travelDeskFlightOptionsApi)
  let scope: EffectScope | undefined

  afterEach(() => {
    scope?.stop()
    scope = undefined
  })

  describe("useTravelDeskFlightOptions", () => {
    test("when the query changes during a request, cancels the stale request", async () => {
      // Arrange
      let staleSignal: AbortSignal | undefined
      travelDeskFlightOptionsApiMock.list
        .mockImplementationOnce((_params, { signal } = {}) => {
          if (isUndefined(signal)) {
            throw new Error("Expected a request abort signal")
          }

          staleSignal = signal
          return new Promise<TravelDeskFlightOptionsResponse>((_resolve, reject) => {
            signal.addEventListener("abort", () => reject(new CanceledError("canceled")), {
              once: true,
            })
          })
        })
        .mockReturnValueOnce(new Promise<TravelDeskFlightOptionsResponse>(() => {}))

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
    })

    test("when a replacement request is pending, keeps it active", async () => {
      // Arrange
      let latestSignal: AbortSignal | undefined
      travelDeskFlightOptionsApiMock.list
        .mockImplementationOnce((_params, { signal } = {}) => {
          if (isUndefined(signal)) {
            throw new Error("Expected a request abort signal")
          }

          return new Promise<TravelDeskFlightOptionsResponse>((_resolve, reject) => {
            signal.addEventListener("abort", () => reject(new CanceledError("canceled")), {
              once: true,
            })
          })
        })
        .mockImplementationOnce((_params, { signal } = {}) => {
          latestSignal = signal
          return new Promise<TravelDeskFlightOptionsResponse>(() => {})
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
      expect(latestSignal).toMatchObject({ aborted: false })
    })

    test("when a replacement request is pending, keeps the latest request loading", async () => {
      // Arrange
      travelDeskFlightOptionsApiMock.list
        .mockImplementationOnce((_params, { signal } = {}) => {
          if (isUndefined(signal)) {
            throw new Error("Expected a request abort signal")
          }

          return new Promise<TravelDeskFlightOptionsResponse>((_resolve, reject) => {
            signal.addEventListener("abort", () => reject(new CanceledError("canceled")), {
              once: true,
            })
          })
        })
        .mockReturnValueOnce(new Promise<TravelDeskFlightOptionsResponse>(() => {}))

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
      expect(composable).toMatchObject({
        travelDeskFlightOptions: { value: [] },
        totalCount: { value: 0 },
        isErrored: { value: false },
        isLoading: { value: true },
      })
    })

    test("when the latest request succeeds, displays its results and clears loading", async () => {
      // Arrange
      const latestOption = travelDeskFlightOptionFactory.build({ id: 202 })
      travelDeskFlightOptionsApiMock.list.mockResolvedValueOnce({
        travelDeskFlightOptions: [latestOption],
        totalCount: 20,
      })

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
      await composable.fetch()
      await flushPromises()

      // Assert
      expect(composable).toMatchObject({
        travelDeskFlightOptions: { value: [latestOption] },
        totalCount: { value: 20 },
        isErrored: { value: false },
        isLoading: { value: false },
      })
    })

    test("when the effect scope is disposed during a request, cancels it", async () => {
      // Arrange
      let requestSignal: AbortSignal | undefined
      travelDeskFlightOptionsApiMock.list.mockImplementationOnce((_params, { signal } = {}) => {
        if (isUndefined(signal)) {
          throw new Error("Expected a request abort signal")
        }

        requestSignal = signal
        return new Promise<TravelDeskFlightOptionsResponse>((_resolve, reject) => {
          signal.addEventListener("abort", () => reject(new CanceledError("canceled")), {
            once: true,
          })
        })
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
    })

    test("when the effect scope is disposed during a request, does not mark it errored", async () => {
      // Arrange
      travelDeskFlightOptionsApiMock.list.mockImplementationOnce((_params, { signal } = {}) => {
        if (isUndefined(signal)) {
          throw new Error("Expected a request abort signal")
        }

        return new Promise<TravelDeskFlightOptionsResponse>((_resolve, reject) => {
          signal.addEventListener("abort", () => reject(new CanceledError("canceled")), {
            once: true,
          })
        })
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
      expect(composable).toMatchObject({
        isErrored: { value: false },
      })
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
