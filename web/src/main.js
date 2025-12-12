import Vue from "vue"
import VueApexCharts from "vue-apexcharts"
import axios from "axios"

import vuetify from "@/plugins/vuetify-plugin"
import SnackPlugin from "@/plugins/snack-plugin"
import createI18n from "@/plugins/vue-i18n-plugin"
import Auth0Plugin from "@/plugins/auth0-plugin"

import App from "@/App.vue"
import router from "@/router"
import store from "@/store"
import "@/filters"

import { ENVIRONMENT, API_BASE_URL, RELEASE_TAG, GIT_COMMIT_HASH } from "@/config"

Vue.use(VueApexCharts)
Vue.use(SnackPlugin)
const i18n = createI18n(Vue)
Vue.use(Auth0Plugin)

Vue.config.productionTip = false
Vue.prototype.$http = axios

Vue.directive("yk-btn", {
  bind: function (el) {
    el.style.backgroundColor = "#a000bb"
    el.style.color = "#fff"
    el.style.fontWeight = "400"
    el.style.textTransform = "none"
    el.style.borderRadius = "0"
  },
})

axios.defaults.withCredentials = true
axios.defaults.headers.common["Access-Control-Allow-Origin"] = "*"

const vue = new Vue({
  router,
  store,
  vuetify,
  i18n,
  render: (h) => h(App),
})

console.log("App is running", {
  environment: ENVIRONMENT,
  apiBaseUrl: API_BASE_URL,
  releaseTag: RELEASE_TAG,
  gitCommitHash: GIT_COMMIT_HASH,
})

vue.$mount("#app")
