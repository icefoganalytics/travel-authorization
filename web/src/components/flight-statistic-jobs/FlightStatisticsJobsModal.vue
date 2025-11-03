<template>
  <v-dialog
    v-model="showDialog"
    persistent
    max-width="500px"
    @keydown.esc="close"
  >
    <v-card>
      <v-card-title class="text-h5 primary">Report Updates</v-card-title>
      <v-card-text>
        <v-row
          class="mt-3"
          style="font-size: 13pt"
        >
          <v-col cols="9"
            ><b>Last Update:</b> <i class="blue--text">{{ lastUpdatedAt }}</i></v-col
          >
          <v-col
            v-if="isRunningJob"
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
        <v-row
          v-if="!isRunningJob"
          class="mx-1 mt-7 mb-n7 red--text"
        >
          <span
            ><b>Warning:</b> Updating the Reports takes about <b>15-30 Minutes</b>. Please make sure
            you need to update them in the DB based on the date shown above.</span
          >
        </v-row>
        <v-row
          v-if="isRunningJob && isLoading"
          class="mx-1 mt-7 mb-n9 red--text"
        >
          Please Wait!
        </v-row>
      </v-card-text>
      <v-card-actions class="mx-2">
        <v-btn
          :loading="isLoading"
          color="secondary"
          @click="close"
          >Close
        </v-btn>
        <v-btn
          :disabled="isRunningJob"
          :loading="isLoading"
          class="ml-auto"
          color="primary"
          @click="startUpdate"
          >Start Update
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { onUnmounted, ref } from "vue"
import { isEmpty } from "lodash"

import flightStatisticsJobsApi from "@/api/flight-statistics-jobs-api"

import useSnack from "@/use/use-snack"

const PROGRESS_POLL_INTERVAL_IN_MILLISECONDS = 30 * 1000

const showDialog = ref(false)
const isLoading = ref(false)
const isRunningJob = ref(false)

const lastUpdatedAt = ref("")
const progressPercent = ref(0)
const progressTimer = ref<number | undefined>(undefined)

const snack = useSnack()

// TODO: keep track of job id, so it can be used to get progress
async function startUpdate() {
  isLoading.value = true
  try {
    await flightStatisticsJobsApi.create()
    progressPercent.value = 0
    isRunningJob.value = true

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
      clearTimeout(progressTimer.value)
      return
    }

    const latestFlightStatisticJob = flightStatisticJobs[0]

    const { progress, updatedAt } = latestFlightStatisticJob
    progressPercent.value = progress
    if (progress === 100) {
      isRunningJob.value = false
      clearTimeout(progressTimer.value)
      return
    }

    const updateTime = new Date()
    updateTime.setMinutes(updateTime.getMinutes() - 1)
    const lastUpdateDate = new Date(updatedAt)
    lastUpdatedAt.value = lastUpdateDate.toLocaleString()

    isRunningJob.value = updateTime < lastUpdateDate

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

function open() {
  showDialog.value = true
  checkProgress()
}

function close() {
  clearTimeout(progressTimer.value)
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
