<template>
  <v-skeleton-loader
    v-if="isNil(travelAuthorizationPreApprovalSubmission)"
    type="card"
  />
  <!-- TODO: share content with web/src/components/travel-authorization-pre-approval-submissions/TravelAuthorizationPreApprovalSubmissionCard.vue -->
  <HeaderActionsCard
    v-else
    title="Travel Pre-Approval Submission"
  >
    <template #header-actions>
      <v-btn
        v-if="isDraft"
        class="my-0"
        color="primary"
        :to="{
          name: 'travel-pre-approval-submissions/TravelPreApprovalSubmissionEditPage',
          params: {
            travelAuthorizationPreApprovalSubmissionId,
          },
        }"
      >
        Edit
      </v-btn>
    </template>
    <v-row>
      <v-col>
        <DescriptionElement label="Status">
          <TravelAuthorizationPreApprovalSubmissionStatusChip
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
    <!-- TODO: build separate page per state -->
    <template v-if="isApproved">
      <v-row>
        <v-col>
          <DescriptionElement
            label="Performed By"
            vertical
          >
            <UserChip :user-id="travelAuthorizationPreApprovalSubmission.approverId" />
          </DescriptionElement>
        </v-col>
        <v-col>
          <DescriptionElement
            label="Date"
            :value="formatDate(travelAuthorizationPreApprovalSubmission.approvedAt)"
            vertical
          />
        </v-col>
      </v-row>
      <v-row
        v-for="travelAuthorizationPreApprovalDocument in travelAuthorizationPreApprovalDocuments"
        :key="travelAuthorizationPreApprovalDocument.id"
      >
        <v-col cols="12">
          <DescriptionElement
            label="Approval Document"
            vertical
          >
            <DownloadApprovalDocumentFormBtn
              :travel-authorization-pre-approval-document-id="
                travelAuthorizationPreApprovalDocument.id
              "
              :button-text="travelAuthorizationPreApprovalDocument.name"
            />
          </DescriptionElement>
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <DescriptionElement
            label="Approved By (in document)"
            :value="travelAuthorizationPreApprovalDocument.approvalDocumentApproverName"
            vertical
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <DescriptionElement
            label="Approved Date (in document)"
            :value="formatDate(travelAuthorizationPreApprovalDocument.approvalDocumentApprovedOn)"
            vertical
          />
        </v-col>
      </v-row>
    </template>
    <template v-else-if="isRejected">
      <v-row>
        <v-col>
          <DescriptionElement
            label="Performed By"
            vertical
          >
            <UserChip :user-id="travelAuthorizationPreApprovalSubmission.approverId" />
          </DescriptionElement>
        </v-col>
        <v-col>
          <DescriptionElement
            label="Date"
            :value="formatDate(travelAuthorizationPreApprovalSubmission.approvedAt)"
            vertical
          />
        </v-col>
      </v-row>
      <v-row
        v-for="travelAuthorizationPreApprovalDocument in travelAuthorizationPreApprovalDocuments"
        :key="travelAuthorizationPreApprovalDocument.id"
      >
        <v-col cols="12">
          <DescriptionElement
            label="Signature Document"
            vertical
          >
            <DownloadApprovalDocumentFormBtn
              :travel-authorization-pre-approval-document-id="
                travelAuthorizationPreApprovalDocument.id
              "
              :button-text="travelAuthorizationPreApprovalDocument.name"
            />
          </DescriptionElement>
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <DescriptionElement
            label="Signed By (in document)"
            :value="travelAuthorizationPreApprovalDocument.approvalDocumentApproverName"
            vertical
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <DescriptionElement
            label="Signed Date (in document)"
            :value="formatDate(travelAuthorizationPreApprovalDocument.approvalDocumentApprovedOn)"
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
import DownloadApprovalDocumentFormBtn from "@/components/travel-authorization-pre-approval-documents/DownloadApprovalDocumentFormBtn.vue"
import TravelAuthorizationPreApprovalsSimpleDataTable from "@/components/travel-authorization-pre-approvals/TravelAuthorizationPreApprovalsSimpleDataTable.vue"
import TravelAuthorizationPreApprovalSubmissionStatusChip from "@/components/travel-authorization-pre-approval-submissions/TravelAuthorizationPreApprovalSubmissionStatusChip.vue"
import UserChip from "@/components/users/UserChip.vue"

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

const isDraft = computed(() => {
  return (
    travelAuthorizationPreApprovalSubmission.value?.status ===
    TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES.DRAFT
  )
})
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

const travelAuthorizationPreApprovalDocuments = computed(
  () => travelAuthorizationPreApprovalSubmission.value?.documents
)

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
