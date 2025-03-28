<template>
  <v-skeleton-loader
    v-if="isNil(travelAuthorizationPreApprovalSubmission)"
    type="card"
  />
  <HeaderActionsCard
    v-else
    title="Travel Pre-Approval Submission"
  >
    <v-row>
      <v-col>
        <DescriptionElement label="Status">
          <TravelAuthorizationPreApprovalStatusChip
            :status="travelAuthorizationPreApprovalSubmission.status"
          />
        </DescriptionElement>
      </v-col>
      <v-col>
        <DescriptionElement label="Creator">
          <UserChip :user-id="travelAuthorizationPreApprovalSubmission.creatorId" />
        </DescriptionElement>
      </v-col>
    </v-row>
    <template v-if="isApproved">
      <v-row>
        <v-col>
          <DescriptionElement
            label="Approved By"
            vertical
          >
            <UserChip :user-id="travelAuthorizationPreApprovalSubmission.approverId" />
          </DescriptionElement>
        </v-col>
        <v-col>
          <DescriptionElement
            label="Approval Date"
            :value="formatDate(travelAuthorizationPreApprovalSubmission.approvedAt)"
            vertical
          />
        </v-col>
      </v-row>
    </template>
    <template v-else-if="isRejected">
      <v-row>
        <v-col>
          <DescriptionElement
            label="Signed By"
            vertical
          >
            <UserChip :user-id="travelAuthorizationPreApprovalSubmission.rejectorId" />
          </DescriptionElement>
        </v-col>
        <v-col>
          <DescriptionElement
            label="Date"
            :value="formatDate(travelAuthorizationPreApprovalSubmission.rejectedAt)"
            vertical
          />
        </v-col>
      </v-row>
    </template>
    <v-row>
      <v-col>
        <TravelAuthorizationPreApprovalsSimpleDataTable
          :where="travelAuthorizationPreApprovalsWhere"
          route-query-suffix="Requests"
        />
      </v-col>
    </v-row>
  </HeaderActionsCard>
</template>

<script setup>
import { computed, toRefs } from "vue"
import { isNil } from "lodash"

import { formatDate } from "@/utils/formatters"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useTravelAuthorizationPreApprovalSubmission, {
  TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES,
} from "@/use/use-travel-authorization-pre-approval-submission"

import DescriptionElement from "@/components/common/DescriptionElement.vue"
import HeaderActionsCard from "@/components/common/HeaderActionsCard.vue"
import UserChip from "@/components/users/UserChip.vue"
import TravelAuthorizationPreApprovalStatusChip from "@/components/travel-authorization-pre-approval-submissions/TravelAuthorizationPreApprovalStatusChip.vue"
import TravelAuthorizationPreApprovalsSimpleDataTable from "@/components/travel-authorization-pre-approvals/TravelAuthorizationPreApprovalsSimpleDataTable.vue"

const props = defineProps({
  travelAuthorizationPreApprovalSubmissionId: {
    type: [String, Number],
    required: true,
  },
})

const { travelAuthorizationPreApprovalSubmissionId } = toRefs(props)
const { travelAuthorizationPreApprovalSubmission } = useTravelAuthorizationPreApprovalSubmission(
  travelAuthorizationPreApprovalSubmissionId
)
const travelAuthorizationPreApprovalsWhere = computed(() => ({
  submissionId: props.travelAuthorizationPreApprovalSubmissionId,
}))

const isApproved = computed(() => {
  return (
    travelAuthorizationPreApprovalSubmission.value?.status ===
    TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES.APPROVED
  )
})
const isRejected = computed(() => {
  return (
    travelAuthorizationPreApprovalSubmission.value?.status ===
    TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES.REJECTED
  )
})

useBreadcrumbs([
  {
    text: "Travel Pre-Approval Submissions",
    to: {
      name: "travel-pre-approvals/TravelPreApprovalSubmissionsPage",
    },
  },
  {
    text: "Submission",
    to: {
      name: "travel-pre-approval-submissions/TravelPreApprovalSubmissionPage",
      params: {
        travelAuthorizationPreApprovalSubmissionId:
          props.travelAuthorizationPreApprovalSubmissionId,
      },
    },
  },
])
</script>

<style scoped>
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
