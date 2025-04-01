<template>
  <!-- TODO: consider making this a "page" instead of a dialog -->
  <v-dialog
    :value="showSubmissionDialog"
    persistent
    max-width="950px"
    @keydown.esc="hide"
    @input="hideIfFalse"
  >
    <HeaderActionsCard title="Submit Travel Pre-Approval Requests">
      <v-row>
        <v-col>
          <TravelAuthorizationPreApprovalsSimpleDataTable
            :where="travelAuthorizationPreApprovalsWhere"
            hide-default-footer
            show-actions-header
          >
            <template #item.actions="{ item }">
              <v-btn
                v-if="canDelete"
                title="Remove"
                color="error"
                icon
                small
                @click="removePreApprovalRequest(item.id)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </template>
          </TravelAuthorizationPreApprovalsSimpleDataTable>
        </v-col>
      </v-row>

      <template #actions>
        <v-btn
          color="warning"
          outlined
          @click="hide"
        >
          Cancel
        </v-btn>
        <v-spacer />
        <v-btn
          color="secondary"
          :loading="isSubmitting"
          @click="submitTravelRequest(TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES.DRAFT)"
        >
          Save Draft
        </v-btn>
        <v-btn
          class="ml-0 ml-md-5"
          color="primary"
          :loading="isSubmitting"
          @click="
            submitTravelRequest(TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES.SUBMITTED)
          "
        >
          Submit
        </v-btn>
      </template>
    </HeaderActionsCard>
  </v-dialog>
</template>

<script setup>
import { computed, ref } from "vue"
import { isEmpty, isNil } from "lodash"

import travelAuthorizationPreApprovalSubmissionsApi, {
  TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES,
} from "@/api/travel-authorization-pre-approval-submissions-api"

import useRouteQuery, { jsonTransformer } from "@/use/utils/use-route-query"
import useSnack from "@/use/use-snack"
import useTravelAuthorizationPreApprovals from "@/use/use-travel-authorization-pre-approvals"

import HeaderActionsCard from "@/components/common/HeaderActionsCard.vue"
import TravelAuthorizationPreApprovalsSimpleDataTable from "@/components/travel-authorization-pre-approvals/TravelAuthorizationPreApprovalsSimpleDataTable.vue"

const emit = defineEmits(["submitted"])

const travelAuthorizationPreApprovalIds = useRouteQuery("showSubmissionDialog", undefined, {
  transform: jsonTransformer,
})
const showSubmissionDialog = computed(() => !isNil(travelAuthorizationPreApprovalIds.value))

const travelAuthorizationPreApprovalsWhere = computed(() => {
  return {
    id: travelAuthorizationPreApprovalIds.value,
  }
})
const travelAuthorizationPreApprovalsQuery = computed(() => {
  return {
    where: travelAuthorizationPreApprovalsWhere.value,
    perPage: 1, // We only need one elemnt to determine department, and total count for UI rendering
  }
})
const { travelAuthorizationPreApprovals, totalCount } = useTravelAuthorizationPreApprovals(
  travelAuthorizationPreApprovalsQuery,
  {
    skipWatchIf: () =>
      isNil(travelAuthorizationPreApprovalIds.value) ||
      isEmpty(travelAuthorizationPreApprovalIds.value),
  }
)

const canDelete = computed(() => totalCount.value > 1)

function removePreApprovalRequest(travelAuthorizationPreApprovalId) {
  const newTravelAuthorizationPreApprovalIds = travelAuthorizationPreApprovalIds.value.filter(
    (id) => id !== travelAuthorizationPreApprovalId
  )
  travelAuthorizationPreApprovalIds.value = newTravelAuthorizationPreApprovalIds
}

const isSubmitting = ref(false)
const snack = useSnack()

async function submitTravelRequest(status) {
  isSubmitting.value = true

  const firstTravelAuthorizationPreApproval = travelAuthorizationPreApprovals.value[0]
  if (isNil(firstTravelAuthorizationPreApproval)) {
    throw new Error("No travel authorization pre-approvals found.")
  }
  const department = firstTravelAuthorizationPreApproval.department

  try {
    await travelAuthorizationPreApprovalSubmissionsApi.create({
      department,
      status,
      preApprovalIds: travelAuthorizationPreApprovalIds.value,
    })
    snack.success("Travel pre-approvals submitted successfully.")
    emit("submitted")
    hide()
  } catch (error) {
    console.log(`Failed to submit travel authorization pre-approvals: ${error}`, { error })
    snack.error(`Failed to submit travel pre-approvals: ${error}`)
  } finally {
    isSubmitting.value = false
  }
}

function show(newTravelAuthorizationPreApprovalIds) {
  travelAuthorizationPreApprovalIds.value = newTravelAuthorizationPreApprovalIds
}

function hide() {
  travelAuthorizationPreApprovalIds.value = undefined
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
