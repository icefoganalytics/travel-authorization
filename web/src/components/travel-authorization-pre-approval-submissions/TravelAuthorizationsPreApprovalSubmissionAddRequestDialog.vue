<template>
  <!-- TODO: consider if this should be an expansion panel instead of a dialog? -->
  <v-dialog
    v-model="showDialog"
    persistent
    max-width="950px"
    @keydown.esc="hide"
    @input="hideIfFalse"
  >
    <HeaderActionsCard
      ref="headerActionsCard"
      title="Add Request"
      lazy-validation
    >
      <v-row>
        <v-col>
          <TravelAuthorizationPreApprovalsSimpleDataTable
            :filters="travelAuthorizationPreApprovalsFilters"
            show-actions-header
            :hide-default-footer="false"
            route-query-suffix="Request"
            no-data-text="No travel pre-approvals requests available to be added"
          >
            <template #item.name="{ item }">
              <VTravelAuthorizationPreApprovalProfilesChip
                :travel-authorization-pre-approval="item"
              />
            </template>

            <template #item.actions="{ item }">
              <v-btn
                class="my-0"
                color="success"
                @click="
                  addTravelAuthorizationPreApprovalToSubmission(
                    travelAuthorizationPreApprovalSubmissionId,
                    item.id
                  )
                "
              >
                Add
              </v-btn>

              <!--
                TODO: Drop entirely?
                This seems like something that that should happen during search?
                e.g. the ability to "merge" pre-approval submissions?
                or during the pre-approval request search, you can change filter to include request that are in
                other submissions, and when you click to "add" them it gives you a confirmation dialog at that time.
              -->
              <!-- <v-tooltip
                top
                color="warning"
              >
                <template #activator="{ on }">
                  <v-icon
                    v-if="!isNil(item.submissionId)"
                    style="cursor: pointer"
                    color="warning"
                    v-on="on"
                    >mdi-alert</v-icon
                  >
                </template>
                <span class="black--text">
                  This request is already in another submission.<br />
                  If you Save/Submit this change, it will be removed from the other submission.
                </span>
              </v-tooltip> -->
            </template>
          </TravelAuthorizationPreApprovalsSimpleDataTable>
        </v-col>
      </v-row>

      <template #actions>
        <v-btn
          :loading="isSaving"
          color="primary"
          outlined
          @click="hide"
        >
          Return
        </v-btn>
      </template>
    </HeaderActionsCard>
  </v-dialog>
</template>

<script setup>
import { computed, ref } from "vue"
import { isNil } from "lodash"

import useRouteQuery, { jsonTransformer } from "@/use/utils/use-route-query"

import { travelAuthorizationPreApprovalSubmissions } from "@/api"

import useSnack from "@/use/use-snack"

import HeaderActionsCard from "@/components/common/HeaderActionsCard.vue"
import VTravelAuthorizationPreApprovalProfilesChip from "@/components/travel-authorization-pre-approvals/VTravelAuthorizationPreApprovalProfilesChip.vue"
import TravelAuthorizationPreApprovalsSimpleDataTable from "@/components/travel-authorization-pre-approvals/TravelAuthorizationPreApprovalsSimpleDataTable.vue"

const emit = defineEmits(["added"])

const travelAuthorizationPreApprovalSubmissionId = useRouteQuery(
  "showAddRequestDialog",
  undefined,
  {
    transform: jsonTransformer,
  }
)
const showDialog = computed(() => !isNil(travelAuthorizationPreApprovalSubmissionId.value))

const travelAuthorizationPreApprovalsFilters = computed(() => ({
  availableForSubmission: true,
}))

const isSaving = ref(false)
const snack = useSnack()

/** @type {import('vue').Ref<InstanceType<typeof HeaderActionsCard> | null>} */
const headerActionsCard = ref(null)

async function addTravelAuthorizationPreApprovalToSubmission(
  travelAuthorizationPreApprovalSubmissionId,
  travelAuthorizationPreApprovalId
) {
  if (headerActionsCard.value === null) return

  isSaving.value = true

  try {
    await travelAuthorizationPreApprovalSubmissions.preApprovalsApi.create(
      travelAuthorizationPreApprovalSubmissionId,
      {
        id: travelAuthorizationPreApprovalId,
      }
    )
    snack.success("Travel pre-approval request successfully added to submission.")
    emit("added", travelAuthorizationPreApprovalId)
    hide()
  } catch (error) {
    console.error(`Error adding travel authorization pre-approval to submission: ${error}`, {
      error,
    })
    snack.error(`Failed to add travel pre-approval request to submission: ${error}`)
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
