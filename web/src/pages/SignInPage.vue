<template>
  <div class="d-flex justify-center align-center fill-height fill-width">
    <div
      id="login"
      class="d-flex flex-column align-center"
      tag="section"
    >
      <v-row justify="center">
        <v-col
          lg="11"
          sm="8"
          xl="7"
        >
          <v-card
            class="elevation-5"
            style="overflow: hidden"
          >
            <v-row>
              <v-col
                lg="7"
                style="background-color: #f9f4d4"
                class="d-none d-md-flex align-center justify-center"
              >
                <div class="d-none d-sm-block">
                  <img
                    src="@/assets/logo.svg"
                    alt="Logo"
                    class="d-md-block pl-6"
                  />
                  <div class="align-center pa-6">
                    <h2
                      class="display-1 font-weight-medium"
                      style="line-height: 40px"
                    >
                      {{ title }}
                    </h2>
                    <h6 class="subtitle-1 mt-4 op-5 font-weight-regular">Yukon Government</h6>
                  </div>
                </div>
              </v-col>
              <v-col lg="5">
                <div class="pa-7 pa-sm-12">
                  <div
                    style="background-color: #f9f4d4"
                    class="pa-5 d-md-none"
                  >
                    <img
                      src="@/assets/logo.svg"
                      alt="Logo"
                      class="d-md-inline"
                    />
                    <h2
                      class="display-1 font-weight-medium"
                      style="line-height: 40px"
                    >
                      {{ title }}
                    </h2>
                    <h6 class="subtitle-1 mt-4 op-5 font-weight-regular">Yukon Government</h6>
                  </div>

                  <h2 class="font-weight-bold mt-4 text--darken-2">Sign in</h2>
                  <h6 class="subtitle-1 mt-3 mb-5">
                    This application is only available to authorized users. If you have an account,
                    click the button below.
                  </h6>
                  <v-btn
                    color="primary"
                    @click="login"
                  >
                    Sign In
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from "vue"

import { APPLICATION_NAME } from "@/config"
import { auth0 } from "@/plugins/auth0-plugin"
import useCurrentUser from "@/use/use-current-user"

const { unset: unsetCurrentUser } = useCurrentUser({ eager: false })

const title = APPLICATION_NAME

onMounted(() => {
  unsetCurrentUser()
})

function login() {
  return auth0.loginWithRedirect()
}
</script>
