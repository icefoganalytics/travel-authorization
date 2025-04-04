<template>
  <TravelAuthorizationPreApprovalSubmissionsDataTable
    ref="travelAuthorizationPreApprovalSubmissionsDataTable"
    v-model="selectedItems"
    show-select
    single-select
  >
    <template #top>
      <v-row>
        <v-col class="d-flex flex-column flex-md-row justify-end">
          <TravelAuthorizationsPreApprovalSubmissionApproveDialog
            ref="travelAuthorizationsPreApprovalSubmissionApproveDialog"
            @approved="refresh"
          />

          <ConditionalTooltipButton
            v-if="canAdminTravelPreApprovals"
            :disabled="isEmpty(selectedItems)"
            color="primary"
            tooltip-text="Select an item to enable the print action."
            @click="showTravelAuthorizationPreApprovalsPrintDialog"
          >
            Print
            <TravelAuthorizationPreApprovalsPrintDialog
              v-if="!isEmpty(selectedItems)"
              ref="travelAuthorizationPreApprovalsPrintDialog"
              :where="travelAuthorizationPreApprovalsWhere"
            />
          </ConditionalTooltipButton>
          <ConditionalTooltipButton
            v-if="canAdminTravelPreApprovals"
            :disabled="!canRevertToDraft"
            class="ml-3"
            color="warning"
            outlined
            tooltip-text="Select submitted item to enable revert to draft option."
            @click="revertToDraft(firstSelectedItem.id)"
          >
            Revert to Draft
          </ConditionalTooltipButton>
        </v-col>
      </v-row>
    </template>
    <template #item.actions="{ item }">
      <div class="d-flex justify-end gap-4">
        <v-btn
          v-if="canEdit(item)"
          color="primary"
          :outlined="hasSelectedItems"
          :to="{
            name: 'travel-pre-approval-submissions/TravelPreApprovalSubmissionEditPage',
            params: {
              travelAuthorizationPreApprovalSubmissionId: item.id,
            },
          }"
        >
          Edit
        </v-btn>
        <v-btn
          v-else-if="canApprove(item)"
          color="primary"
          :outlined="hasSelectedItems"
          @click="showTravelAuthorizationsPreApprovalApproveDialog(item.id)"
        >
          Approve
        </v-btn>
        <v-btn
          v-else
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
      </div>
    </template>
  </TravelAuthorizationPreApprovalSubmissionsDataTable>
</template>

<script setup>
import { computed, ref } from "vue"
import { isEmpty } from "lodash"

import { TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES } from "@/api/travel-authorization-pre-approval-submissions-api"
import useBreadcrumbs from "@/use/use-breadcrumbs"
import useCurrentUser from "@/use/use-current-user"

import ConditionalTooltipButton from "@/components/common/ConditionalTooltipButton.vue"
import TravelAuthorizationPreApprovalsPrintDialog from "@/components/travel-authorization-pre-approvals/TravelAuthorizationPreApprovalsPrintDialog.vue"
import TravelAuthorizationPreApprovalSubmissionsDataTable from "@/components/travel-authorization-pre-approval-submissions/TravelAuthorizationPreApprovalSubmissionsDataTable.vue"
import TravelAuthorizationsPreApprovalSubmissionApproveDialog from "@/components/travel-authorization-pre-approval-submissions/TravelAuthorizationsPreApprovalSubmissionApproveDialog.vue"

const selectedItems = ref([])
const hasSelectedItems = computed(() => !isEmpty(selectedItems.value))
const firstSelectedItem = computed(() => selectedItems.value[0])
const canRevertToDraft = computed(
  () =>
    firstSelectedItem.value?.status ===
    TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES.SUBMITTED
)

const travelAuthorizationPreApprovalsWhere = computed(() => ({
  submissionId: firstSelectedItem.value?.id,
}))

/** @type {import("vue").Ref<InstanceType<typeof TravelAuthorizationPreApprovalsPrintDialog> | null>} */
const travelAuthorizationPreApprovalsPrintDialog = ref(null)

function showTravelAuthorizationPreApprovalsPrintDialog() {
  travelAuthorizationPreApprovalsPrintDialog.value?.show()
}

const { isAdmin, isPreApprovedTravelAdmin } = useCurrentUser()
const canAdminTravelPreApprovals = computed(() => isAdmin.value || isPreApprovedTravelAdmin.value)

function canEdit(travelAuthorizationPreApprovalSubmission) {
  return (
    travelAuthorizationPreApprovalSubmission.status ===
      TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES.DRAFT &&
    canAdminTravelPreApprovals.value
  )
}

function canApprove(travelAuthorizationPreApprovalSubmission) {
  return (
    travelAuthorizationPreApprovalSubmission.status ===
      TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES.SUBMITTED &&
    canAdminTravelPreApprovals.value
  )
}

/** @type {import("vue").Ref<InstanceType<typeof TravelAuthorizationsPreApprovalSubmissionApproveDialog> | null>} */
const travelAuthorizationsPreApprovalSubmissionApproveDialog = ref(null)

function showTravelAuthorizationsPreApprovalApproveDialog(
  travelAuthorizationPreApprovalSubmissionId
) {
  travelAuthorizationsPreApprovalSubmissionApproveDialog.value?.show(
    travelAuthorizationPreApprovalSubmissionId
  )
}

function revertToDraft(travelAuthorizationPreApprovalSubmissionId) {
  alert(`Revert to draft for submission ${travelAuthorizationPreApprovalSubmissionId}`)
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
