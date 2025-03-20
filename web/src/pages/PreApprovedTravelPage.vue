<template>
  <v-card :loading="isLoading">
    <v-card-title>
      <h2>Pre-Approved Travel</h2>
    </v-card-title>
    <v-card-text>
      <v-tabs
        v-model="tabs"
        active-class="primary--text teal lighten-5"
      >
        <v-tab>Requests</v-tab>
        <v-tab>Submissions</v-tab>
      </v-tabs>

      <v-tabs-items v-model="tabs">
        <v-tab-item>
          <v-card flat>
            <PreapprovedRequests
              :travel-requests="travelAuthorizationPreApprovals"
              @updateTable="updatePreapprovedTravel"
            />
          </v-card>
        </v-tab-item>
        <v-tab-item>
          <v-card flat>
            <Submissions
              :travel-submissions="travelAuthorizationPreApprovalSubmissions"
              :travel-requests="travelAuthorizationPreApprovals"
              @updateTable="updatePreapprovedTravel"
            />
          </v-card>
        </v-tab-item>
      </v-tabs-items>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { onMounted, ref } from "vue"

import http from "@/api/http-client"
import { PREAPPROVED_URL } from "@/urls"

import travelAuthorizationPreApprovalsApi, {
  STATUSES,
} from "@/api/travel-authorization-pre-approvals-api"
import useSnack from "@/use/use-snack"

import PreapprovedRequests from "@/modules/preapproved/views/Requests/PreapprovedRequests.vue"
import Submissions from "@/modules/preapproved/views/Submissions/Submissions.vue"

const tabs = ref(null)

const travelAuthorizationPreApprovals = ref([])
const travelAuthorizationPreApprovalSubmissions = ref([])

const isLoading = ref(false)
const snack = useSnack()

onMounted(async () => {
  isLoading.value = true
  try {
    await getPreapprovedTravel()
    await getPreapprovedTravelSubmissions()
  } catch (error) {
    console.error(`Failed to load preapproved travel data: ${error}`)
    snack.error(`Failed to load preapproved travel data: ${error}`)
  } finally {
    isLoading.value = false
  }
})

async function updatePreapprovedTravel() {
  isLoading.value = true
  try {
    await getPreapprovedTravel()
    await getPreapprovedTravelSubmissions()
  } catch (error) {
    console.error(`Failed to load preapproved travel data: ${error}`)
    snack.error(`Failed to load preapproved travel data: ${error}`)
  } finally {
    isLoading.value = false
  }
}

async function getPreapprovedTravel() {
  try {
    const { travelAuthorizationPreApprovals } = await travelAuthorizationPreApprovalsApi.list()
    travelAuthorizationPreApprovals.value = travelAuthorizationPreApprovals.map((preApproval) => ({
      ...preApproval,
      isSelectable:
        preApproval.status !== STATUSES.APPROVED && preApproval.status !== STATUSES.DECLINED,
    }))
  } catch (error) {
    console.error(error)
    throw error
  }
}

async function getPreapprovedTravelSubmissions() {
  return http
    .get(`${PREAPPROVED_URL}/submissions`)
    .then((resp) => {
      travelAuthorizationPreApprovalSubmissions.value = resp.data
    })
    .catch((e) => {
      console.log(e)
    })
}
</script>
