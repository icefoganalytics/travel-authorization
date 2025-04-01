<template>
  <div>
    <v-skeleton-loader
      v-if="isNil(travelAuthorizationPreApprovalSubmission)"
      type="card"
    />
    <HeaderActionsFormCard
      v-else
      title="Edit Travel Pre-Approval Submission"
    >
      <template #header-actions>
        <v-btn
          class="my-0"
          color="error"
          :loading="isLoading"
          @click="deleteTravelAuthorizationPreApprovalSubmission"
        >
          Delete
        </v-btn>
      </template>
      <v-row>
        <v-col class="d-flex justify-end">
          <v-btn
            class="my-0"
            color="primary"
            @click="openAddTravel"
          >
            Add Request
          </v-btn>
        </v-col>
      </v-row>

      <v-row>
        <v-col>
          <TravelAuthorizationPreApprovalsSimpleDataTable
            :where="travelAuthorizationPreApprovalsWhere"
            show-actions-header
          >
            <template #item.actions="{ item }">
              <div class="d-flex align-center justify-center">
                <v-btn
                  class="my-0"
                  :to="{
                    name: 'travel-pre-approvals/TravelPreApprovalEditPage',
                    params: {
                      travelAuthorizationPreApprovalId: item.id,
                    },
                  }"
                  color="primary"
                  outlined
                  small
                >
                  Edit
                </v-btn>
                <v-btn
                  v-if="canDeleteTravelAuthorizationPreApprovals"
                  class="my-0"
                  title="Remove"
                  color="error"
                  outlined
                  small
                  @click="
                    removeTravelAuthorizationPreApprovalFromSubmission(
                      travelAuthorizationPreApprovalSubmissionId,
                      item.id
                    )
                  "
                >
                  Remove
                </v-btn>

                <!--
                  TODO: Move this to "add new pre-approval request", or drop entirely?
                  This seems like something that that should happen during search?
                  e.g. the ability to "merge" pre-approval submissions?
                  or during the pre-approval request search, you can change filter to include request that are in
                  other submissions, and when you click to "add" them it gives you a confirmation dialog at that time.
                -->
                <v-tooltip
                  top
                  color="amber accent-4"
                >
                  <template #activator="{ on }">
                    <v-icon
                      v-if="
                        item.submissionId !== parseInt(travelAuthorizationPreApprovalSubmissionId)
                      "
                      style="cursor: pointer"
                      class=""
                      color="amber accent-2"
                      v-on="on"
                      >mdi-alert</v-icon
                    >
                  </template>
                  <span class="black--text">
                    This request is already in another submission.<br />
                    If you Save/Submit this change, it will be removed from the other submission.
                  </span>
                </v-tooltip>
              </div>
            </template>
          </TravelAuthorizationPreApprovalsSimpleDataTable>
        </v-col>
      </v-row>

      <template #actions>
        <v-btn
          color="secondary"
          :to="{
            name: 'travel-pre-approvals/TravelPreApprovalSubmissionsPage',
          }"
        >
          Return
        </v-btn>
        <v-btn
          color="primary"
          :loading="isLoading"
          @click="submitTravelRequest(STATUSES.SUBMITTED)"
        >
          Submit
        </v-btn>
      </template>
    </HeaderActionsFormCard>

    <v-dialog
      v-model="addTravelDialog"
      persistent
      max-width="900px"
    >
      <v-card>
        <v-card-title
          class="primary"
          style="border-bottom: 1px solid black"
        >
          <div class="text-h5">Requests</div>
        </v-card-title>

        <v-card-text>
          <v-data-table
            v-model="newSelectedRequests"
            :headers="addTravelHeaders"
            :items="remainingTravelRequests"
            :items-per-page="5"
            class="elevation-1 mt-5"
            show-select
            single-select
          >
            <template #item.name="{ item }">
              <template v-if="item.profiles.length === 0"> Unspecified </template>
              <template v-else-if="item.profiles.length === 1">
                {{ item.profiles[0].profileName.replace(".", " ") }}
              </template>
              <v-tooltip
                v-else
                top
                color="primary"
              >
                <template #activator="{ on }">
                  <div v-on="on">
                    <span>
                      {{ item.profiles[0].profileName.replace(".", " ") }}
                    </span>
                    <span>, ... </span>
                  </div>
                </template>
                <span
                  ><div
                    v-for="(profile, index) in item.profiles"
                    :key="index"
                  >
                    {{ profile.profileName.replace(".", " ") }}
                  </div></span
                >
              </v-tooltip>
            </template>

            <template #item.travelDate="{ item }">
              <div v-if="item.isOpenForAnyDate">
                {{ item.month }}
              </div>
              <div v-else>
                <div>
                  <!-- eslint-disable-next-line vue/no-parsing-error -->
                  {{ item.startDate | beautifyDate }}
                  to
                </div>
                <div>
                  <!-- eslint-disable-next-line vue/no-parsing-error -->
                  {{ item.endDate | beautifyDate }}
                </div>
              </div>
            </template>

            <template #item.status="{ item }">
              <div v-if="item.submissionId != travelAuthorizationPreApprovalSubmissionId">
                {{ item.status }}
              </div>
            </template>
          </v-data-table>
        </v-card-text>

        <v-card-actions>
          <v-btn
            color="grey darken-5"
            @click="addTravelDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            class="ml-auto"
            color="green darken-1"
            @click="addTravel"
          >
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { computed, ref, toRefs, watch } from "vue"
import { useRouter } from "vue2-helpers/vue-router"
import { cloneDeep, isNil } from "lodash"

