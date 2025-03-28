<template>
  <v-dialog
    v-model="showDialog"
    persistent
    max-width="950px"
    @keydown.esc="hide"
    @input="hideIfFalse"
  >
    <v-skeleton-loader
      v-if="isNil(travelAuthorizationPreApprovalSubmission)"
      type="card"
    />
    <HeaderActionsFormCard
      v-else
      ref="headerActionsFormCard"
      title="Approval"
      lazy-validation
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

      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-file-input
            v-model="approvalDocument"
            accept="application/pdf,image/x-png,image/jpeg"
            label="Approval Document"
            placeholder="Upload approval"
            hint="Only PDF, PNG, and JPEG files are allowed"
            :rules="[required]"
            persistent-hint
            outlined
          />
        </v-col>
      </v-row>

      <v-row class="mt-1 mb-5">
        <v-col>
          <v-data-table
            :key="tableRefreshKey"
            :items="travelAuthorizationPreApprovals"
            :headers="headers"
            :items-per-page="5"
            :loading="isLoading"
            :server-items-length="totalTravelAuthorizationPreApprovalsTotalCount"
            hide-default-footer
          >
            <template #item.name="{ item }">
              <VTravelAuthorizationPreApprovalProfilesChip
                :travel-authorization-pre-approval="item"
              />
            </template>

            <template #item.actions="{ item }">
              <TravelAuthorizationPreApprovalStatusChip
                v-if="markedAsApprovedOrRejected(item.id)"
                :status="markedTravelAuthorizationPreApprovalMaps.get(item.id)"
              />
              <template v-else>
                <v-btn
                  class="my-0"
                  color="success"
                  @click="markAsApproved(item.id)"
                >
                  Approve
                </v-btn>
                <v-btn
                  class="my-0 ml-0 ml-md-2 mt-2 mt-md-0"
                  color="error"
                  @click="markAsRejected(item.id)"
                >
                  Decline
                </v-btn>
              </template>
            </template>
          </v-data-table>
        </v-col>
      </v-row>

      <v-alert
        v-model="showAlert"
        dense
        color="error"
        dark
        dismissible
      >
        Please select either 'Approved' or 'Declined' status for all the records.
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

import useSnack from "@/use/use-snack"
import useTravelAuthorizationPreApprovals, {
  TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES,
} from "@/use/use-travel-authorization-pre-approvals"
import useTravelAuthorizationPreApprovalSubmission, {
  TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES,
} from "@/use/use-travel-authorization-pre-approval-submission"

import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"
import VTravelAuthorizationPreApprovalProfilesChip from "@/components/travel-authorization-pre-approvals/VTravelAuthorizationPreApprovalProfilesChip.vue"
import TravelAuthorizationPreApprovalStatusChip from "@/components/travel-authorization-pre-approvals/TravelAuthorizationPreApprovalStatusChip.vue"
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
    align: "center",
    value: "actions",
    sortable: false,
  },
])

const travelAuthorizationPreApprovalsQuery = computed(() => ({
  where: {
    submissionId: travelAuthorizationPreApprovalSubmissionId.value,
  },
}))
const {
  travelAuthorizationPreApprovals,
  totalCount: totalTravelAuthorizationPreApprovalsTotalCount,
  isLoading,
} = useTravelAuthorizationPreApprovals(travelAuthorizationPreApprovalsQuery)

const approvedBy = ref(null)
const approvedAt = ref(null)
const approvalDocument = ref(null)
const markedTravelAuthorizationPreApprovalMaps = ref(new Map())

const tableRefreshKey = ref(0)

function markedAsApprovedOrRejected(travelAuthorizationPreApprovalId) {
  return markedTravelAuthorizationPreApprovalMaps.value.has(travelAuthorizationPreApprovalId)
}

function markAsApproved(travelAuthorizationPreApprovalId) {
  markedTravelAuthorizationPreApprovalMaps.value.set(
    travelAuthorizationPreApprovalId,
    TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.APPROVED
  )
  tableRefreshKey.value += 1
}

function markAsRejected(travelAuthorizationPreApprovalId) {
  markedTravelAuthorizationPreApprovalMaps.value.set(
    travelAuthorizationPreApprovalId,
    TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.DECLINED
  )
  tableRefreshKey.value += 1
}

const showAlert = ref(false)
const isSaving = ref(false)
const snack = useSnack()

/** @type {import('vue').Ref<InstanceType<typeof HeaderActionsFormCard> | null>} */
const headerActionsFormCard = ref(null)

async function approve() {
  if (headerActionsFormCard.value === null) return

  const valid = await headerActionsFormCard.value.validate()
  if (!valid) return

  if (
    markedTravelAuthorizationPreApprovalMaps.value.size !==
    totalTravelAuthorizationPreApprovalsTotalCount.value
  ) {
    showAlert.value = true
    return
  }

  isSaving.value = true
  const data = {
    status: TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES.FINISHED,
    approvedBy: approvedBy.value,
    approvedAt: approvedAt.value,
    preApprovals: travelAuthorizationPreApprovals.value.map((preApprovalRequest) => {
      return {
        id: preApprovalRequest.id,
        status: preApprovalRequest.status,
      }
    }),
  }
  const bodyFormData = new FormData()
  bodyFormData.append("file", approvalDocument.value)
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
  tableRefreshKey.value = new Date().getTime()
  markedTravelAuthorizationPreApprovalMaps.value.clear()
  approvalDocument.value = null
  approvedBy.value = null
  approvedAt.value = null
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
