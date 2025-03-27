<template>
  <v-dialog
    v-model="showSubmissionDialog"
    persistent
    max-width="950px"
  >
    <template #activator="{ on, attrs }">
      <v-btn
        color="primary"
        v-bind="merge({}, attrs, activatorProps)"
        v-on="on"
        @click="extractTravelRequests"
      >
        Submit Selected Requests
      </v-btn>
    </template>

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
            :items="submittingRequests"
            :items-per-page="5"
            hide-default-footer
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
            <template #item.actions="{ item }">
              <v-btn
                color="transparent"
                class="px-1"
                small
                @click="removeTravel(item)"
              >
                <v-icon color="red">mdi-delete</v-icon>
              </v-btn>
            </template>
          </v-data-table>
        </v-col>
      </v-row>

      <template #actions>
        <v-btn
          color="warning"
          outlined
          @click="showSubmissionDialog = false"
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
import { cloneDeep, merge } from "lodash"

import http from "@/api/http-client"
import { PREAPPROVED_URL } from "@/urls"
import { TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES } from "@/api/travel-authorization-pre-approvals-api"
import useRouteQuery, { booleanTransformer } from "@/use/utils/use-route-query"

import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"

const props = defineProps({
  selectedRequests: {
    type: Array,
    default: () => [],
  },
  activatorProps: {
    type: Object,
    default: () => ({}),
  },
})

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

const showSubmissionDialog = useRouteQuery("showSubmissionDialog", false, {
  transform: booleanTransformer,
})

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

const submittingRequests = ref([])
const newSelectedRequests = ref([])
const addTravelDialog = ref(false)
const isSubmitting = ref(false)

const remainingTravelRequests = computed(() => {
  const currentIDs = submittingRequests.value.map((req) => req.id)
  const currentDept = submittingRequests.value[0]?.department
  return props.travelRequests?.filter(
    (req) =>
      !currentIDs.includes(req.id) &&
      (req.status == null || req.status === TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.DRAFT) &&
      (req.department == currentDept || currentIDs.length == 0)
  )
})

function extractTravelRequests() {
  submittingRequests.value = cloneDeep(
    props.selectedRequests.filter(
      (request) =>
        request.status == null ||
        request.status === TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.DRAFT
    )
  )
}

function removeTravel(item) {
  submittingRequests.value = cloneDeep(
    submittingRequests.value.filter((request) => request.id != item.id)
  )
}

function openAddTravel() {
  newSelectedRequests.value = []
  addTravelDialog.value = true
}

function addTravel() {
  submittingRequests.value = [...submittingRequests.value, ...newSelectedRequests.value]
  addTravelDialog.value = false
}

async function submitTravelRequest(status) {
  const currentIDs = submittingRequests.value.map((req) => req.id)
  if (currentIDs.length > 0) {
    const currentDept = submittingRequests.value[0].department
    isSubmitting.value = true
    const body = {
      department: currentDept,
      status,
      submitter: "SYSTEM",
      preApprovalIds: currentIDs,
    }
    try {
      await http.post(`${PREAPPROVED_URL}/submissions/${props.submissionId}`, body)
      isSubmitting.value = false
      showSubmissionDialog.value = false
      emit("submitted")
    } catch (error) {
      isSubmitting.value = false
      console.log(error)
    }
  }
}
</script>

<style scoped>
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
