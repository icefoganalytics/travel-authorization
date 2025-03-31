<template>
  <v-skeleton-loader
    v-if="isNil(travelAuthorizationPreApprovalSubmission)"
    type="card"
  />
  <!-- TODO: make each status type its own component -->
  <!-- TODO: share content with web/src/pages/travel-pre-approval-submissions/TravelPreApprovalSubmissionPage.vue -->
  <HeaderActionsFormCard
    v-else-if="isApproved"
    title="Approved"
  >
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
  </HeaderActionsFormCard>
  <HeaderActionsFormCard
    v-else-if="isDeclined"
    title="Declined"
  >
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
  </HeaderActionsFormCard>
  <v-alert
    v-else
    type="warning"
    class="mt-5"
    title="Unknown Status"
  >
    Not sure how to handle Travel Pre-Approval Submission with status
    {{ travelAuthorizationPreApprovalSubmission.status }}
  </v-alert>
</template>

<script setup>
import { computed, toRefs } from "vue"
import { isNil } from "lodash"

import { formatDate } from "@/utils/formatters"

import useTravelAuthorizationPreApprovalSubmission, {
  TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES,
} from "@/use/use-travel-authorization-pre-approval-submission"

import DescriptionElement from "@/components/common/DescriptionElement.vue"
import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"
import DownloadApprovalDocumentFormBtn from "@/components/travel-authorization-pre-approval-documents/DownloadApprovalDocumentFormBtn.vue"
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

const isApproved = computed(
  () =>
    travelAuthorizationPreApprovalSubmission.value?.status ===
    TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES.APPROVED
)

const isDeclined = computed(
  () =>
    travelAuthorizationPreApprovalSubmission.value?.status ===
    TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES.DECLINED
)

const travelAuthorizationPreApprovalDocuments = computed(
  () => travelAuthorizationPreApprovalSubmission.value?.documents
)
</script>
