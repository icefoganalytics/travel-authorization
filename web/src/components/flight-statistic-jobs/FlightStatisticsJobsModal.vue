<template>
  <div>
    <v-dialog
      v-model="updateDialog"
      persistent
      max-width="500px"
    >
      <template #activator="{ on, attrs }">
        <v-btn
          class="ml-2"
          color="secondary"
          v-bind="attrs"
          v-on="on"
          @click="initUpdate"
        >
          Update Reports
        </v-btn>
      </template>

      <v-card>
        <v-card-title class="text-h5 primary">Report Updates</v-card-title>
        <v-card-text>
          <v-row
            class="mt-3"
            style="font-size: 13pt"
          >
            <v-col cols="9"
              ><b>Last Update:</b> <i class="blue--text">{{ lastUpdate }}</i></v-col
            >
            <v-col
              v-if="runningUpdates"
              cols="3"
              class="my-3 blink text-center"
              >Running</v-col
            >
          </v-row>
          <v-row
            class="mt-3"
            style="font-size: 13pt"
          >
            <v-col>
              <b>Progress:</b>
              <v-progress-linear
                v-model="progress"
                color="amber"
                height="25"
                @change="getProgress()"
              >
                <template #default="{ value }">
                  <strong>{{ Math.ceil(value) }}%</strong>
                </template>
              </v-progress-linear>
            </v-col>
          </v-row>
          <v-row
            v-if="!runningUpdates"
            class="mx-1 mt-7 mb-n7 red--text"
          >
            <span
              ><b>Warning:</b> Updating the Reports takes about <b>15-30 Minutes</b>. Please make
              sure you need to update them in the DB based on the date shown above.</span
            >
          </v-row>
          <v-row
            v-if="runningUpdates && loadingData"
            class="mx-1 mt-7 mb-n9 red--text"
          >
            Please Wait!
          </v-row>
        </v-card-text>
        <v-card-actions class="mx-2">
          <v-btn
            :loading="loadingData"
            color="secondary"
            @click="closeDialog"
            >Close
          </v-btn>
          <v-btn
            :disabled="runningUpdates"
            :loading="loadingData"
            class="ml-auto"
            color="primary"
            @click="startUpdate"
            >Start Update
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from "vue"
import { isEmpty } from "lodash"

import flightStatisticsJobsApi from "@/api/flight-statistics-jobs-api"

const updateDialog = ref(false)
const loadingData = ref(false)
const lastUpdate = ref("")
const progress = ref(0)
const runningUpdates = ref(false)
const timeHandle = ref<number | undefined>(undefined)

onUnmounted(() => {
  clearTimeout(timeHandle.value)
})

async function initUpdate() {
  await getProgress()
}

// TODO: update implementation to something more readable
async function getProgress() {
  loadingData.value = true
  try {
    const { flightStatisticJobs } = await flightStatisticsJobsApi.list()
    if (isEmpty(flightStatisticJobs)) return

    const firstFlightStatisticJob = flightStatisticJobs[0]
    progress.value = firstFlightStatisticJob.progress
    const updateTime = new Date()
    updateTime.setMinutes(updateTime.getMinutes() - 1)
    const lastUpdateDate = new Date(firstFlightStatisticJob.updatedAt)
    runningUpdates.value = updateTime < lastUpdateDate
    lastUpdate.value = lastUpdateDate.toLocaleString()
    timeHandle.value = window.setTimeout(() => {
      getProgress()
    }, 30000)
  } catch (error) {
    console.error(`Failed to get flight statistic jobs: ${error}`, { error })
  } finally {
    loadingData.value = false
  }
}

function closeDialog() {
  clearTimeout(timeHandle.value)
  updateDialog.value = false
}

// TODO: keep track of job id, so it can be used to get progress
async function startUpdate() {
  loadingData.value = true
  try {
    await flightStatisticsJobsApi.create()
  } catch (error) {
    console.error(`Failed to create flight statistics job: ${error}`, { error })
  } finally {
    runningUpdates.value = true
    progress.value = 0
    loadingData.value = false
  }
}
</script>

<style scoped>
.blink {
  animation: blinking ease-out 2s 100000;
  border-radius: 5px;
  font-size: 11pt;
  font-weight: 600;
  padding: 0;
  color: #030303;
}

@keyframes blinking {
  0% {
    color: #f60808;
  }
  50% {
    color: #ffffff;
  }
  100% {
    color: #fa1515;
  }
}
</style>
