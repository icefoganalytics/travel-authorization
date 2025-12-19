<template>
  <v-container class="text-center mt-16">
    <h1>Unauthorized (401)</h1>
    <p>Authentication failed. If you think this is an error, please contact support.</p>
    <p>Alternatively, try logging out and signing in again.</p>
    <v-row class="mt-6">
      <v-spacer />
      <v-col>
        <!-- href="/" performs a more aggressive refresh than using to="xxx" -->
        <v-btn
          color="primary"
          variant="outlined"
          @click="goBack"
          >Back</v-btn
        >
      </v-col>
      <v-spacer />
    </v-row>
    <v-row>
      <v-spacer />
      <v-col>
        <!-- href="/" performs a more aggressive refresh than using to="xxx" -->
        <v-btn
          color="primary"
          variant="outlined"
          href="/"
          >Reboot App</v-btn
        >
      </v-col>
      <v-spacer />
    </v-row>
    <v-row>
      <v-spacer />
      <v-col>
        <v-btn
          color="primary"
          @click="signOut"
          >Logout</v-btn
        >
      </v-col>
      <v-spacer />
    </v-row>
    <hr />
    <p>Site: {{ APPLICATION_NAME }}</p>
    <p>Version: {{ releaseTag }}</p>
    <p>Commit Hash: {{ gitCommitHash }}</p>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"

import { auth0 } from "@/plugins/auth0-plugin"
import http from "@/api/http-client"

import { APPLICATION_NAME } from "@/config"

const releaseTag = ref("not-set")
const gitCommitHash = ref("not-set")

const isLoading = ref(true)

onMounted(async () => {
  await refresh()
})

function goBack() {
  window.history.back()
}

async function signOut() {
  const returnTo = encodeURI(window.location.origin + "/sign-in")
  return auth0.logout({
    logoutParams: {
      returnTo,
    },
  })
}

async function fetchVersion() {
  return http
    .get("/_status")
    .then(({ data }) => {
      releaseTag.value = data.RELEASE_TAG
      gitCommitHash.value = data.GIT_COMMIT_HASH
      return data
    })
    .catch((error) => {
      console.error(`Error fetching version: ${error}`)
    })
}

async function refresh() {
  isLoading.value = true
  try {
    await fetchVersion()
  } catch (error) {
    console.error(`Error fetching version: ${error}`)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
body {
  text-align: center;
  padding-top: 100px;
}
hr {
  margin-top: 30px;
  margin-bottom: 30px;
}
</style>
