<template>
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
      <v-col>
        <TravelAuthorizationPreApprovalsSimpleDataTable
          ref="travelAuthorizationPreApprovalsSimpleDataTable"
          :where="travelAuthorizationPreApprovalsWhere"
          show-actions-header
        >
          <template #top>
            <v-row>
              <v-col class="d-flex justify-end">
                <v-btn
                  class="mt-0"
                  color="primary"
                  outlined
                  @click="showAddRequestDialog"
                >
                  Add Request
                  <TravelAuthorizationsPreApprovalSubmissionAddRequestDialog
                    ref="travelAuthorizationsPreApprovalSubmissionAddRequestDialog"
                    @added="refresh"
                  />
                </v-btn>
              </v-col>
            </v-row>
          </template>
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
                class="my-0 ml-3"
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
        @click="submitTravelAuthorizationPreApprovalSubmission"
      >
        Submit
      </v-btn>
    </template>
  </HeaderActionsFormCard>
</template>

<script setup>
import { computed, ref, toRefs } from "vue"
import { useRouter } from "vue2-helpers/vue-router"
import { isNil } from "lodash"

import blockedToTrueConfirm from "@/utils/blocked-to-true-confirm"

import { travelAuthorizationPreApprovalSubmissions } from "@/api"
import travelAuthorizationPreApprovalSubmissionApi from "@/api/travel-authorization-pre-approval-submissions-api"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useSnack from "@/use/use-snack"
import useTravelAuthorizationPreApprovals from "@/use/use-travel-authorization-pre-approvals"
import useTravelAuthorizationPreApprovalSubmission from "@/use/use-travel-authorization-pre-approval-submission"

import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"
import TravelAuthorizationPreApprovalsSimpleDataTable from "@/components/travel-authorization-pre-approvals/TravelAuthorizationPreApprovalsSimpleDataTable.vue"
import TravelAuthorizationsPreApprovalSubmissionAddRequestDialog from "@/components/travel-authorization-pre-approval-submissions/TravelAuthorizationsPreApprovalSubmissionAddRequestDialog.vue"

const props = defineProps({
  travelAuthorizationPreApprovalSubmissionId: {
    type: [String, Number],
    required: true,
  },
})

const { travelAuthorizationPreApprovalSubmissionId } = toRefs(props)
const { travelAuthorizationPreApprovalSubmission, isLoading } =
  useTravelAuthorizationPreApprovalSubmission(travelAuthorizationPreApprovalSubmissionId)

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
  totalCount: totalCountTravelAuthorizationPreApprovals,
  refresh: refreshTravelAuthorizationPreApprovals,
} = useTravelAuthorizationPreApprovals(travelAuthorizationPreApprovalsQuery)

const canDeleteTravelAuthorizationPreApprovals = computed(
  () => totalCountTravelAuthorizationPreApprovals.value > 1
)

/** @type {import("vue").Ref<InstanceType<typeof TravelAuthorizationsPreApprovalSubmissionAddRequestDialog> | null>} */
const travelAuthorizationsPreApprovalSubmissionAddRequestDialog = ref(null)

function showAddRequestDialog() {
  travelAuthorizationsPreApprovalSubmissionAddRequestDialog.value.show(
    props.travelAuthorizationPreApprovalSubmissionId
  )
}

async function removeTravelAuthorizationPreApprovalFromSubmission(
  travelAuthorizationPreApprovalSubmissionId,
  travelAuthorizationPreApprovalId
) {
  isLoading.value = true
  try {
    await travelAuthorizationPreApprovalSubmissions.preApprovalsApi.destroy(
      travelAuthorizationPreApprovalSubmissionId,
      travelAuthorizationPreApprovalId
    )
    snack.success("Travel pre-approval successfully removed from submission!")
    await refresh()
  } catch (error) {
    console.error(`Failed to remove travel authorization pre-approval from submission: ${error}`, {
      error,
    })
    snack.error(`Failed to remove travel pre-approval from submission: ${error}`)
  } finally {
    isLoading.value = false
  }
}

async function submitTravelAuthorizationPreApprovalSubmission() {
  if (
    !blockedToTrueConfirm("Are you sure you want to submit this travel pre-approval submission?")
  ) {
    return
  }

  isLoading.value = true
  try {
    await travelAuthorizationPreApprovalSubmissionApi.submit(
      props.travelAuthorizationPreApprovalSubmissionId
    )
    snack.success("Travel pre-approval submission submitted successfully")
    return router.replace({
      name: "travel-pre-approvals/TravelPreApprovalSubmissionsPage",
    })
  } catch (error) {
    console.error(`Failed to submit travel authorization pre-approval submission: ${error}`, {
      error,
    })
    snack.error(`Failed to submit travel pre-approval submission: ${error}`)
  } finally {
    isLoading.value = false
  }
}

const snack = useSnack()
const router = useRouter()

async function deleteTravelAuthorizationPreApprovalSubmission() {
  if (
    !blockedToTrueConfirm("Are you sure you want to remove this travel pre-approval submission?")
  ) {
    return
  }

  isLoading.value = true
  try {
    await travelAuthorizationPreApprovalSubmissionApi.delete(
      props.travelAuthorizationPreApprovalSubmissionId
    )
    snack.success("Travel pre-approval submission deleted successfully")
    return router.replace({
      name: "travel-pre-approvals/TravelPreApprovalSubmissionsPage",
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

/** @type {import("vue").Ref<InstanceType<typeof TravelAuthorizationPreApprovalsSimpleDataTable> | nul>} */
const travelAuthorizationPreApprovalsSimpleDataTable = ref(null)

async function refresh() {
  await refreshTravelAuthorizationPreApprovals()
  await travelAuthorizationPreApprovalsSimpleDataTable.value.refresh()
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
