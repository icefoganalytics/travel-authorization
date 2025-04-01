<template>
  <TravelAuthorizationPreApprovalSubmissionsDataTable
    ref="travelAuthorizationPreApprovalSubmissionsDataTable"
  >
    <template #top>
      <TravelAuthorizationsPreApprovalSubmissionApproveDialog
        ref="travelAuthorizationsPreApprovalSubmissionApproveDialog"
        @approved="refresh"
      />
    </template>
    <template #item.actions="{ item }">
      <div class="d-flex justify-end gap-4">
        <v-btn
          v-if="item.status === TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES.DRAFT"
          class="my-0"
          color="primary"
          :to="{
            name: 'travel-pre-approval-submissions/TravelPreApprovalSubmissionEditPage',
            params: {
              travelAuthorizationPreApprovalSubmissionId: item.id,
            },
          }"
          small
        >
          Edit
        </v-btn>
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

import PrintReport from "@/modules/preapproved/views/Common/PrintReport.vue"
import TravelAuthorizationsPreApprovalSubmissionApproveDialog from "@/components/travel-authorization-pre-approval-submissions/TravelAuthorizationsPreApprovalSubmissionApproveDialog.vue"
import TravelAuthorizationPreApprovalSubmissionsDataTable from "@/components/travel-authorization-pre-approval-submissions/TravelAuthorizationPreApprovalSubmissionsDataTable.vue"

/** @type {import("vue").Ref<InstanceType<typeof TravelAuthorizationsPreApprovalSubmissionApproveDialog> | null>} */
const travelAuthorizationsPreApprovalSubmissionApproveDialog = ref(null)

function showTravelAuthorizationsPreApprovalApproveDialog(
  travelAuthorizationPreApprovalSubmissionId
) {
  travelAuthorizationsPreApprovalSubmissionApproveDialog.value?.show(
    travelAuthorizationPreApprovalSubmissionId
  )
}

/** @type {import("vue").Ref<InstanceType<typeof TravelAuthorizationPreApprovalSubmissionsDataTable> | null>} */
const travelAuthorizationPreApprovalSubmissionsDataTable = ref(null)

async function refresh() {
  await travelAuthorizationPreApprovalSubmissionsDataTable.value?.refresh()
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
