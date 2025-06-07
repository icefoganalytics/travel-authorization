import Vue from "vue"
import Vuex from "vuex"

import alerts from "./alerts"
import auth from "./auth"
import current from "./current"
import expenses from "@/store/expenses"
import reports from "./reports"
import traveldesk from "./traveldesk"
import travelPurposes from "@/store/travel-purposes"

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    loadingClass: "d-none",
    siteHistory: [],
    search: "",
    showAppSidebar: false,
  },
  mutations: {
    SET_LOADING(state, value) {
      state.isLoading = value
      state.loadingClass = value ? "block" : "d-none"
    },
    ADD_SITEHISTORY(state, value) {
      let exists = state.siteHistory.filter((h) => h.id == value.id).length

      if (exists == 0) state.siteHistory.unshift(value)
    },
    SET_SEARCH(state, value) {
      state.search = value
    },
  },
  actions: {
    load({ commit }) {
      commit("SET_LOADING", true)
      window.setTimeout(() => {
        commit("SET_LOADING", false)
      }, 3000)
    },
    addSiteHistory({ commit }, site) {
      commit("ADD_SITEHISTORY", site)
    },
    setSearch({ commit }, value) {
      commit("SET_SEARCH", value)
    },
    setAppSidebar(state, value) {
      state.state.showAppSidebar = value
    },
  },
  getters: {
    siteHistory: (state) => state.siteHistory,
    search: (state) => state.search,
    showAppSidebar: (state) => state.showAppSidebar,
  },
  modules: {
    alerts,
    auth,
    current,
    expenses,
    reports,
    traveldesk,
    travelPurposes,
  },
})
