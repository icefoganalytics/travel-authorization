<template>
  <v-app>
    <div>
      <router-link
        :to="{
          name: 'DashboardPage',
        }"
        >Dashboard</router-link
      >

      <v-row class="mt-5">
        <v-col
          cols="12"
          md="6"
        >
          <v-card
            variant="outlined"
            class="pa-3 mb-4"
          >
            <v-card-title
              >Health Check
              <v-btn
                class="ma-0 ml-1"
                icon="mdi-cached"
                size="small"
                variant="text"
                color="success"
                title="refresh"
                @click="refresh"
              />
            </v-card-title>
            <v-list density="compact">
              <v-list-item :title="`API Port: ${appHealth.apiPort}`"></v-list-item>
              <v-list-item :title="`Frontend Url: ${appHealth.frontendUrl}`"></v-list-item>
              <v-list-item :title="`Build Env: ${appHealth.nodeEnd}`"></v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <v-col
          cols="12"
          md="6"
        >
          <v-card
            variant="outlined"
            class="pa-3 mb-4"
          >
            <v-card-title
              >DB Connection Information
              <v-btn
                class="ma-0 ml-1"
                icon="mdi-cached"
                size="small"
                variant="text"
                color="success"
                title="refresh"
                @click="refresh"
              />
            </v-card-title>
            <v-list density="compact">
              <v-list-item :title="`Host: ${dbHealth.connection}`"></v-list-item>
              <v-list-item :title="`Database: ${dbHealth.database}`"></v-list-item>
              <v-list-item :title="`User: ${dbHealth.user}`"></v-list-item>
              <v-list-item :title="`Port: ${dbHealth.port}`"></v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-card
            variant="outlined"
            class="pa-3"
          >
            <v-card-title
              >Environment Information
              <v-btn
                class="ma-0 ml-1"
                icon="mdi-cached"
                size="small"
                variant="text"
                color="success"
                title="refresh"
                @click="refresh"
              />
            </v-card-title>
            <v-list density="compact">
              <v-list-item :title="`Release Tag: ${environment.releaseTag}`"></v-list-item>
              <v-list-item :title="`Git Commit Hash: ${environment.gitCommitHash}`"></v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-app>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue"

import { GIT_COMMIT_HASH, RELEASE_TAG } from "@/config"

import { healthCheckApi, type HealthCheck } from "@/api/health-check-api"

import useSnack from "@/use/use-snack"

const healthCheck = ref<HealthCheck>({
  appHealth: {},
  dbHealth: {},
})

const environment = {
  releaseTag: RELEASE_TAG,
  gitCommitHash: GIT_COMMIT_HASH,
}

const appHealth = computed(() => healthCheck.value.appHealth || {})
const dbHealth = computed(() => healthCheck.value.dbHealth || {})

const snack = useSnack()

async function refresh() {
  try {
    const { healthCheck: healthCheckUpdate } = await healthCheckApi.get()
    healthCheck.value = healthCheckUpdate
  } catch (error) {
    console.error(`Failed to fetch health check data: ${error}`, { error })
    snack.error(`Failed to fetch health check data: ${error}`)
  }
}

onMounted(async () => {
  await refresh()
})
</script>
