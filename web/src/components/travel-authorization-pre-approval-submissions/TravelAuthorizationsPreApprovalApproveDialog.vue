<template>
  <v-dialog
    v-model="showDialog"
    persistent
    max-width="950px"
    @keydown.esc="hide"
    @input="hideIfFalse"
  >
    <HeaderActionsFormCard
      ref="headerActionsFormCard"
      title="Approval"
      @submit.prevent="approve"
    >
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <YgEmployeeAutocomplete
            v-model="travelAuthorizationPreApprovalSubmission.approverId"
            label="Approved By"
            outlined
            :rules="[required]"
          />
        </v-col>
        <v-col
          class="d-none d-md-block"
          cols="1"
        />
        <v-col
          cols="12"
          md="3"
        >
          <v-text-field
            v-model="travelAuthorizationPreApprovalSubmission.approvedAt"
            label="Approval Date"
            :rules="[required]"
            outlined
            type="date"
          />
        </v-col>
        <v-col
          class="d-none d-md-block"
          cols="1"
        />
      </v-row>

      <v-row
        class="mt-1 mb-5"
        align="center"
        justify="center"
      >
        <v-col cols="4">
          <v-btn
            class="ml-1"
            color="primary"
            @click="uploadApproval"
          >
            Upload Approval
            <input
              id="inputfile"
              type="file"
              style="display: none"
              accept="application/pdf,image/x-png,image/jpeg"
              onclick="this.value=null;"
              @change="handleSelectedFile"
            />
          </v-btn>
        </v-col>
        <v-col cols="1" />
        <v-col
          :key="update"
          class="blue--text text-h6 text-decoration-underline"
          cols="7"
        >
          <a
            v-if="reader.result"
            :href="reader.result"
            download="UploadedFile.pdf"
            target="_blank"
            >{{ approvalFileName }}</a
          >
        </v-col>
      </v-row>

      <v-row class="mt-1 mb-5">
        <v-col>
          <v-data-table
            :items="travelAuthorizationPreApprovals"
            :headers="headers"
            :items-per-page="5"
            hide-default-footer
          >
            <template #item.name="{ item }">
              <VTravelAuthorizationPreApprovalProfilesChip
                :travel-authorization-pre-approval="item"
              />
            </template>

            <template #item.actions="{ item }">
              <v-select
                v-model="item.status"
                :background-color="
                  item.status == 'declined'
                    ? 'red lighten-4'
                    : item.status == 'approved'
                      ? 'green lighten-4'
                      : 'grey lighten-4'
                "
                class="my-0 py-0"
                dense
                hide-details
                :items="statusList"
                label=""
                solo
                @change="alert = false"
              />
            </template>
          </v-data-table>
        </v-col>
      </v-row>

      <v-alert
        v-model="alert"
        dense
        color="red darken-4"
        dark
        dismissible
      >
        {{ alertMsg }}
      </v-alert>

      <template #actions>
        <v-btn
          :loading="isSaving"
          color="success"
          type="submit"
        >
          Approve
        </v-btn>
        <v-btn
          :loading="isSaving"
          color="warning"
          outlined
          @click="hide"
        >
          Cancel
        </v-btn>
      </template>
    </HeaderActionsFormCard>
  </v-dialog>
</template>

<script setup>
import { computed, ref } from "vue"
import { isNil } from "lodash"

import { required } from "@/utils/validators"
import useRouteQuery, { jsonTransformer } from "@/use/utils/use-route-query"

import { PREAPPROVED_URL } from "@/urls"
import http from "@/api/http-client"
import { TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES } from "@/api/travel-authorization-pre-approvals-api"
import { TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES } from "@/api/travel-authorization-pre-approval-submissions-api"

import useSnack from "@/use/use-snack"
import useTravelAuthorizationPreApprovals from "@/use/use-travel-authorization-pre-approvals"
import useTravelAuthorizationPreApprovalSubmission from "@/use/use-travel-authorization-pre-approval-submission"

import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"
import VTravelAuthorizationPreApprovalProfilesChip from "@/components/travel-authorization-pre-approvals/VTravelAuthorizationPreApprovalProfilesChip.vue"
import YgEmployeeAutocomplete from "@/components/yg-employees/YgEmployeeAutocomplete.vue"

