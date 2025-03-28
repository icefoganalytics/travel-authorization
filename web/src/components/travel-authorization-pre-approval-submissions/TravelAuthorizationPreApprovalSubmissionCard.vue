<template>
  <v-skeleton-loader
    v-if="isNil(travelAuthorizationPreApprovalSubmission)"
    type="card"
  />
  <!-- TODO: make each status type its own component -->
  <v-card
    v-else-if="
      travelAuthorizationPreApprovalSubmission.status ===
      TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES.APPROVED
    "
    class="mt-5 grey lighten-5"
    outlined
  >
    <v-card-title class="grey lighten-5 text-h5"> Approval </v-card-title>
    <v-divider />
    <v-card-text>
      <v-row class="mt-0 mx-3">
        <v-col
          cols="12"
          md="5"
        >
          <DescriptionElement
            label="Approved By"
            vertical
          >
            <UserChip :user-id="travelAuthorizationPreApprovalSubmission.approverId" />
          </DescriptionElement>
        </v-col>
        <v-col
          cols="12"
          md="1"
        />
        <v-col
          cols="12"
          md="5"
        >
          <v-btn
            :loading="isDownloading"
            color="transparent"
            @click="downloadPdf"
          >
            <span class="text-h6 primary--text text-decoration-underline">
              <b>Approval Document.pdf</b>
            </span>
          </v-btn>
        </v-col>
      </v-row>
      <v-row class="mx-3 mt-n5 mb-5">
        <v-col
          cols="12"
          md="3"
        >
          <DescriptionElement
            label="Approval Date"
            :value="formatDate(travelAuthorizationPreApprovalSubmission.approvedAt)"
            vertical
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>

  <v-card
    v-else-if="
      travelAuthorizationPreApprovalSubmission.status ===
      TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES.DECLINED
    "
    class="mt-5 grey lighten-5"
    outlined
  >
    <v-card-title class="grey lighten-5 text-h5 red--text"> Declined </v-card-title>
    <v-divider />
    <v-card-text>
      <v-row class="mt-0 mx-3">
        <v-col
          cols="12"
          md="5"
        >
          <DescriptionElement
            label="Signed By"
            vertical
          >
            <UserChip :user-id="travelAuthorizationPreApprovalSubmission.approverId" />
          </DescriptionElement>
        </v-col>
        <v-col
          cols="12"
          md="1"
        />
        <v-col
          cols="12"
          md="5"
        >
          <v-btn
            :loading="isDownloading"
            color="transparent"
            @click="downloadPdf"
            ><span class="text-h6 primary--text text-decoration-underline"> Document.pdf </span>
          </v-btn>
        </v-col>
      </v-row>
      <v-row class="mx-3 mt-n5 mb-5">
        <v-col
          cols="12"
          md="3"
        >
          <DescriptionElement
            label="Date"
            :value="formatDate(travelAuthorizationPreApprovalSubmission.approvedAt)"
            vertical
          />
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
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
import { ref, toRefs } from "vue"
import { isNil } from "lodash"

import http from "@/api/http-client"
import { PREAPPROVED_URL } from "@/urls"

import useTravelAuthorizationPreApprovalSubmission, {
  TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES,
} from "@/use/use-travel-authorization-pre-approval-submission"

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
