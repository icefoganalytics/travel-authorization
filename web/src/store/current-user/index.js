import usersApi from "@/api/users-api"

import { withGettersFromState } from "@/utils/vuex-utils"

const state = {
  attributes: {},
  isLoading: false,
  isErrored: false,
  isInitialized: false,
}

const getters = withGettersFromState(state, {
  id: (state) => state.attributes.id,
  fullName: (state) => {
    const { firstName, lastName } = state.attributes
    return [firstName, lastName].filter(Boolean).join(" ")
  },
})

const actions = {
  async initialize({ commit }) {
    commit("SET_IS_LOADING", true)
    try {
      const { user } = await usersApi.me()
      commit("SET_IS_ERRORED", false)
      commit("SET_ATTRIBUTES", user)
      commit("SET_IS_INITIALIZED", true)
      return state.attributes
    } catch (error) {
      console.error("Failed to load current user:", error)
      commit("SET_IS_ERRORED", true)
      throw error
    } finally {
      commit("SET_IS_LOADING", false)
    }
  },
}

const mutations = {
  SET_ATTRIBUTES(state, value) {
    state.attributes = value
  },
  SET_IS_LOADING(state, value) {
    state.isLoading = value
  },
  SET_IS_ERRORED(state, value) {
    state.isErrored = value
  },
  SET_IS_INITIALIZED(state, value) {
    state.isInitialized = value
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
  modules: {
    // TODO: add things that depend on the current user e.g.
    // travel authorizations, leads to interface currentUser/travelAuthorizations
  },
}