const emit = defineEmits(["approved"])

const travelAuthorizationPreApprovalSubmissionId = useRouteQuery("showApprovalDialog", undefined, {
  transform: jsonTransformer,
})
const showDialog = computed(() => !isNil(travelAuthorizationPreApprovalSubmissionId.value))

const { travelAuthorizationPreApprovalSubmission } = useTravelAuthorizationPreApprovalSubmission(
  travelAuthorizationPreApprovalSubmissionId
)

const headers = ref([
  {
    text: "Name",
    value: "name",
    sortable: false,
  },
  {
    text: "Branch",
    value: "branch",
  },
  {
    text: "Reason",
    value: "reason",
  },
  {
    text: "Location",
    value: "location",
  },
  {
    text: "Actions",
    value: "actions",
    sortable: false,
  },
])

const travelAuthorizationPreApprovalsQuery = computed(() => ({
  where: {
    submissionId: travelAuthorizationPreApprovalSubmissionId.value,
  },
}))
const { travelAuthorizationPreApprovals } = useTravelAuthorizationPreApprovals(
  travelAuthorizationPreApprovalsQuery
)

const approvalRequests = ref([])
const approvedBy = ref("")
const approvalDate = ref("")
const statusList = ref([
  { text: "Approved", value: TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.APPROVED },
  { text: "Declined", value: TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.DECLINED },
  { text: "Submitted", value: TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.SUBMITTED },
])
const approvalFileType = ref("")
const approvalFileName = ref("")
const alert = ref(false)
const alertMsg = ref("")
const isSaving = ref(false)
const reader = ref(new FileReader())
const update = ref(0)

function uploadApproval() {
  alert.value = false
  const el = document.getElementById("inputfile")
  if (el) el.click()
}

function handleSelectedFile(event) {
  event.preventDefault()
  event.stopPropagation()

  if (event.target.files && event.target.files[0]) {
    const file = event.target.files[0]

    approvalFileType.value = file.type
    approvalFileName.value = file.name

    reader.value.onload = () => {
      update.value++
    }
    reader.value.readAsDataURL(file)
  }
}

function checkFields() {
  alert.value = false

  for (const request of approvalRequests.value) {
    if (
      ![
        TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.APPROVED,
        TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.DECLINED,
      ].includes(request.status)
    ) {
      alertMsg.value = "Please select either 'Approved' or 'Declined' status for all the records."
      alert.value = true
      return false
    }
  }
  return true
}

const snack = useSnack()

async function approve() {
  if (!checkFields()) return
  if (!reader.value?.result || approvalFileType.value != "application/pdf") {
    alertMsg.value = "Please upload the approval PDF file."
    alert.value = true
    return
  }

  isSaving.value = true
  const data = {
    status: TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES.FINISHED,
    approvalDate: approvalDate.value,
    approvedBy: approvedBy.value,
    preApprovals: approvalRequests.value.map((req) => {
      return {
        id: req.id,
        status: req.status,
      }
    }),
  }
  const bodyFormData = new FormData()
  bodyFormData.append("file", reader.value.result)
  bodyFormData.append("data", JSON.stringify(data))

  const header = {
    responseType: "application/pdf",
    headers: {
      "Content-Type": "multipart/form-data",
    },
  }

  try {
    await http.post(
      `${PREAPPROVED_URL}/approval/${travelAuthorizationPreApprovalSubmissionId.value}`,
      bodyFormData,
      header
    )
    snack.success("Travel pre-approval submission approved.")
    emit("approved", travelAuthorizationPreApprovalSubmissionId.value)
    hide()
  } catch (error) {
    console.error(`Error approving travel authorization pre-approval submission: ${error}`, {
      error,
    })
    snack.error(`Failed to approve travel pre-approval submission: ${error}`)
  } finally {
    isSaving.value = false
  }
}

function show(newTravelAuthorizationPreApprovalSubmissionId) {
  travelAuthorizationPreApprovalSubmissionId.value = newTravelAuthorizationPreApprovalSubmissionId
}

function hide() {
  travelAuthorizationPreApprovalSubmissionId.value = undefined
}

function hideIfFalse(value) {
  if (value !== false) return

  hide()
}

defineExpose({
  show,
  hide,
})
</script>

<style scoped>
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
