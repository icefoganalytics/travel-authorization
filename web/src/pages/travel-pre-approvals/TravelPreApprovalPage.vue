<template>
  <v-skeleton-loader
    v-if="isNil(travelAuthorizationPreApproval)"
    type="card"
  />
  <HeaderActionsCard
    v-else
    title="Travel Pre-Approval"
    header-tag="h2"
    header-class="mb-0"
  >
    <template
      v-if="canEdit"
      #header-actions
    >
      <v-btn
        class="my-0"
        color="error"
        variant="outlined"
        :loading="isDeleting"
        @click="deleteTravelAuthorizationPreApproval"
      >
        Delete
      </v-btn>
    </template>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <DescriptionElement
          label="Purpose"
          :value="travelAuthorizationPreApproval.purpose"
          vertical
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <DescriptionElement
          label="Location"
          :value="travelAuthorizationPreApproval.location"
          vertical
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="4"
      >
        <DescriptionElement
          label="Estimated Cost ($)"
          :value="travelAuthorizationPreApproval.cost || 'cost not specified'"
          vertical
        />
      </v-col>
      <template v-if="!travelAuthorizationPreApproval.unknownDate">
        <v-col
          cols="12"
          md="4"
        >
          <DescriptionElement
            label="Start Date"
            :value="travelAuthorizationPreApproval.startDate"
            vertical
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <DescriptionElement
            label="End Date"
            :value="travelAuthorizationPreApproval.endDate"
            vertical
          />
        </v-col>
      </template>
      <template v-else>
        <v-col
          cols="12"
          md="3"
        >
          <DescriptionElement
            label="Exact Date Unknown"
            :value="travelAuthorizationPreApproval.unknownDate ? 'Yes' : 'No'"
            vertical
          />
        </v-col>
        <v-col
          cols="12"
          md="3"
        >
          <DescriptionElement
            label="Anticipated Month"
            :value="travelAuthorizationPreApproval.anticipatedMonth"
            vertical
          />
        </v-col>
      </template>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="8"
      >
        <DescriptionElement
          label="Reason"
          :value="travelAuthorizationPreApproval.reason"
          vertical
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card>
          <v-card-title>
            <h3 class="mb-0">Traveller Details</h3>
          </v-card-title>
          <v-divider />
          <v-card-text>
            <v-row>
              <v-col
                cols="12"
                md="6"
              >
                <DescriptionElement
                  label="Department"
                  :value="travelAuthorizationPreApproval.department"
                  vertical
                />
              </v-col>
              <v-col
                cols="12"
                md="6"
              >
                <DescriptionElement
                  label="Branch"
                  :value="travelAuthorizationPreApproval.branch"
                  vertical
                />
              </v-col>
            </v-row>

            <v-row v-if="travelAuthorizationPreApproval.undefinedTraveller">
              <v-col
                cols="12"
                md="1"
              />
              <v-col
                cols="12"
                md="3"
              >
                <DescriptionElement
                  label="Exact Traveler Not Known"
                  :value="travelAuthorizationPreApproval.undefinedTraveller ? 'Yes' : 'No'"
                  vertical
                />
              </v-col>
              <v-col
                cols="12"
                md="4"
              >
                <DescriptionElement
                  label="Number of Travellers"
                  :value="travelAuthorizationPreApproval.profilesNum"
                  vertical
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col
                cols="12"
                md="9"
              >
                <TravelAuthorizationPreApprovalProfilesDataTable
                  :where="preApprovalProfileWhere"
                  route-query-suffix="Profile"
                />
              </v-col>
            </v-row>

            <v-row>
              <v-col
                cols="12"
                md="12"
              >
                <DescriptionElement
                  label="Traveller Notes"
                  :value="travelAuthorizationPreApproval.travelerNotes"
                  vertical
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-skeleton-loader
      v-if="isNil(preApprovalSubmissionId) && isNil(travelAuthorizationPreApproval)"
      type="card"
    />
    <template v-else-if="isNil(preApprovalSubmissionId)">
      <!-- No submission is present -->
    </template>
    <TravelAuthorizationPreApprovalSubmissionCard
      v-else
      :travel-authorization-pre-approval-submission-id="preApprovalSubmissionId"
    />

    <template #actions>
      <v-btn
        v-if="canEdit"
        color="primary"
        :to="{
          name: 'travel-pre-approvals/TravelPreApprovalEditPage',
          params: {
            travelAuthorizationPreApprovalId,
          },
        }"
      >
        Edit
      </v-btn>
      <v-btn
        color="secondary"
        :to="{
          name: 'travel-pre-approvals/TravelPreApprovalRequestsPage',
        }"
      >
        Return
      </v-btn>
    </template>
  </HeaderActionsCard>
</template>

<script setup>
import { computed, ref, toRefs } from "vue"
import { useRouter } from "vue2-helpers/vue-router"
import { isNil } from "lodash"

import blockedToTrueConfirm from "@/utils/blocked-to-true-confirm"
import travelAuthorizationPreApprovalApi, {
  TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES,
} from "@/api/travel-authorization-pre-approvals-api"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useSnack from "@/use/use-snack"
import useTravelAuthorizationPreApproval from "@/use/use-travel-authorization-pre-approval"

import DescriptionElement from "@/components/common/DescriptionElement.vue"
import HeaderActionsCard from "@/components/common/HeaderActionsCard.vue"

import TravelAuthorizationPreApprovalProfilesDataTable from "@/components/travel-authorization-pre-approval-profiles/TravelAuthorizationPreApprovalProfilesDataTable.vue"
import TravelAuthorizationPreApprovalSubmissionCard from "@/components/travel-authorization-pre-approval-submissions/TravelAuthorizationPreApprovalSubmissionCard.vue"

const props = defineProps({
  travelAuthorizationPreApprovalId: {
    type: [String, Number],
    required: true,
  },
})

const { travelAuthorizationPreApprovalId } = toRefs(props)
const { travelAuthorizationPreApproval } = useTravelAuthorizationPreApproval(
  travelAuthorizationPreApprovalId
)

// TODO: replace with policy.update?
const canEdit = computed(
  () =>
    travelAuthorizationPreApproval.value?.status ===
    TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.DRAFT
)

const preApprovalProfileWhere = computed(() => ({
  preApprovalId: props.travelAuthorizationPreApprovalId,
}))

const preApprovalSubmissionId = computed(() => travelAuthorizationPreApproval.value?.submissionId)

const isDeleting = ref(false)
const snack = useSnack()
const router = useRouter()

async function deleteTravelAuthorizationPreApproval() {
  if (!blockedToTrueConfirm("Are you sure you want to remove this travel pre-approval?")) return

  isDeleting.value = true
  try {
    await travelAuthorizationPreApprovalApi.delete(travelAuthorizationPreApprovalId.value)
    snack.success("Travel pre-approval deleted.")
    return router.push({
      name: "travel-pre-approvals/TravelPreApprovalRequestsPage",
    })
  } catch (error) {
    console.error(`Failed to delete travel authorization pre-approval: ${error}`)
    snack.error(`Failed to delete travel pre-approval: ${error}`)
  } finally {
    isDeleting.value = false
  }
}

useBreadcrumbs([
  {
    text: "Travel Pre-Approvals",
    to: {
      name: "travel-pre-approvals/TravelPreApprovalRequestsPage",
    },
  },
  {
    text: "Travel Pre-Approval",
    to: {
      name: "travel-pre-approvals/TravelPreApprovalPage",
      params: {
        travelAuthorizationPreApprovalId: props.travelAuthorizationPreApprovalId,
      },
    },
  },
])
</script>

<style scoped></style>
