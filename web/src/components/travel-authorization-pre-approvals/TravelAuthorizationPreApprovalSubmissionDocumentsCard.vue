<template>
  <v-skeleton-loader
    v-if="isNil(travelAuthorizationPreApprovalSubmission)"
    type="card"
  />
  <!-- TODO: make each status type its own component -->
  <!-- TODO: share content with web/src/pages/travel-pre-approval-submissions/TravelPreApprovalSubmissionPage.vue -->
  <HeaderActionsFormCard
    v-else-if="isSubmitted || isApproved || isDeclined"
    title="Documents"
  >
    <template #header-actions>
      <TravelAuthorizationPreApprovalStatusChip :status="travelAuthorizationPreApprovalStatus" />
    </template>

    <template v-if="isSubmitted">
      <v-row>
        <v-col>
          <p>Documents will be made available when approved or declined.</p>
        </v-col>
      </v-row>
    </template>
    <template v-else-if="isApproved">
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
    </template>

    <template v-else-if="isDeclined">
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
    </template>
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

import { TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES } from "@/api/travel-authorization-pre-approvals-api"
import useTravelAuthorizationPreApprovalSubmission from "@/use/use-travel-authorization-pre-approval-submission"

import DescriptionElement from "@/components/common/DescriptionElement.vue"
import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"
import DownloadApprovalDocumentFormBtn from "@/components/travel-authorization-pre-approval-documents/DownloadApprovalDocumentFormBtn.vue"
import TravelAuthorizationPreApprovalStatusChip from "@/components/travel-authorization-pre-approvals/TravelAuthorizationPreApprovalStatusChip.vue"
import UserChip from "@/components/users/UserChip.vue"

/** @typedef {import('@/api/travel-authorization-pre-approvals-api.js').TravelAuthorizationPreApprovalStatuses} TravelAuthorizationPreApprovalStatuses*/

const props = defineProps({
  travelAuthorizationPreApprovalStatus: {
    type: String,
    required: true,
  },
  travelAuthorizationPreApprovalSubmissionId: {
    type: [String, Number],
    required: true,
  },
})

const { travelAuthorizationPreApprovalSubmissionId } = toRefs(props)
const { travelAuthorizationPreApprovalSubmission } = useTravelAuthorizationPreApprovalSubmission(
  travelAuthorizationPreApprovalSubmissionId
)

const isSubmitted = computed(
  () =>
    props.travelAuthorizationPreApprovalStatus ===
    TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.SUBMITTED
)

const isApproved = computed(
  () =>
    props.travelAuthorizationPreApprovalStatus ===
    TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.APPROVED
)

const isDeclined = computed(
  () =>
    props.travelAuthorizationPreApprovalStatus ===
    TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.DECLINED
)

const travelAuthorizationPreApprovalDocuments = computed(
  () => travelAuthorizationPreApprovalSubmission.value?.documents
)
</script>
