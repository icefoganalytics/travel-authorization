import { createApp } from "vue"
import axios from "axios"

import auth0 from "@/plugins/auth0-plugin"
import vuetify from "@/plugins/vuetify-plugin"
import createI18n from "@/plugins/vue-i18n-plugin"

import App from "@/App.vue"
import router from "@/router"
import store from "@/store"

import { ENVIRONMENT, API_BASE_URL, RELEASE_TAG, GIT_COMMIT_HASH } from "@/config"

const app = createApp(App)
const i18n = createI18n()

app.use(router)
app.use(store)
app.use(vuetify)
app.use(i18n)
app.use(auth0)

axios.defaults.withCredentials = true
axios.defaults.headers.common["Access-Control-Allow-Origin"] = "*"

console.log("App is running", {
  environment: ENVIRONMENT,
  apiBaseUrl: API_BASE_URL,
  releaseTag: RELEASE_TAG,
  gitCommitHash: GIT_COMMIT_HASH,
})

app.mount("#app")
