import Vue from "vue"

import store from "@/store"

Vue.filter("isTdUser", function () {
  const userRoles = store.state.auth?.user?.roles
  const admin = userRoles?.includes("admin")
  const TdUser = userRoles?.includes("travel_desk_user")
  return admin || TdUser
})

Vue.filter("flightStartEnd", function (flights) {
  if (flights.length > 0) {
    const dates = flights.map((flight) => flight.datePreference)
    dates.sort()
    return { start: dates[0], end: flights.length > 1 ? dates[flights.length - 1] : "" }
  } else return { start: "", end: "" }
})
