<template>
  <v-dialog
    v-model="approveTravelDialog"
    persistent
    max-width="950px"
  >
    <template #activator="{ on, attrs }">
      <v-btn
        small
        class="my-0"
        color="primary"
        v-bind="attrs"
        v-on="on"
        @click="extractTravelRequests"
      >
        Approve
      </v-btn>
    </template>

    <HeaderActionsFormCard
      ref="headerActionsFormCard"
      title="Approval"
      @submit.prevent="saveApproval"
    >
      <v-row class="mt-10">
        <v-col cols="6">
          <v-text-field
            v-model="approvedBy"
            label="Approved By"
            outlined
            :rules="[required]"
          />
        </v-col>
        <v-col cols="1" />
        <v-col cols="3">
          <v-text-field
            v-model="approvalDate"
            :error="approvalDateErr"
            label="Approval Date"
            outlined
            type="date"
            @input="approvalDateErr = false"
          />
        </v-col>
        <v-col cols="1" />
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
            :headers="headers"
            :items="approvalRequests"
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
          color="success"
          type="submit"
          :loading="savingData"
        >
          Approve
        </v-btn>
        <v-btn
          color="warning"
          outlined
          @click="approveTravelDialog = false"
        >
          Cancel
        </v-btn>
      </template>
    </HeaderActionsFormCard>
  </v-dialog>
</template>

<script setup>
import { ref } from "vue"

import { required } from "@/utils/validators"

import { PREAPPROVED_URL } from "@/urls"
import http from "@/api/http-client"
import { TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES } from "@/api/travel-authorization-pre-approvals-api"
import { TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES } from "@/api/travel-authorization-pre-approval-submissions-api"

import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"
import VTravelAuthorizationPreApprovalProfilesChip from "@/components/travel-authorization-pre-approvals/VTravelAuthorizationPreApprovalProfilesChip.vue"

const props = defineProps({
  travelRequests: {
    type: Array,
    default: () => [],
  },
  submissionId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(["updateTable"])

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

const approvalRequests = ref([])
const approvedBy = ref("")
const approvedByErr = ref(false)
const approvalDate = ref("")
const approvalDateErr = ref(false)
const statusList = ref([
  { text: "Approved", value: TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.APPROVED },
  { text: "Declined", value: TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.DECLINED },
  { text: "Submitted", value: TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.SUBMITTED },
])
const approveTravelDialog = ref(false)
const approvalFileType = ref("")
const approvalFileName = ref("")
const alert = ref(false)
const alertMsg = ref("")
const savingData = ref(false)
const reader = ref(new FileReader())
const update = ref(0)

function extractTravelRequests() {
  alert.value = false
  approvalFileName.value = ""
  approvalFileType.value = ""
  approvedBy.value = ""
  approvalDate.value = ""
  approvedByErr.value = false
  approvalDateErr.value = false
  approvalRequests.value = JSON.parse(JSON.stringify(props.travelRequests))
}

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

  approvedByErr.value = approvedBy.value ? false : true
  approvalDateErr.value = approvalDate.value ? false : true
  if (approvedByErr.value || approvalDateErr.value) return false

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

async function saveApproval() {
  alert.value = false

  if (checkFields()) {
    if (!reader.value?.result || approvalFileType.value != "application/pdf") {
      alertMsg.value = "Please upload the approval PDF file."
      alert.value = true
      return
    }

    savingData.value = true
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

    return http
      .post(`${PREAPPROVED_URL}/approval/${props.submissionId}`, bodyFormData, header)
      .then(() => {
        savingData.value = false
        approveTravelDialog.value = false
        emit("updateTable")
      })
      .catch((e) => {
        savingData.value = false
        console.log(e.response.data)
        alertMsg.value = e.response.data
        alert.value = true
      })
  }
}
</script>

<style scoped>
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