import blockedToTrueConfirm from "@/utils/blocked-to-true-confirm"

import http from "@/api/http-client"
import { PREAPPROVED_URL } from "@/urls"

import { travelAuthorizationPreApprovalSubmissions } from "@/api"
import travelAuthorizationPreApprovalSubmissionApi from "@/api/travel-authorization-pre-approval-submissions-api"
import { TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES } from "@/api/travel-authorization-pre-approvals-api"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useSnack from "@/use/use-snack"
import useTravelAuthorizationPreApprovals from "@/use/use-travel-authorization-pre-approvals"
import useTravelAuthorizationPreApprovalSubmission from "@/use/use-travel-authorization-pre-approval-submission"

import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"
import TravelAuthorizationPreApprovalsSimpleDataTable from "@/components/travel-authorization-pre-approvals/TravelAuthorizationPreApprovalsSimpleDataTable.vue"

const props = defineProps({
  travelAuthorizationPreApprovalSubmissionId: {
    type: [String, Number],
    required: true,
  },
})

const { travelAuthorizationPreApprovalSubmissionId } = toRefs(props)
const { travelAuthorizationPreApprovalSubmission, isLoading } =
  useTravelAuthorizationPreApprovalSubmission(travelAuthorizationPreApprovalSubmissionId)

const { travelAuthorizationPreApprovals: travelRequests } = useTravelAuthorizationPreApprovals()

const travelAuthorizationPreApprovalsWhere = computed(() => {
  return {
    submissionId: props.travelAuthorizationPreApprovalSubmissionId,
  }
})
const travelAuthorizationPreApprovalsQuery = computed(() => {
  return {
    where: travelAuthorizationPreApprovalsWhere.value,
  }
})
const {
  travelAuthorizationPreApprovals: selectedRequests,
  totalCount: totalCountTravelAuthorizationPreApprovals,
} = useTravelAuthorizationPreApprovals(travelAuthorizationPreApprovalsQuery)

const canDeleteTravelAuthorizationPreApprovals = computed(
  () => totalCountTravelAuthorizationPreApprovals.value > 1
)

const submittingRequests = ref([])

watch(
  () => selectedRequests.value,
  (newSelectedRequests) => {
    submittingRequests.value = cloneDeep(newSelectedRequests)
  },
  { deep: true, immediate: true }
)

