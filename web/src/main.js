import Vue from "vue"
import VueApexCharts from "vue-apexcharts"
import axios from "axios"

import vuetify from "@/plugins/vuetify-plugin"
import createI18n from "@/plugins/vue-i18n-plugin"
import Auth0Plugin from "@/plugins/auth0-plugin"

import App from "@/App.vue"
import router from "@/router"
import store from "@/store"

import { ENVIRONMENT, API_BASE_URL, RELEASE_TAG, GIT_COMMIT_HASH } from "@/config"

Vue.use(VueApexCharts)
const i18n = createI18n(Vue)
Vue.use(Auth0Plugin)

Vue.config.productionTip = false

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
