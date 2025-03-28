<template>
  <v-skeleton-loader
    v-if="isNil(travelAuthorizationPreApprovalSubmission)"
    type="card"
  />
  <HeaderActionsCard
    v-else
    title="Submit Travel Pre-Approval Requests"
  >
    <v-row>
      <v-col>
        <DescriptionElement label="Creator">
          <UserChip :user-id="travelAuthorizationPreApprovalSubmission.creatorId" />
        </DescriptionElement>
      </v-col>
    </v-row>
    <TravelAuthorizationPreApprovalSubmissionCard
      v-if="isApprovedOrDeclined"
      :travel-authorization-pre-approval-submission-id="travelAuthorizationPreApprovalSubmissionId"
    />
    <v-row>
      <v-col>
        <!-- TODO: move to component? -->
        <v-data-table
          :headers="headers"
          :items="travelAuthorizationPreApprovals"
          :items-per-page="5"
          hide-default-footer
        >
          <template #item.name="{ item }">
            <VTravelAuthorizationPreApprovalProfilesChip
              :travel-authorization-pre-approval="item"
            />
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </HeaderActionsCard>
</template>

<script setup>
import { computed, ref, toRefs } from "vue"
import { isNil } from "lodash"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useTravelAuthorizationPreApprovalSubmission, {
  TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES,
} from "@/use/use-travel-authorization-pre-approval-submission"

import DescriptionElement from "@/components/common/DescriptionElement.vue"
import HeaderActionsCard from "@/components/common/HeaderActionsCard.vue"
import UserChip from "@/components/users/UserChip.vue"
import VTravelAuthorizationPreApprovalProfilesChip from "@/components/travel-authorization-pre-approvals/VTravelAuthorizationPreApprovalProfilesChip.vue"
import TravelAuthorizationPreApprovalSubmissionCard from "@/components/travel-authorization-pre-approval-submissions/TravelAuthorizationPreApprovalSubmissionCard.vue"

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
const travelAuthorizationPreApprovals = computed(() => {
  return travelAuthorizationPreApprovalSubmission.value?.preApprovals ?? []
})

const isApprovedOrDeclined = computed(() => {
  return (
    travelAuthorizationPreApprovalSubmission.value?.status ===
      TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES.APPROVED ||
    travelAuthorizationPreApprovalSubmission.value?.status ===
      TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES.DECLINED
  )
})
const headers = ref([
  {
    text: "Name",
    value: "name",
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
])

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
