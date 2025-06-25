<template>
  <!-- TODO: consider if this should just be a page? -->
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
      lazy-validation
      @submit.prevent="approve"
    >
      <v-row>
        <v-col cols="12">
          <v-file-input
            v-model="approvalDocument"
            accept="application/pdf,image/x-png,image/jpeg"
            label="Approval Document *"
            placeholder="Upload approval"
            hint="Only PDF, PNG, and JPEG files are allowed"
            :rules="[required]"
            persistent-hint
            outlined
            prepend-icon=""
            append-icon="$file"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <YgEmployeeAutocomplete
            v-model="approvalDocumentApproverName"
            label="Approved By (in document) *"
            outlined
            :rules="[required]"
          />
        </v-col>
        <v-col
          cols="12"
          md="3"
        >
          <v-text-field
            v-model="approvalDocumentApprovedOn"
            label="Approval Date (of document) *"
            :rules="[required]"
            outlined
            type="date"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <TravelAuthorizationPreApprovalsSimpleDataTable
            :where="travelAuthorizationPreApprovalsWhere"
            show-actions-header
            :hide-default-footer="false"
            route-query-suffix="ApproveDialog"
          >
            <template #item.name="{ item }">
              <VTravelAuthorizationPreApprovalProfilesChip
                :travel-authorization-pre-approval="item"
              />
            </template>

            <template #item.actions="{ item }">
              <div
                :key="preApprovalMarkRefreshKey"
                class="d-flex flex-column flex-md-row justify-end"
              >
                <template v-if="markedAsApprovedOrRejected(item.id)">
                  <TravelAuthorizationPreApprovalStatusChip
                    :status="markedTravelAuthorizationPreApprovalMaps.get(item.id)"
                  />
                  <v-btn
                    class="my-0 ml-0 ml-md-2 mt-2 mt-md-0"
                    color="warning"
                    small
                    outlined
                    @click="unmark(item.id)"
                  >
                    Revert
                  </v-btn>
                </template>
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
              </div>
            </template>
          </TravelAuthorizationPreApprovalsSimpleDataTable>
        </v-col>
      </v-row>

      <v-alert
        v-model="showAlert"
        type="error"
      >
        Please select either 'Approved' or 'Declined' status for all the records.
      </v-alert>

      <template #actions>
        <v-btn
          :key="preApprovalMarkRefreshKey"
          :loading="isSaving"
          :outlined="!everyTravelAuthorizationPreApprovalMarked"
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
import { computed, ref, watch } from "vue"
import { isNil } from "lodash"
import { serialize } from "object-to-formdata"

import { required } from "@/utils/validators"
import useRouteQuery, { jsonTransformer } from "@/use/utils/use-route-query"

import travelAuthorizationPreApprovalSubmissionsApi, {
  TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES,
} from "@/api/travel-authorization-pre-approval-submissions-api"

import useSnack from "@/use/use-snack"
import useTravelAuthorizationPreApprovals, {
  TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES,
} from "@/use/use-travel-authorization-pre-approvals"

import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"
import VTravelAuthorizationPreApprovalProfilesChip from "@/components/travel-authorization-pre-approvals/VTravelAuthorizationPreApprovalProfilesChip.vue"
import TravelAuthorizationPreApprovalStatusChip from "@/components/travel-authorization-pre-approvals/TravelAuthorizationPreApprovalStatusChip.vue"
import TravelAuthorizationPreApprovalsSimpleDataTable from "@/components/travel-authorization-pre-approvals/TravelAuthorizationPreApprovalsSimpleDataTable.vue"
import YgEmployeeAutocomplete from "@/components/yg-employees/YgEmployeeAutocomplete.vue"

const emit = defineEmits(["approved"])

const travelAuthorizationPreApprovalSubmissionId = useRouteQuery("showApproveDialog", undefined, {
  transform: jsonTransformer,
})
const showDialog = computed(() => !isNil(travelAuthorizationPreApprovalSubmissionId.value))

