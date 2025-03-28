<template>
  <div class="mt-15 mx-10 mb-5">
    <v-data-table
      :headers="headers"
      :items="travelAuthorizationPreApprovalSubmissions"
      :items-per-page="5"
      class="elevation-1"
    >
      <!-- eslint-disable-next-line vue/no-unused-vars -->
      <template #item.submissionDate="{ item }">
        <!-- eslint-disable-next-line vue/no-parsing-error -->
        {{ item.submissionDate | beautifyDate }}
      </template>
      <template #item.location="{ item }">
        {{ item.preApprovals.map((p) => p.location).join(" - ") }}
      </template>
      <template #item.edit="{ item }">
        <v-row>
          <div style="width: 4.5rem">
            <SubmitTravel
              v-if="item.status === TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES.DRAFT"
              :submission-id="item.preTSubID"
              :edit-button="true"
              button-name="Edit"
              :travel-requests="travelAuthorizationPreApprovals"
              :selected-requests="item.preApprovals"
              @updateTable="refresh"
            />
          </div>
          <div style="width: 6.75rem">
            <ApproveTravel
              v-if="item.status === TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES.SUBMITTED"
              :travel-requests="item.preApprovals"
              :submission-id="item.preTSubID"
              @updateTable="refresh"
            />
          </div>
          <div style="width: 5.75rem">
            <PrintReport
              :id="item.preTSubID"
              :travel-requests="item.preApprovals"
              :button-inside-table="true"
              button-name="Print"
            />
          </div>
        </v-row>
      </template>
    </v-data-table>
  </div>
</template>

<script setup>
import { TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES } from "@/api/travel-authorization-pre-approval-submissions-api"
import useBreadcrumbs from "@/use/use-breadcrumbs"
import useTravelAuthorizationPreApprovals from "@/use/use-travel-authorization-pre-approvals"
import useTravelAuthorizationPreApprovalSubmissions from "@/use/use-travel-authorization-pre-approval-submissions"

import PrintReport from "@/modules/preapproved/views/Common/PrintReport.vue"
import SubmitTravel from "@/modules/preapproved/views/Common/SubmitTravel.vue"
import ApproveTravel from "@/modules/preapproved/views/Submissions/ApproveTravel.vue"

const headers = [
  {
    text: "Submission Date",
    value: "submissionDate",
    class: "blue-grey lighten-4",
  },
  {
    text: "Department",
    value: "department",
    class: "blue-grey lighten-4",
  },
  {
    text: "Location",
    value: "location",
    class: "blue-grey lighten-4",
  },
  {
    text: "Submitter",
    value: "submitter",
    class: "blue-grey lighten-4",
  },
  {
    text: "Status",
    value: "status",
    class: "blue-grey lighten-4",
  },
  {
    text: "",
    sortable: false,
    value: "edit",
    class: "blue-grey lighten-4",
    width: "18rem",
  },
]

const { travelAuthorizationPreApprovalSubmissions, refresh: refreshPreApprovalSubmissions } =
  useTravelAuthorizationPreApprovalSubmissions()

const { travelAuthorizationPreApprovals, refresh: refreshPreApprovals } =
  useTravelAuthorizationPreApprovals()

async function refresh() {
  await refreshPreApprovalSubmissions()
  await refreshPreApprovals()
}

useBreadcrumbs([
  {
    text: "Travel Pre-Approvals",
    to: {
      name: "travel-pre-approvals/TravelPreApprovalRequestsPage",
    },
  },
  {
    text: "Submissions",
    to: {
      name: "travel-pre-approvals/TravelPreApprovalSubmissionsPage",
    },
  },
])
</script>

<style scoped>
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
