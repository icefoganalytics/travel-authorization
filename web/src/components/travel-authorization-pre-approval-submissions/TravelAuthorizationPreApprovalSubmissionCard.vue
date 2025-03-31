<template>
  <v-skeleton-loader
    v-if="isNil(travelAuthorizationPreApprovalSubmission)"
    type="card"
  />
  <!-- TODO: make each status type its own component -->
  <HeaderActionsFormCard
    v-else-if="isApproved"
    title="Approved"
  >
    <v-row
      v-for="travelAuthorizationPreApprovalDocument in travelAuthorizationPreApprovalDocuments"
      :key="travelAuthorizationPreApprovalDocument.id"
    >
      <v-col cols="12">
        <v-btn
          :loading="isDownloading"
          color="transparent"
          @click="downloadPdf(travelAuthorizationPreApprovalDocument.id)"
        >
          <span class="text-h6 primary--text text-decoration-underline">
            <b>{{ travelAuthorizationPreApprovalDocument.name }}</b>
          </span>
        </v-btn>
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
        <v-btn
          :loading="isDownloading"
          color="transparent"
          @click="downloadPdf(travelAuthorizationPreApprovalDocument.id)"
        >
          <span class="text-h6 primary--text text-decoration-underline">
            <b>{{ travelAuthorizationPreApprovalDocument.name }}</b>
          </span>
        </v-btn>
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
import { computed, ref, toRefs } from "vue"
import { isNil } from "lodash"

import http from "@/api/http-client"
import { PREAPPROVED_URL } from "@/urls"

import { formatDate } from "@/utils/formatters"

import useTravelAuthorizationPreApprovalSubmission, {
  TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES,
} from "@/use/use-travel-authorization-pre-approval-submission"

import UserChip from "@/components/users/UserChip.vue"
import DescriptionElement from "@/components/common/DescriptionElement.vue"
import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"

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

const isDownloading = ref(false)

// TODO: update this to use new endpoint, preferably via form post redirect to get best user experience with the least code
// See https://github.com/icefoganalytics/internal-data-portal/blob/0eb01fff60c6b5d72b060f89e92cf15336225531/web/src/components/dataset-entries/DownloadAsCsvButton.vue#L18
// Or use an http only cookie for auth, but that will take a lot more setup.
async function downloadPdf() {
  isDownloading.value = true
  try {
    const header = {
      responseType: "application/pdf",
      headers: {
        "Content-Type": "application/text",
      },
    }

    const { data } = await http.get(
      `${PREAPPROVED_URL}/document/${travelAuthorizationPreApprovalSubmissionId.value}`,
      header
    )
    isDownloading.value = false
    const link = document.createElement("a")
    link.href = data
    document.body.appendChild(link)
    link.download = "approval_doc.pdf"
    link.click()
    setTimeout(() => URL.revokeObjectURL(link.href), 1000)
  } catch (error) {
    console.error(`Failed to download PDF: ${error}`)
  } finally {
    isDownloading.value = false
  }
}
</script>