const travelAuthorizationPreApprovalsWhere = computed(() => ({
  submissionId: travelAuthorizationPreApprovalSubmissionId.value,
}))

/** @type {File | null} */
const approvalDocument = ref(null)
const approvalDocumentApproverName = ref(null)
const approvalDocumentApprovedOn = ref(null)

// NOTE: Vue 2 is not capable of tracking reactive changes to a Map, so we need a "refresh key" to force Vue to re-render the components.
const markedTravelAuthorizationPreApprovalMaps = ref(new Map())
const preApprovalMarkRefreshKey = ref(0)

function markedAsApprovedOrRejected(travelAuthorizationPreApprovalId) {
  return markedTravelAuthorizationPreApprovalMaps.value.has(travelAuthorizationPreApprovalId)
}

function markAsApproved(travelAuthorizationPreApprovalId) {
  markedTravelAuthorizationPreApprovalMaps.value.set(
    travelAuthorizationPreApprovalId,
    TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.APPROVED
  )
  showAlert.value = false
  preApprovalMarkRefreshKey.value += 1
}

function markAsRejected(travelAuthorizationPreApprovalId) {
  markedTravelAuthorizationPreApprovalMaps.value.set(
    travelAuthorizationPreApprovalId,
    TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.DECLINED
  )
  showAlert.value = false
  preApprovalMarkRefreshKey.value += 1
}

function unmark(travelAuthorizationPreApprovalId) {
  markedTravelAuthorizationPreApprovalMaps.value.delete(travelAuthorizationPreApprovalId)
  showAlert.value = false
  preApprovalMarkRefreshKey.value += 1
}

const showAlert = ref(false)
const isSaving = ref(false)
const snack = useSnack()

/** @type {import('vue').Ref<InstanceType<typeof HeaderActionsFormCard> | null>} */
const headerActionsFormCard = ref(null)

const travelAuthorizationPreApprovalsQuery = computed(() => ({
  where: travelAuthorizationPreApprovalsWhere.value,
  perPage: 1, // We only want the total count, not the actual records.
}))
const { totalCount: totalTravelAuthorizationPreApprovalsTotalCount } =
  useTravelAuthorizationPreApprovals(travelAuthorizationPreApprovalsQuery)

const everyTravelAuthorizationPreApprovalMarked = ref(false)

watch(
  () => preApprovalMarkRefreshKey.value,
  () => {
    everyTravelAuthorizationPreApprovalMarked.value =
      markedTravelAuthorizationPreApprovalMaps.value.size ===
      totalTravelAuthorizationPreApprovalsTotalCount.value
  }
)

async function approve() {
  if (headerActionsFormCard.value === null) return
  if (!headerActionsFormCard.value.validate()) return

  if (!everyTravelAuthorizationPreApprovalMarked.value) {
    showAlert.value = true
    return
  }

  isSaving.value = true

  const preApprovalsAttributes = Array.from(
    markedTravelAuthorizationPreApprovalMaps.value.entries().map(([id, status]) => ({ id, status }))
  )

  const data = {
    status: TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES.FINISHED,
    preApprovalsAttributes,
    documentsAttributes: [
      {
        approvalDocument: approvalDocument.value,
        approvalDocumentApprovedOn: approvalDocumentApprovedOn.value,
        approvalDocumentApproverName: approvalDocumentApproverName.value,
      },
    ],
  }
  const formData = serialize(data, {
    indices: true,
  })

  try {
    await travelAuthorizationPreApprovalSubmissionsApi.approve(
      travelAuthorizationPreApprovalSubmissionId.value,
      formData
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
  approvalDocumentApproverName.value = null
  approvalDocumentApprovedOn.value = null
  approvalDocument.value = null
  markedTravelAuthorizationPreApprovalMaps.value.clear()
  preApprovalMarkRefreshKey.value = 0
  showAlert.value = false
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
