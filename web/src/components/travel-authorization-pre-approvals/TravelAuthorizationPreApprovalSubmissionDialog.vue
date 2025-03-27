<template>
  <div>
    <v-dialog
      v-model="submitTravelDialog"
      persistent
      max-width="950px"
    >
      <template #activator="{ on, attrs }">
        <v-btn
          :id="'edit-' + submissionId"
          :disabled="disabled"
          :small="editButton"
          :class="editButton ? 'my-0' : 'mr-5 my-7'"
          color="primary"
          v-bind="attrs"
          @click="extractTravelRequests"
          v-on="on"
        >
          {{ buttonName }}
        </v-btn>
      </template>

      <v-card :key="update">
        <v-card-title style="border-bottom: 1px solid black">
          <div class="text-h5">Submit/Draft Travel Request</div>
        </v-card-title>

        <v-card-text>
          <v-row class="mt-3">
            <v-btn
              class="ml-auto mr-5"
              color="primary"
              @click="openAddTravel"
            >
              Add Request
            </v-btn>
          </v-row>
          <v-data-table
            style="margin-top: 1rem"
            :headers="headers"
            :items="submittingRequests"
            :items-per-page="5"
            class="elevation-1"
            hide-default-footer
          >
            <template #item.remove="{ item }">
              <v-btn
                style="min-width: 0"
                color="transparent"
                class="px-1"
                small
                @click="removeTravel(item)"
              >
                <v-icon color="red">mdi-delete</v-icon>
              </v-btn>
            </template>
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
            <template #item.status="{ item }">
              <v-tooltip
                top
                color="amber accent-4"
              >
                <template #activator="{ on }">
                  <v-icon
                    v-if="item.status && item.sumssionId != submissionId"
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
            </template>
            <template #item.edit="{ item }">
              <NewTravelRequest
                :travel-request="item"
                type="Edit"
                @updateTable="updateAndOpenDialog"
              />
            </template>
          </v-data-table>
        </v-card-text>

        <v-card-actions>
          <v-btn
            color="grey darken-5"
            @click="submitTravelDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            v-if="editButton"
            color="red darken-5"
            @click="deleteSubmission()"
          >
            Delete
          </v-btn>
          <v-btn
            class="ml-auto"
            color="lime darken-1"
            :loading="savingData"
            @click="submitTravelRequest(TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.DRAFT)"
          >
            Save Draft
          </v-btn>
          <v-btn
            class="ml-5"
            color="green darken-1"
            :loading="savingData"
            @click="submitTravelRequest(TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.SUBMITTED)"
          >
            Submit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
  </div>
</template>

<script setup>
import { computed, ref } from "vue"
import { useStore } from "vue2-helpers/vuex"
import { cloneDeep } from "lodash"

import http from "@/api/http-client"
import { PREAPPROVED_URL } from "@/urls"
import { TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES } from "@/api/travel-authorization-pre-approvals-api"

import NewTravelRequest from "@/modules/preapproved/views/Requests/NewTravelRequest.vue"

const props = defineProps({
  buttonName: {
    type: String,
    default: "Submit Travel",
  },
  editButton: {
    type: Boolean,
    default: false,
  },
  submissionId: {
    type: Number,
    default: 0,
  },
  travelRequests: {
    type: Array,
    default: () => [],
  },
  selectedRequests: {
    type: Array,
    default: () => [],
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(["updateTable"])

const headers = ref([
  {
    text: "Name",
    value: "name",
    class: "blue-grey lighten-4",
  },
  {
    text: "Branch",
    value: "branch",
    class: "blue-grey lighten-4",
  },
  {
    text: "Reason",
    value: "reason",
    class: "blue-grey lighten-4",
  },
  {
    text: "Location",
    value: "location",
    class: "blue-grey lighten-4",
  },
  {
    text: "",
    sortable: false,
    value: "status",
    class: "blue-grey lighten-4",
    cellClass: "px-0 mx-0",
    width: "1rem",
  },
  {
    text: "",
    sortable: false,
    value: "remove",
    class: "blue-grey lighten-4",
    cellClass: "px-0 mx-0",
    width: "1rem",
  },
  {
    text: "",
    sortable: false,
    value: "edit",
    class: "blue-grey lighten-4",
    cellClass: "px-0 mx-0",
    width: "1rem",
  },
])

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
const submitTravelDialog = ref(false)
const newSelectedRequests = ref([])
const addTravelDialog = ref(false)
const savingData = ref(false)
const update = ref(0)

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
  update.value++
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
    savingData.value = true
    const body = {
      department: currentDept,
      status,
      submitter: "SYSTEM",
      preApprovalIds: currentIDs,
    }
    try {
      await http.post(`${PREAPPROVED_URL}/submissions/${props.submissionId}`, body)
      savingData.value = false
      submitTravelDialog.value = false
      emit("updateTable")
    } catch (error) {
      savingData.value = false
      console.log(error)
    }
  }
}

async function deleteSubmission() {
  try {
    await http.delete(`${PREAPPROVED_URL}/submissions/${props.submissionId}`)
    savingData.value = false
    submitTravelDialog.value = false
    emit("updateTable")
  } catch (error) {
    savingData.value = false
    console.log(error)
  }
}

function updateTable() {
  emit("updateTable")
}

const store = useStore()

function updateAndOpenDialog() {
  store.commit("preapproved/SET_OPEN_DIALOG_ID", "edit-" + props.submissionId)
  updateTable()
}
</script>

<style scoped>
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
