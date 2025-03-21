import locationsApi from "@/api/locations-api"

import { sleep } from "@/utils/sleep"
import { withGettersFromState } from "@/utils/vuex-utils"

const state = {
  items: [],
  isLoading: false,
  isErrored: false,
  isCached: false,
}

const getters = withGettersFromState(state, {
  byProvince: (state) => (province) => {
    return state.items.filter((item) => item.province === province)
  },
})

const actions = {
  async ensure({ commit, state, dispatch }) {
    while (state.isLoading) {
      await sleep(75)
    }

    if (state.isErrored) {
      console.error("Location store has errored, returning [].")
      return []
    }

    if (state.isCached) {
      return state.items
    }

    commit("SET_IS_CACHED", false)
    return dispatch("fetch")
  },
  async fetch({ commit }) {
    commit("SET_IS_LOADING", true)
    try {
      const { locations } = await locationsApi.list()
      commit("SET_IS_ERRORED", false)
      commit("SET_ITEMS", locations)
      commit("SET_IS_CACHED", true)
      return locations
    } catch (error) {
      console.error("Failed to fetch locations:", error)
      commit("SET_IS_ERRORED", true)
      throw error
    } finally {
      commit("SET_IS_LOADING", false)
    }
  },
}

const mutations = {
  SET_ITEMS(state, value) {
    state.items = value
  },
  SET_IS_LOADING(state, value) {
    state.isLoading = value
  },
  SET_IS_ERRORED(state, value) {
    state.isErrored = value
  },
  SET_IS_CACHED(state, value) {
    state.isCached = value
  },
}

/** @deprecated - prefer web/src/use/use-locations.js or web/src/use/use-location.js */
export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
}
