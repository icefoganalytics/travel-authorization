<template>
  <TravelAuthorizationPreApprovalSubmissionsDataTable
    ref="travelAuthorizationPreApprovalSubmissionsDataTable"
  >
    <template #top>
      <TravelAuthorizationsPreApprovalApproveDialog
        ref="travelAuthorizationsPreApprovalApproveDialog"
        @approved="refresh"
      />
    </template>
    <template #item.actions="{ item }">
      <div class="d-flex justify-end gap-4">
        <SubmitTravel
          v-if="item.status === TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES.DRAFT"
          :submission-id="item.id"
          :edit-button="true"
          button-name="Edit"
          :travel-requests="travelAuthorizationPreApprovals"
          :selected-requests="item.preApprovals"
          @updateTable="refresh"
        />
        <v-btn
          v-else-if="
            item.status === TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES.SUBMITTED
          "
          class="my-0"
          color="primary"
          small
          @click="showTravelAuthorizationsPreApprovalApproveDialog(item.id)"
        >
          Approve
        </v-btn>
        <v-btn
          v-else
          class="my-0"
          small
          color="secondary"
          :to="{
            name: 'travel-pre-approval-submissions/TravelPreApprovalSubmissionPage',
            params: {
              travelAuthorizationPreApprovalSubmissionId: item.id,
            },
          }"
        >
          View
        </v-btn>
        <PrintReport
          :id="item.id"
          :travel-requests="item.preApprovals"
          :button-inside-table="true"
          button-name="Print"
        />
      </div>
    </template>
  </TravelAuthorizationPreApprovalSubmissionsDataTable>
</template>

<script setup>
import { ref } from "vue"

import { TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES } from "@/api/travel-authorization-pre-approval-submissions-api"
import useBreadcrumbs from "@/use/use-breadcrumbs"
import useTravelAuthorizationPreApprovals from "@/use/use-travel-authorization-pre-approvals"

import PrintReport from "@/modules/preapproved/views/Common/PrintReport.vue"
import SubmitTravel from "@/modules/preapproved/views/Common/SubmitTravel.vue"
import TravelAuthorizationsPreApprovalApproveDialog from "@/components/travel-authorization-pre-approval-submissions/TravelAuthorizationsPreApprovalApproveDialog.vue"
import TravelAuthorizationPreApprovalSubmissionsDataTable from "@/components/travel-authorization-pre-approval-submissions/TravelAuthorizationPreApprovalSubmissionsDataTable.vue"

const { travelAuthorizationPreApprovals, refresh: refreshPreApprovals } =
  useTravelAuthorizationPreApprovals()

/** @type {import("vue").Ref<InstanceType<typeof TravelAuthorizationsPreApprovalApproveDialog> | null>} */
const travelAuthorizationsPreApprovalApproveDialog = ref(null)

function showTravelAuthorizationsPreApprovalApproveDialog(
  travelAuthorizationPreApprovalSubmissionId
) {
  travelAuthorizationsPreApprovalApproveDialog.value?.show(
    travelAuthorizationPreApprovalSubmissionId
  )
}

/** @type {import("vue").Ref<InstanceType<typeof TravelAuthorizationPreApprovalSubmissionsDataTable> | null>} */
const travelAuthorizationPreApprovalSubmissionsDataTable = ref(null)

async function refresh() {
  await travelAuthorizationPreApprovalSubmissionsDataTable.value?.refresh()
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
.gap-4 {
  gap: 1rem; /* 16px */
}
</style>
