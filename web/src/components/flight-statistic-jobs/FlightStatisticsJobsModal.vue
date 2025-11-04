<template>
  <v-dialog
    v-model="showDialog"
    persistent
    max-width="500px"
    @keydown.esc="close"
  >
    <!-- Ready State Card -->
    <v-card v-if="state === 'ready'">
      <v-card-title class="text-h5 primary">Report Updates</v-card-title>
      <v-card-text>
        <v-row
          class="mt-3"
          style="font-size: 13pt"
        >
          <v-col>
            <b>Last Update:</b> <i class="blue--text">{{ lastUpdatedAt }}</i>
          </v-col>
        </v-row>
        <v-row class="mx-1 mt-7 mb-n7 red--text">
          <span>
            <b>Warning:</b> Updating the Reports takes about <b>15-30 Minutes</b>. Please make sure
            you need to update them in the DB based on the date shown above.
          </span>
        </v-row>
      </v-card-text>
      <v-card-actions class="mx-2">
        <v-btn
          :loading="isLoading"
          color="secondary"
          @click="close"
        >
          Close
        </v-btn>
        <v-btn
          :loading="isLoading"
          class="ml-auto"
          color="primary"
          @click="startSycnJob"
        >
          Start Update
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Running State Card -->
    <v-card v-else-if="state === 'running'">
      <v-card-title class="text-h5 primary">Report Updates</v-card-title>
      <v-card-text>
        <v-row
          class="mt-3"
          style="font-size: 13pt"
        >
          <v-col>
            <b>Last Update:</b> <i class="blue--text">{{ lastUpdatedAt }}</i>
          </v-col>
        </v-row>
        <v-row
          class="mt-3"
          style="font-size: 13pt"
        >
          <v-col>
            <b>Progress:</b>
            <v-progress-linear
              :value="progressPercent"
              color="amber"
              height="25"
            >
              <template #default="{ value }">
                <strong>{{ Math.ceil(value) }}%</strong>
              </template>
            </v-progress-linear>
          </v-col>
        </v-row>
        <v-row class="mx-1 mt-7 mb-n9 amber--text text--darken-3">
          <span>
            <b>Processing:</b> The job is currently running. This may take 15-30 minutes to
            complete.
          </span>
        </v-row>
      </v-card-text>
      <v-card-actions class="mx-2">
        <v-btn
          :loading="isLoading"
          color="secondary"
          @click="close"
        >
          Close
        </v-btn>
        <v-btn
          :loading="isLoading"
          class="ml-auto"
          color="amber"
          disabled
        >
          Running...
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Completed State Card -->
    <v-card v-else-if="state === 'completed'">
      <v-card-title class="text-h5 primary">Report Updates</v-card-title>
      <v-card-text>
        <v-row
          class="mt-3"
          style="font-size: 13pt"
        >
          <v-col>
            <b>Last Update:</b> <i class="blue--text">{{ lastUpdatedAt }}</i>
          </v-col>
        </v-row>
        <v-row class="mx-1 mt-7 mb-n9 green--text text--darken-2">
          <span> <b>Success:</b> The report update has completed successfully. </span>
        </v-row>
      </v-card-text>
      <v-card-actions class="mx-2">
        <v-btn
          :loading="isLoading"
          color="secondary"
          @click="close"
        >
          Close
        </v-btn>
        <v-btn
          class="ml-auto"
          color="green"
          @click="startSycnJob"
        >
          Start New Update
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watchEffect } from "vue"
import { isEmpty } from "lodash"

import flightStatisticsJobsApi from "@/api/flight-statistics-jobs-api"

import useSnack from "@/use/use-snack"
import useRouteQuery from "@/use/utils/use-route-query"

const showDialog = useRouteQuery("showReportProgress", false)

const PROGRESS_POLL_INTERVAL_IN_MILLISECONDS = 30 * 1000

const isLoading = ref(false)
const isRunningJob = ref(false)
const justCompleted = ref(false)

const lastUpdatedAt = ref("")
const progressPercent = ref(0)
const progressTimer = ref<number | undefined>(undefined)

const snack = useSnack()

type State = "ready" | "running" | "completed"

const state = computed<State>(() => {
  if (isRunningJob.value) {
    return "running"
  }
  if (justCompleted.value) {
    return "completed"
  }
  return "ready"
})

// TODO: consider using job id, so it can be used to get progress
async function startSycnJob() {
  progressPercent.value = 0
  isRunningJob.value = false
  justCompleted.value = false
  clearTimeout(progressTimer.value)

  isLoading.value = true
  try {
    await flightStatisticsJobsApi.create()
    await checkProgress()

    snack.success("Update reports job started successfully")
  } catch (error) {
    console.error(`Failed to create flight statistics job: ${error}`, { error })
    snack.error(`Failed to start update reports job: ${error}`)
  } finally {
    isLoading.value = false
  }
}

async function checkProgress() {
  isLoading.value = true
  try {
    const { flightStatisticJobs } = await flightStatisticsJobsApi.list({
      order: [["updatedAt", "DESC"]],
      perPage: 1,
    })
    if (isEmpty(flightStatisticJobs)) {
      isRunningJob.value = false
      lastUpdatedAt.value = "Never"
      progressPercent.value = 0
      clearTimeout(progressTimer.value)
      return
    }

    const latestFlightStatisticJob = flightStatisticJobs[0]
    const { progress, updatedAt } = latestFlightStatisticJob
    lastUpdatedAt.value = updatedAt.toLocaleString()
    progressPercent.value = progress

    if (progress === 100) {
      if (isRunningJob.value) {
        justCompleted.value = true
      }

      isRunningJob.value = false
      clearTimeout(progressTimer.value)
      return
    }

    isRunningJob.value = true
    progressTimer.value = window.setTimeout(() => {
      checkProgress()
    }, PROGRESS_POLL_INTERVAL_IN_MILLISECONDS)
  } catch (error) {
    console.error(`Failed to get flight statistic jobs: ${error}`, { error })
    snack.error(`Failed to get flight statistic jobs: ${error}`)
  } finally {
    isLoading.value = false
  }
}

watchEffect(() => {
  if (showDialog.value) {
    checkProgress()
  } else {
    clearTimeout(progressTimer.value)
  }
})

function open() {
  showDialog.value = true
}

function close() {
  showDialog.value = false
}

onUnmounted(() => {
  clearTimeout(progressTimer.value)
})

defineExpose({
  open,
  close,
})
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