const addTravelHeaders = ref([
  {
    text: "Name",
    value: "name",
  },
  {
    text: "Department",
    value: "department",
  },
  {
    text: "Branch",
    value: "branch",
  },

  {
    text: "Location",
    value: "location",
  },
  {
    text: "Purpose Type",
    value: "purpose",
  },
  // { text: 'Reason',       value: 'reason',      class: 'blue-grey lighten-4' },
  {
    text: "Status",
    value: "status",
    cellClass: "text-h6 red--text",
  },
])
const submitTravelDialog = ref(false)
const newSelectedRequests = ref([])
const addTravelDialog = ref(false)

const STATUSES = computed(() => TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES)
const remainingTravelRequests = computed(() => {
  const currentIDs = submittingRequests.value.map((req) => req.id)
  const currentDept = submittingRequests.value[0]?.department
  return travelRequests.value?.filter(
    (req) =>
      !currentIDs.includes(req.id) &&
      (req.status == null || req.status === TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.DRAFT) &&
      (req.department == currentDept || currentIDs.length == 0)
  )
})

async function removeTravelAuthorizationPreApprovalFromSubmission(
  travelAuthorizationPreApprovalSubmissionId,
  travelAuthorizationPreApprovalId
) {
  isLoading.value = true
  try {
    await travelAuthorizationPreApprovalSubmissions.preApprovalsApi.delete(
      travelAuthorizationPreApprovalSubmissionId,
      travelAuthorizationPreApprovalId
    )
    snack.success("Travel pre-approval removed from submission successfully")
  } catch (error) {
    console.error(`Failed to remove travel authorization pre-approval from submission: ${error}`, {
      error,
    })
    snack.error(`Failed to remove travel pre-approval from submission: ${error}`)
  } finally {
    isLoading.value = false
  }
}

function openAddTravel() {
  newSelectedRequests.value = []
  addTravelDialog.value = true
}

function addTravel() {
  submittingRequests.value = [...submittingRequests.value, ...newSelectedRequests.value]
  addTravelDialog.value = false
}

function submitTravelRequest(status) {
  const currentIDs = submittingRequests.value.map((req) => req.id)
  if (currentIDs.length > 0) {
    const currentDept = submittingRequests.value[0].department
    isLoading.value = true
    const body = {
      department: currentDept,
      status,
      submitter: "SYSTEM",
      preApprovalIds: currentIDs,
    }
    // console.log(body)
    return http
      .post(
        `${PREAPPROVED_URL}/submissions/${props.travelAuthorizationPreApprovalSubmissionId}`,
        body
      )
      .then(() => {
        isLoading.value = false
        submitTravelDialog.value = false
        return router.replace({
          name: "travel-pre-approval-submissions/TravelPreApprovalSubmissionPage",
          params: {
            travelAuthorizationPreApprovalSubmissionId:
              props.travelAuthorizationPreApprovalSubmissionId,
          },
        })
      })
      .catch((e) => {
        isLoading.value = false
        console.log(e)
      })
  }
}

const snack = useSnack()
const router = useRouter()

async function deleteTravelAuthorizationPreApprovalSubmission() {
  if (!blockedToTrueConfirm("Are you sure you want to remove this travel pre-approval submission?"))
    return

  isLoading.value = true
  try {
    await travelAuthorizationPreApprovalSubmissionApi.delete(
      props.travelAuthorizationPreApprovalSubmissionId
    )
    snack.success("Travel pre-approval submission deleted successfully")
    return router.replace({
      name: "travel-pre-approval-submissions/TravelPreApprovalSubmissionsPage",
    })
  } catch (error) {
    console.log(`Failed to delete travel authorization pre-approval submission: ${error}`, {
      error,
    })
    snack.error(`Failed to delete travel pre-approval submission: ${error}`)
  } finally {
    isLoading.value = false
  }
}

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
  {
    text: "Edit",
    to: {
      name: "travel-pre-approval-submissions/TravelPreApprovalSubmissionEditPage",
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
