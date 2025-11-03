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

<script>
import { flightStatisticsJobsApi } from "@/api"
import { isEmpty } from "lodash"

export default {
  name: "UpdateProgressModal",
  components: {},
  props: {},
  data() {
    return {
      updateDialog: false,
      loadingData: false,
      lastUpdate: "",
      progress: 0,
      runningUpdates: false,
      timeHandle: null,
    }
  },
  mounted() {},
  beforeDestroy() {
    clearTimeout(this.timeHandle)
  },
  methods: {
    async initUpdate() {
      await this.getProgress()
    },
    async getProgress() {
      this.loadingData = true
      try {
        const { flightStatisticJobs } = await flightStatisticsJobsApi.list()
        if (isEmpty(flightStatisticJobs)) return

        const firstFlightStatisticJob = flightStatisticJobs[0]
        this.progress = firstFlightStatisticJob.progress
        const updateTime = new Date()
        updateTime.setMinutes(updateTime.getMinutes() - 1)
        const lastUpdate = new Date(firstFlightStatisticJob.updatedAt)
        this.runningUpdates = updateTime < lastUpdate
        this.lastUpdate = lastUpdate.toLocaleString()
        this.timeHandle = setTimeout(() => {
          this.getProgress()
        }, 30000)
      } catch (error) {
        console.error(`Failed to get flight statistic jobs: ${error}`, { error })
      } finally {
        this.loadingData = false
      }
    },
    closeDialog() {
      clearTimeout(this.timeHandle)
      this.updateDialog = false
    },
    async startUpdate() {
      this.loadingData = true
      try {
        await flightStatisticsJobsApi.create()
      } catch (error) {
        console.error(`Failed to create flight statistics job: ${error}`, { error })
      } finally {
        this.runningUpdates = true
        this.progress = 0
        this.loadingData = false
      }
    },
  },
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
