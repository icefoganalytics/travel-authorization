<template>
  <div>
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
                  v-if="
                    item.status && item.sumssionId != travelAuthorizationPreApprovalSubmissionId
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
          color="red darken-5"
          @click="deleteSubmission()"
        >
          Delete
        </v-btn>
        <v-btn
          class="ml-auto"
          color="lime darken-1"
          :loading="savingData"
          @click="submitTravelRequest(STATUSES.DRAFT)"
        >
          Save Draft
        </v-btn>
        <v-btn
          class="ml-5"
          color="green darken-1"
          :loading="savingData"
          @click="submitTravelRequest(STATUSES.SUBMITTED)"
        >
          Submit
        </v-btn>
      </v-card-actions>
    </v-card>

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

<script>
import { computed, ref, watch } from "vue"
import { cloneDeep } from "lodash"

import http from "@/api/http-client"
import { PREAPPROVED_URL } from "@/urls"

import { TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES } from "@/api/travel-authorization-pre-approvals-api"
import useTravelAuthorizationPreApprovals from "@/use/use-travel-authorization-pre-approvals"

import NewTravelRequest from "@/modules/preapproved/views/Requests/NewTravelRequest.vue"

export default {
  name: "SubmitTravel",
  components: {
    NewTravelRequest,
  },
  props: {
    travelAuthorizationPreApprovalSubmissionId: {
      type: [String, Number],
      required: true,
    },
  },
  setup(props) {
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
    const { travelAuthorizationPreApprovals: selectedRequests } =
      useTravelAuthorizationPreApprovals(travelAuthorizationPreApprovalsQuery)

    const submittingRequests = ref([])

    watch(
      () => selectedRequests.value,
      (newSelectedRequests) => {
        submittingRequests.value = cloneDeep(newSelectedRequests)
      },
      { deep: true, immediate: true }
    )

    return {
      travelRequests,
      selectedRequests,
      submittingRequests,
    }
  },
  data() {
    return {
      headers: [
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
      ],
      addTravelHeaders: [
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
      ],
      submitTravelDialog: false,
      newSelectedRequests: [],
      addTravelDialog: false,
      savingData: false,
      update: 0,
    }
  },
  computed: {
    STATUSES() {
      return TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES
    },
    remainingTravelRequests() {
      const currentIDs = this.submittingRequests.map((req) => req.id)
      const currentDept = this.submittingRequests[0]?.department
      return this.travelRequests?.filter(
        (req) =>
          !currentIDs.includes(req.id) &&
          (req.status == null || req.status === TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.DRAFT) &&
          (req.department == currentDept || currentIDs.length == 0)
      )
    },
  },
  methods: {
    removeTravel(item) {
      this.submittingRequests = cloneDeep(
        this.submittingRequests.filter((request) => request.id != item.id)
      )
      this.update++
    },

    openAddTravel() {
      this.newSelectedRequests = []
      this.addTravelDialog = true
    },

    addTravel() {
      this.submittingRequests = [...this.submittingRequests, ...this.newSelectedRequests]
      this.addTravelDialog = false
    },

    submitTravelRequest(status) {
      const currentIDs = this.submittingRequests.map((req) => req.id)
      if (currentIDs.length > 0) {
        const currentDept = this.submittingRequests[0].department
        this.savingData = true
        const body = {
          department: currentDept,
          status,
          submitter: "SYSTEM",
          preApprovalIds: currentIDs,
        }
        // console.log(body)
        return http
          .post(
            `${PREAPPROVED_URL}/submissions/${this.travelAuthorizationPreApprovalSubmissionId}`,
            body
          )
          .then(() => {
            this.savingData = false
            this.submitTravelDialog = false
            this.$emit("updateTable")
          })
          .catch((e) => {
            this.savingData = false
            console.log(e)
          })
      }
    },

    deleteSubmission() {
      return http
        .delete(`${PREAPPROVED_URL}/submissions/${this.travelAuthorizationPreApprovalSubmissionId}`)
        .then(() => {
          this.savingData = false
          this.submitTravelDialog = false
          this.$emit("updateTable")
        })
        .catch((e) => {
          this.savingData = false
          console.log(e)
        })
    },

    updateTable() {
      this.$emit("updateTable")
    },

    updateAndOpenDialog() {
      this.$store.commit(
        "preapproved/SET_OPEN_DIALOG_ID",
        "edit-" + this.travelAuthorizationPreApprovalSubmissionId
      )
      this.updateTable()
    },
  },
}
</script>

<style scoped>
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
