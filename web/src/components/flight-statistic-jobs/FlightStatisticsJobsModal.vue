<template>
  <v-dialog
    v-model="showDialog"
    persistent
    max-width="500px"
    @keydown.esc="close"
  >
    <!-- Ready State Card -->
    <v-card v-if="state === 'ready'">
      <v-card-title class="text-h5">Report Updates</v-card-title>
      <v-card-text>
        <div class="info-row">
          <strong>Last Update:</strong> <span class="last-updated">{{ lastUpdatedAt }}</span>
        </div>

        <v-alert
          type="warning"
          outlined
          class="mt-5"
        >
          Updating the Reports takes about <strong>15-30 Minutes</strong>. Please make sure you need
          to update them in the DB based on the date shown above.
        </v-alert>
      </v-card-text>
      <v-card-actions>
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
      <v-card-title class="text-h5">Report Updates</v-card-title>
      <v-card-text>
        <div class="info-row">
          <strong>Last Update:</strong> <span class="last-updated">{{ lastUpdatedAt }}</span>
        </div>

        <div class="progress-section">
          <strong>Progress:</strong>
          <v-progress-linear
            :value="progressPercent"
            color="amber"
            height="25"
            class="mt-2"
          >
            <template #default="{ value }">
              <strong>{{ Math.ceil(value) }}%</strong>
            </template>
          </v-progress-linear>
        </div>

        <v-alert
          type="info"
          outlined
          color="amber darken-2"
          class="mt-5"
        >
          The job is currently running. This may take 15-30 minutes to complete.
        </v-alert>
      </v-card-text>
      <v-card-actions>
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
      <v-card-title class="text-h5">Report Updates</v-card-title>
      <v-card-text>
        <div class="info-row">
          <strong>Last Update:</strong> <span class="last-updated">{{ lastUpdatedAt }}</span>
        </div>

        <v-alert
          type="success"
          outlined
          class="mt-5"
        >
          The report update has completed successfully.
        </v-alert>
      </v-card-text>
      <v-card-actions>
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

const PROGRESS_POLL_INTERVAL_IN_MILLISECONDS = 5 * 1000

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
.info-row {
  margin-top: 1rem;
  font-size: 13pt;
}

.last-updated {
  color: #1976d2;
  font-style: italic;
}

.progress-section {
  margin-top: 1.5rem;
  font-size: 13pt;
}
</style>
