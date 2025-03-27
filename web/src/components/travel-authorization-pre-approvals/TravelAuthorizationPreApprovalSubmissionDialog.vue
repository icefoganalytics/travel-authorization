<template>
  <v-dialog
    :value="showSubmissionDialog"
    persistent
    max-width="950px"
    @keydown.esc="hide"
    @input="hideIfFalse"
  >
    <HeaderActionsFormCard
      ref="headerActionsFormCard"
      title="Submit Travel Pre-Approval Requests"
      @submit.prevent="submitTravelRequest(TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.SUBMITTED)"
    >
      <v-row>
        <v-col class="d-flex justify-end">
          <v-btn
            class="my-0"
            color="primary"
            @click="openAddTravel"
          >
            Add Request
          </v-btn>

          <!-- TODO: replace with search? -->
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
                    <div v-if="item.submissionId != submissionId">
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
        </v-col>
      </v-row>

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
          </v-data-table>
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
          @click="submitTravelRequest(TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.DRAFT)"
        >
          Save Draft
        </v-btn>
        <v-btn
          class="ml-0 ml-md-5"
          color="primary"
          :loading="isSubmitting"
          type="submit"
        >
          Submit
        </v-btn>
      </template>
    </HeaderActionsFormCard>
  </v-dialog>
</template>

<script setup>
import { computed, ref } from "vue"
import { isEmpty, isNil } from "lodash"

import http from "@/api/http-client"
import { PREAPPROVED_URL } from "@/urls"
import { TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES } from "@/api/travel-authorization-pre-approvals-api"
import useRouteQuery, { jsonTransformer } from "@/use/utils/use-route-query"
import useTravelAuthorizationPreApprovals from "@/use/use-travel-authorization-pre-approvals"

import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"
import VTravelAuthorizationPreApprovalProfilesChip from "@/components/travel-authorization-pre-approvals/VTravelAuthorizationPreApprovalProfilesChip.vue"

const emit = defineEmits(["submitted"])

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
  {
    text: "Actions",
    sortable: false,
    value: "actions",
  },
])

const travelAuthorizationPreApprovalIds = useRouteQuery("showSubmissionDialog", undefined, {
  transform: jsonTransformer,
})
const showSubmissionDialog = computed(() => !isNil(travelAuthorizationPreApprovalIds.value))

const travelAuthorizationPreApprovalsQuery = computed(() => {
  return {
    where: {
      id: travelAuthorizationPreApprovalIds.value,
    },
  }
})
const { travelAuthorizationPreApprovals } = useTravelAuthorizationPreApprovals(
  travelAuthorizationPreApprovalsQuery,
  {
    skipWatchIf: () =>
      isNil(travelAuthorizationPreApprovalIds.value) ||
      isEmpty(travelAuthorizationPreApprovalIds.value),
  }
)

const canDelete = computed(() => travelAuthorizationPreApprovals.value.length > 1)

const addTravelHeaders = ref([
  {
    text: "Name",
    value: "name",
    class: "blue-grey lighten-4",
  },
  {
    text: "Department",
    value: "department",
    class: "blue-grey lighten-4",
  },
  {
    text: "Branch",
    value: "branch",
    class: "blue-grey lighten-4",
  },

  {
    text: "Location",
    value: "location",
    class: "blue-grey lighten-4",
  },
  {
    text: "Purpose Type",
    value: "purpose",
    class: "blue-grey lighten-4",
  },
  // { text: 'Reason',       value: 'reason',      class: 'blue-grey lighten-4' },
  {
    text: "Status",
    value: "status",
    class: "blue-grey lighten-4",
    cellClass: "text-h6 red--text",
  },
])

const newSelectedRequests = ref([])
const addTravelDialog = ref(false)
const isSubmitting = ref(false)

const remainingTravelRequests = computed(() => {
  const currentIDs = travelAuthorizationPreApprovals.value.map((req) => req.id)
  const currentDept = travelAuthorizationPreApprovals.value[0]?.department
  return travelAuthorizationPreApprovals.value.filter(
    (req) =>
      !currentIDs.includes(req.id) &&
      (req.status == null || req.status === TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.DRAFT) &&
      (req.department == currentDept || currentIDs.length == 0)
  )
})

function removePreApprovalRequest(travelAuthorizationPreApprovalId) {
  const newTravelAuthorizationPreApprovalIds = travelAuthorizationPreApprovalIds.value.filter(
    (id) => id !== travelAuthorizationPreApprovalId
  )
  travelAuthorizationPreApprovalIds.value = newTravelAuthorizationPreApprovalIds
}

function openAddTravel() {
  newSelectedRequests.value = []
  addTravelDialog.value = true
}

function addTravel() {
  travelAuthorizationPreApprovals.value = [
    ...travelAuthorizationPreApprovals.value,
    ...newSelectedRequests.value,
  ]
  addTravelDialog.value = false
}

async function submitTravelRequest(status) {
  const currentIDs = travelAuthorizationPreApprovals.value.map((req) => req.id)
  if (currentIDs.length > 0) {
    const currentDept = travelAuthorizationPreApprovals.value[0].department
    isSubmitting.value = true
    const body = {
      department: currentDept,
      status,
      submitter: "SYSTEM",
      preApprovalIds: currentIDs,
    }
    try {
      // TODO: switch to standard create/read/update/delete API.
      await http.post(`${PREAPPROVED_URL}/submissions/0`, body)
      hide()
      emit("submitted")
    } catch (error) {
      isSubmitting.value = false
      console.log(error)
    }
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
