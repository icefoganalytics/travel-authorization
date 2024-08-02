import Vue from "vue"
import store from "@/store"

Vue.filter("isAdmin", function () {
  const userDept = store.state.auth?.department
  const userRoles = store.state.auth?.user?.roles
  const admin = userRoles?.includes("admin")
  const patAdmin = userRoles?.includes("pre_approved_travel_admin") && Boolean(userDept)
  const hasAdminRole = admin || patAdmin
  return hasAdminRole
})

Vue.filter("isSystemAdmin", function () {
  const userRoles = store.state.auth?.user?.roles
  const admin = userRoles?.includes("admin")
  return admin
})

Vue.filter("isTdUser", function () {
  const userRoles = store.state.auth?.user?.roles
  const admin = userRoles?.includes("admin")
  const TdUser = userRoles?.includes("travel_desk_user")
  return admin || TdUser
})

Vue.filter("beautifyDate", function (date) {
  const MonthList = {
    1: "Jan",
    2: "Feb",
    3: "Mar",
    4: "Apr",
    5: "May",
    6: "Jun",
    7: "Jul",
    8: "Aug",
    9: "Sep",
    10: "Oct",
    11: "Nov",
    12: "Dec",
  }
  if (date)
    return MonthList[Number(date.substr(5, 2))] + " " + date.substr(8, 2) + " " + date.substr(0, 4)
  else return ""
})

Vue.filter("beautifyDateTime", function (date) {
  if (date) {
    const time = date.length > 10 ? ", " + date.substr(11, 5) : ""
    return Vue.filter("beautifyDate")(date.substr(0, 10)) + time
  } else return ""
})

Vue.filter("capitalize", function (text) {
  const texts = text.split(" ")
  const result = []
  texts.forEach((txt) => result.push(txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase()))
  return result.join(" ")
})

Vue.filter("currency", function (currency) {
  return currency.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
})

Vue.filter("flightStartEnd", function (flights) {
  if (flights.length > 0) {
    const dates = flights.map((flight) => flight.datePreference)
    dates.sort()
    return { start: dates[0], end: flights.length > 1 ? dates[flights.length - 1] : "" }
  } else return { start: "", end: "" }
})
