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
            outlined
            class="pa-3 mb-4"
          >
            <v-card-title
              >Health Check
              <v-btn
                class="ma-0 ml-1"
                icon
                color="green"
                title="refresh"
                @click="refresh"
              >
                <v-icon>mdi-cached</v-icon>
              </v-btn>
            </v-card-title>
            <v-list dense>
              <v-list-item>
                <v-list-item-content>API Port: {{ appHealth.apiPort }}</v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>Frontend Url: {{ appHealth.frontendUrl }}</v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>Build Env: {{ appHealth.nodeEnd }}</v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <v-col
          cols="12"
          md="6"
        >
          <v-card
            outlined
            class="pa-3 mb-4"
          >
            <v-card-title
              >DB Connection Information
              <v-btn
                class="ma-0 ml-1"
                icon
                color="green"
                title="refresh"
                @click="refresh"
              >
                <v-icon>mdi-cached</v-icon>
              </v-btn>
            </v-card-title>
            <v-list dense>
              <v-list-item>
                <v-list-item-content>Host: {{ dbHealth.connection }}</v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>Database: {{ dbHealth.database }}</v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>User: {{ dbHealth.user }}</v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content>Port: {{ dbHealth.port }}</v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col cols="12">
          <v-card
            outlined
            class="pa-3"
          >
            <v-card-title
              >Environment Information
              <v-btn
                class="ma-0 ml-1"
                icon
                color="green"
                title="refresh"
                @click="refresh"
              >
                <v-icon>mdi-cached</v-icon>
              </v-btn>
            </v-card-title>
            <v-list dense>
              <v-list-item>
                <v-list-item-content>Release Tag: {{ environment.releaseTag }}</v-list-item-content>
              </v-list-item>
              <v-list-item>
                <v-list-item-content
                  >Git Commit Hash: {{ environment.gitCommitHash }}</v-list-item-content
                >
              </v-list-item>
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
