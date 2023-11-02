import { isString, upperFirst, pick } from "lodash"

import { FORM_URL, LOOKUP_URL } from "@/urls"
import { secureGet, securePost } from "@/store/jwt"
import expensesApi from "@/apis/expenses-api"
import travelAuthorizationsApi from "@/apis/travel-authorizations-api"
import locationsApi from "@/apis/locations-api"
import usersApi from "@/apis/users-api"

const state = {
  departments: [],
  destinations: [],
  emails: [],
  estimates: [],
  myTravelAuthorizations: [],
  purposes: [],
  currentTravelAuthorization: {},
  currentUser: {},
  loadingCurrentUser: true,
  loadingCurrentForm: true,
  loadingEstimates: true,
}

// Shim to support refering to form as request for legacy code
state.request = state.currentTravelAuthorization

const getters = {
  destinationsByCurrentFormTravelRestriction(state) {
    if (state.currentTravelAuthorization.allTravelWithinTerritory !== true) {
      return state.destinations
    }

    return state.destinations.filter((d) => d.text.endsWith("(YT)"))
  },
  currentTravelAuthorizationId(state) {
    return state.currentTravelAuthorization.id
  },
}

const actions = {
  async initialize(store) {
    await store.dispatch("loadDepartments")
    await store.dispatch("loadPurposes")
    await store.dispatch("loadDestinations")
  },
  async emailSearch({ commit }, token) {
    if (isString(token) && token.length >= 3) {
      const { data: emails } = await secureGet(`${LOOKUP_URL}/emailList?email=${token}`)
      commit("SET_EMAILS", emails)
    } else {
      commit("SET_EMAILS", [])
    }
    return this.emails
  },
  async loadDepartments({ commit }) {
    return secureGet(`${LOOKUP_URL}/departmentList2`).then((resp) => {
      commit("SET_DEPARTMENTS", resp.data.data)
      return resp.data.data
    })
  },
  loadEstimates({ commit, state }, { travelAuthorizationId }) {
    state.loadingEstimates = true
    return expensesApi
      .list({ where: { travelAuthorizationId, type: expensesApi.TYPES.ESTIMATE } })
      .then(({ expenses: estimates }) => {
        commit("SET_ESTIMATES", estimates)
        return estimates
      })
      .finally(() => {
        state.loadingEstimates = false
      })
  },
  async loadPurposes({ commit }) {
    return secureGet(`${LOOKUP_URL}/travelPurpose`).then((resp) => {
      commit("SET_PURPOSE", resp.data)
      return resp.data
    })
  },
  async loadDestinations({ commit }) {
    return locationsApi.list().then(({ locations }) => {
      const formattedLocations = locations.map(({ id, city, province }) => {
        return {
          value: id,
          text: `${city} (${province})`,
        }
      })

      commit("SET_DESTINATIONS", formattedLocations)

      return formattedLocations
    })
  },
  async loadTravelAuthorizations({ commit, dispatch }, { page, perPage, ...otherParams } = {}) {
    const userId =
      state.currentUser.id || (await dispatch("loadCurrentUser").then((user) => user.id))
    return travelAuthorizationsApi
      .list({
        page,
        perPage,
        ...otherParams,
        where: { userId },
      })
      .then(({ travelAuthorizations: forms, totalCount }) => {
        commit("SET_MYFORMS", forms)
        return { forms, totalCount }
      })
  },
  loadAsCurrentTravelAuthorization({ commit, state }, formId) {
    state.loadingCurrentForm = true
    return travelAuthorizationsApi
      .get(formId)
      .then(({ travelAuthorization: form }) => {
        commit("SET_FORM", form)
        return form
      })
      .finally(() => {
        state.loadingCurrentForm = false
      })
  },
  loadCurrentUser({ commit, state }) {
    state.loadingCurrentUser = true
    return usersApi
      .me()
      .then(({ user }) => {
        commit("SET_CURRENT_USER", {
          id: user.id,
          firstName: upperFirst(user.firstName),
          lastName: upperFirst(user.lastName),
          email: user.email,
          department: user.department,
          division: user.division,
          branch: user.branch,
          unit: user.unit,
          mailcode: user.mailcode,
          roles: user.roles,
        })
        commit("SET_FORM", {
          ...state.request,
          ...pick(state.currentUser, [
            "firstName",
            "lastName",
            "email",
            "department",
            "division",
            "branch",
            "unit",
            "mailcode",
          ]),
        })
        return state.currentUser
      })
      .finally(() => {
        state.loadingCurrentUser = false
      })
  },
  loadUser({ dispatch }) {
    console.warn("Deprecated: use loadCurrentUser instead.")
    return dispatch("loadCurrentUser")
  },
  create({ commit, state }, attributes) {
    state.loadingCurrentForm = true
    return travelAuthorizationsApi
      .create(attributes)
      .then(({ travelAuthorization: form }) => {
        commit("SET_FORM", form)
        return form
      })
      .finally(() => {
        state.loadingCurrentForm = false
      })
  },
  updateCurrentForm({ commit, state }) {
    const formId = state.currentTravelAuthorization.id
    const attributes = state.currentTravelAuthorization
    state.loadingCurrentForm = true
    return travelAuthorizationsApi
      .update(formId, attributes)
      .then(({ travelAuthorization: form }) => {
        commit("SET_FORM", form)
        return form
      })
      .finally(() => {
        state.loadingCurrentForm = false
      })
  },
  update({ dispatch }) {
    console.warn("Deprecated: use updateCurrentForm instead.")
    return dispatch("updateCurrentForm")
  },
  delete(store, { id }) {
    return securePost(`${FORM_URL}/${id}`).then((resp) => {
      return resp.data
    })
  },
}

const mutations = {
  SET_CURRENT_USER(store, value) {
    store.currentUser = value
  },
  SET_EMAILS(store, value) {
    store.emails = value
  },
  SET_MYFORMS(store, value) {
    store.myTravelAuthorizations = value
  },
  SET_FORM(store, value) {
    store.currentTravelAuthorization = value
    // propagates to store.request object, for legacy code
    store.request = store.currentTravelAuthorization
  },
  SET_DEPARTMENTS(store, value) {
    store.departments = value
  },
  SET_PURPOSE(store, value) {
    store.purposes = value
  },
  SET_DESTINATIONS(store, value) {
    store.destinations = value
  },
  SET_ESTIMATES(store, value) {
    store.estimates = value
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
}