<template>
  <HeaderActionsFormCard
    ref="headerActionsFormCard"
    title="New Travel Pre-Approval"
    lazy-validation
    @submit.prevent="createTravelAuthorizationPreApproval"
  >
    <v-row>
      <v-col
        cols="12"
        md="3"
      >
        <!-- TODO: update data model to store purpose id -->
        <TravelPurposeSelect
          v-model="travelAuthorizationPreApprovalAttributes.purpose"
          label="Purpose"
          item-value="purpose"
          outlined
        />
      </v-col>
      <v-col
        class="d-none d-md-block"
        cols="12"
        md="1"
      />
      <v-col
        cols="12"
        md="8"
      >
        <!-- TODO: update data model to store location id -->
        <LocationsAutocomplete
          v-model="travelAuthorizationPreApprovalAttributes.location"
          label="Location"
          item-value="text"
          outlined
          clearable
        />
      </v-col>
    </v-row>

    <v-row class="mt-n5">
      <v-col
        cols="12"
        md="3"
      >
        <v-text-field
          v-model="cost"
          label="Estimated Cost ($)"
          type="number"
          outlined
          clearable
        />
        <v-text-field
          v-model="startDate"
          label="Start Date"
          outlined
          type="date"
        />
      </v-col>
      <v-col
        class="d-none d-md-block"
        cols="12"
        md="1"
      />
      <v-col
        cols="12"
        md="8"
      >
        <v-textarea
          v-model="reason"
          label="Reason"
          outlined
          clearable
        />
      </v-col>
    </v-row>

    <v-row class="mt-n5">
      <v-col
        cols="12"
        md="3"
      >
        <v-text-field
          v-model="endDate"
          :readonly="readonly"
          :error="state.endDateErr"
          label="End Date"
          outlined
          type="date"
          @input="state.unknownDateErr = false"
        />
      </v-col>
      <v-col
        class="d-none d-md-block"
        cols="12"
        md="1"
      />
      <v-col
        cols="12"
        md="8"
      >
        <v-row>
          <v-col
            cols="12"
            md="5"
          >
            <v-checkbox
              v-model="unknownDate"
              :readonly="readonly"
              label="exact date unknown"
              :error-messages="
                state.unknownDateErr
                  ? 'Either select Start and End Dates or Select this option'
                  : ''
              "
              @change="selectUnknownDate"
            />
          </v-col>
          <v-col
            cols="12"
            md="5"
          >
            <v-select
              v-model="anticipatedMonth"
              :readonly="readonly"
              :error="state.anticipatedMonthErr"
              :disabled="!unknownDate"
              :items="monthList"
              label="Anticipated Month"
              outlined
              @change="state.anticipatedMonthErr = false"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <div>Traveller Details</div>
    <v-card outlined>
      <v-row class="mt-5 mx-3">
        <v-col
          cols="12"
          md="6"
        >
          <v-select
            v-model="department"
            :readonly="readonly || lockDepartment"
            :error="state.departmentErr"
            :items="departmentList"
            item-text="name"
            label="Department"
            outlined
            @change="departmentChanged"
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <v-select
            v-model="branch"
            :readonly="readonly"
            :error="state.branchErr"
            :items="branchList"
            item-text="name"
            item-value="name"
            label="Branch"
            outlined
            @change="state.branchErr = false"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col
          class="d-none d-md-block"
          cols="12"
          md="1"
        />
        <v-col
          cols="12"
          md="3"
        >
          <v-checkbox
            v-model="undefinedTraveller"
            :readonly="readonly"
            :error-messages="
              state.undefinedTravellerErr
                ? `Either add Travelers' name below or Select this option`
                : undefinedTravellerHint
                  ? undefinedTravellerHint
                  : ''
            "
            label="exact traveler not known"
            @change="selectUndefinedTraveller"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <v-text-field
            v-model="profilesNum"
            :readonly="readonly"
            :error="state.travellerNumErr"
            :disabled="!undefinedTraveller"
            label="Number of Travellers"
            type="number"
            outlined
            @input="addUndefinedTraveller"
          />
        </v-col>
      </v-row>

      <v-row class="mt-5 mx-3">
        <v-col
          cols="12"
          md="9"
        >
          <v-data-table
            :headers="headers"
            :items="profiles"
            hide-default-footer
            class="elevation-1"
          >
            <template #item.remove="{ item }">
              <v-btn
                v-if="!readonly"
                style="min-width: 0"
                color="transparent"
                class="px-1"
                small
                @click="removeTraveller(item)"
              >
                <v-icon
                  class=""
                  color="red"
                  >mdi-account-remove</v-icon
                >
              </v-btn>
            </template>
          </v-data-table>
        </v-col>
        <v-col
          cols="12"
          md="3"
        >
          <v-btn
            :disabled="undefinedTraveller || readonly"
            class="ml-auto mr-5 my-7"
            color="primary"
            @click="addTravellerName"
          >
            Add Traveller
          </v-btn>

          <!-- TODO: move to its own component -->
          <v-dialog
            v-model="travellerDialog"
            persistent
            max-width="400px"
          >
            <v-card>
              <v-card-title
                class="primary"
                style="border-bottom: 1px solid black"
              >
                <div class="text-h5">Traveller</div>
              </v-card-title>

              <v-card-text>
                <v-row>
                  <v-col
                    cols="12"
                    md="12"
                  >
                    <v-autocomplete
                      v-model="adName"
                      :error="adNameErr"
                      :items="adNameList"
                      item-text="fullName"
                      label="Traveller Name"
                      outlined
                      @change="adNameErr = false"
                    />
                  </v-col>
                </v-row>
              </v-card-text>

              <v-card-actions>
                <v-btn
                  color="grey darken-5"
                  @click="travellerDialog = false"
                >
                  Cancel
                </v-btn>
                <v-btn
                  class="ml-auto"
                  color="green darken-1"
                  @click="addTraveller"
                >
                  Add
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-col>
      </v-row>

      <v-row class="mx-3">
        <v-col
          cols="12"
          md="12"
        >
          <v-textarea
            v-model="travellerNotes"
            :readonly="readonly"
            label="Traveller Notes"
            outlined
            :clearable="!readonly"
          />
        </v-col>
      </v-row>
    </v-card>

    <template #actions>
      <v-btn
        color="grey darken-5"
        @click="addNewTravelDialog = false"
      >
        <div v-if="type == 'View'">Close</div>
        <div v-else>Cancel</div>
      </v-btn>
      <v-btn
        v-if="type == 'Add New' || type == 'Edit'"
        class="ml-auto"
        color="green darken-1"
        :loading="savingData"
        @click="saveNewTravelRequest"
      >
        Save
      </v-btn>
    </template>
  </HeaderActionsFormCard>
</template>

<script setup>
import { ref, nextTick } from "vue"
import { useStore } from "vue2-helpers/vuex"

import { capitalize } from "@/utils/formatters"

import { PREAPPROVED_URL } from "@/urls"
import http from "@/api/http-client"
import { TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES } from "@/api/travel-authorization-pre-approvals-api"
import { TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES } from "@/api/travel-authorization-pre-approval-submissions-api"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useCurrentUser from "@/use/use-current-user"

import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"
import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
import TravelPurposeSelect from "@/components/travel-purposes/TravelPurposeSelect.vue"

const props = defineProps({
  type: {
    type: String,
    default: "Add New",
  },
  travelRequest: {
    type: Object,
    default: () => ({}),
  },
})

const { isAdmin } = useCurrentUser()

const travelAuthorizationPreApprovalAttributes = ref({
  purpose: null,
  location: null,
  cost: null,
  startDate: null,
  endDate: null,
  reason: null,
  unknownDate: false,
  anticipatedMonth: null,
  department: null,
  branch: null,
  traveller: null,
  travellerNotes: null,
})

const headers = ref([
  {
    text: "Name",
    value: "profileName",
    class: "blue-grey lighten-4",
  },
  {
    text: "Dept.",
    value: "department",
    class: "blue-grey lighten-4",
  },
  {
    text: "Branch",
    value: "branch",
    class: "blue-grey lighten-4",
  },
  {
    text: "",
    value: "remove",
    class: "blue-grey lighten-4",
    cellClass: "px-0 mx-0",
    sortable: false,
    width: "1rem",
  },
])

const profiles = ref([])
const addNewTravelDialog = ref(false)
const unknownDate = ref(false)
const cost = ref("")
const reason = ref("")
const startDate = ref("")
const endDate = ref("")
const lockDepartment = ref(false)
const department = ref("")
const departmentList = ref([])
const branch = ref("")
const branchList = ref([])
const undefinedTraveller = ref(false)
const undefinedTravellerHint = ref("")
const profilesNum = ref(null)
const anticipatedMonth = ref("")
const travellerNotes = ref("")
const monthList = ref([
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
])
const travellerDialog = ref(false)
const employeeList = ref([])
const adNameList = ref([])
const adName = ref("")
const savingData = ref(false)
const loadingData = ref(false)
const showApproval = ref(false)
const approved = ref(false)
const approvedBy = ref("")
const approvalDate = ref("")
const readonly = ref(false)
const deleteDialog = ref(false)
const state = ref({
  costErr: false,
  departmentErr: false,
  branchErr: false,
  anticipatedMonthErr: false,
  travellerNumErr: false,
  startDateErr: false,
  endDateErr: false,
  unknownDateErr: false,
  undefinedTravellerErr: false,
})
const adNameErr = ref(false)

function addTraveller() {
  if (adName.value) {
    travellerDialog.value = false
    const profileIndex = profiles.value.findIndex(
      (profile) => profile.profileName === adName.value && profile.department === department.value
    )
    if (profileIndex < 0)
      profiles.value.push({
        profileName: adName.value,
        department: department.value,
        branch: branch.value,
      })
  } else adNameErr.value = true
}

function addTravellerName() {
  state.value.undefinedTravellerErr = false
  undefinedTravellerHint.value = ""
  adNameErr.value = false
  adName.value = ""
  state.value.departmentErr = department.value ? false : true
  state.value.branchErr = branchList.value.length > 0 && !branch.value ? true : false
  if (department.value && (branch.value || branchList.value.length == 0)) {
    adNameList.value = employeeList.value
      .filter((employee) => employee.department == department.value)
      .sort((a, b) => (a.fullName >= b.fullName ? 1 : -1))
    travellerDialog.value = true
  }
}

function selectUnknownDate() {
  state.value.unknownDateErr = false
  if (!unknownDate.value) {
    anticipatedMonth.value = ""
    state.value.anticipatedMonthErr = false
  }
}

async function selectUndefinedTraveller() {
  undefinedTravellerHint.value = ""
  state.value.departmentErr = department.value ? false : true
  state.value.branchErr = branchList.value.length > 0 && !branch.value ? true : false
  if (!undefinedTraveller.value) {
    profiles.value = []
    return
  }
  if (department.value && (branch.value || branchList.value.length == 0)) {
    state.value.undefinedTravellerErr = false
    addUndefinedTraveller()
  } else {
    await nextTick()
    undefinedTraveller.value = false
    undefinedTravellerHint.value = "Please Select the Department and Branch First!"
  }
}

function addUndefinedTraveller() {
  state.value.travellerNumErr = false
  if (profiles.value.length > 0) {
    profiles.value = [
      {
        profileName: department.value + " " + (branch.value ? branch.value + " " : "") + "staff",
        department: department.value,
        branch: branch.value,
      },
    ]
  }
}

function checkFields() {
  state.value.costErr = cost.value ? false : true

  state.value.unknownDateErr =
    !startDate.value && !endDate.value && !unknownDate.value ? true : false
  state.value.anticipatedMonthErr = unknownDate.value && !anticipatedMonth.value ? true : false

  state.value.startDateErr = !startDate.value && endDate.value && !unknownDate.value ? true : false
  state.value.endDateErr = startDate.value && !endDate.value && !unknownDate.value ? true : false

  state.value.undefinedTravellerErr =
    !undefinedTraveller.value && profiles.value.length == 0 ? true : false
  state.value.travellerNumErr =
    undefinedTraveller.value && (!profilesNum.value || profilesNum.value < 1) ? true : false

  for (const key of Object.keys(state.value)) {
    if (state.value[key]) return false
  }
  return true
}

async function saveNewTravelRequest() {
  if (checkFields()) {
    savingData.value = true
    const body = {
      location: travelAuthorizationPreApprovalAttributes.value.location,
      purpose: travelAuthorizationPreApprovalAttributes.value.purpose,
      estimatedCost: cost.value,
      reason: reason.value,
      isOpenForAnyDate: unknownDate.value,
      month: anticipatedMonth.value,
      startDate: !unknownDate.value ? startDate.value : null,
      endDate: !unknownDate.value ? endDate.value : null,
      department: department.value,
      branch: branch.value,
      isOpenForAnyTraveler: undefinedTraveller.value,
      numberTravelers: profilesNum.value,
      profiles: profiles.value,
      travelerNotes: travellerNotes.value,
    }
    const id = props.travelRequest.value?.id ? props.travelRequest.value.id : 0
    return http
      .post(`${PREAPPROVED_URL}/${id}`, body)
      .then(() => {
        savingData.value = false
        addNewTravelDialog.value = false
        emit("updateTable")
      })
      .catch((e) => {
        savingData.value = false
        console.log(e)
      })
  }
}

const store = useStore()

function initForm() {
  const userDept = store.state.auth.department
  lockDepartment.value = !isAdmin.value || props.type != "Add New"

  initStates()
  initEmployeeList()
  initDepartments()

  profiles.value = props.type == "Add New" ? [] : props.travelRequest.profiles
  unknownDate.value = props.type == "Add New" ? false : props.travelRequest.isOpenForAnyDate
  cost.value = props.type == "Add New" ? "" : props.travelRequest.estimatedCost
  reason.value = props.type == "Add New" ? "" : props.travelRequest.reason
  startDate.value = props.type == "Add New" ? "" : props.travelRequest.startDate
  endDate.value = props.type == "Add New" ? "" : props.travelRequest.endDate
  department.value = props.type == "Add New" ? userDept : props.travelRequest.department
  branch.value = props.type == "Add New" ? "" : props.travelRequest.branch
  undefinedTraveller.value =
    props.type == "Add New" ? false : props.travelRequest.isOpenForAnyTraveler
  undefinedTravellerHint.value = ""
  profilesNum.value = props.type == "Add New" ? null : props.travelRequest.numberTravelers
  anticipatedMonth.value = props.type == "Add New" ? "" : props.travelRequest.month
  travellerNotes.value = props.type == "Add New" ? "" : props.travelRequest.travelerNotes
  travellerDialog.value = false
  adName.value = ""
  deleteDialog.value = false

  readonly.value = props.type != "Add New" && props.type != "Edit"

  if (props.type != "Add New") {
    departmentChanged(branch.value)
  } else {
    departmentChanged()
  }

  loadingData.value = false
  showApproval.value = false
  approved.value =
    props.travelRequest?.status === TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.APPROVED
  approvedBy.value = ""
  approvalDate.value = ""

  if (
    props.travelRequest?.submissionId &&
    (props.travelRequest.status === TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.APPROVED ||
      props.travelRequest.status === TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.DECLINED)
  ) {
    initSubmission(props.travelRequest.submissionId)
  }
}

function initStates() {
  adNameErr.value = false
  undefinedTravellerHint.value = ""
  for (const key of Object.keys(state.value)) {
    state.value[key] = false
  }
}

function initEmployeeList() {
  employeeList.value = store.state.preapproved.employees.map((item) => {
    return {
      fullName: item.fullName,
      department: item.department,
    }
  })
}

function initDepartments() {
  departmentList.value = []
  const depts = store.state.preapproved.departmentBranch
  for (const key of Object.keys(depts)) {
    departmentList.value.push({
      name: key,
    })
  }
}

async function initSubmission(id) {
  return http
    .get(`${PREAPPROVED_URL}/submissions/${id}`)
    .then((res) => {
      showApproval.value =
        res.data.status === TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES.FINISHED
      approvedBy.value = res.data.approvedBy
      approvalDate.value = res.data.approvalDate
    })
    .catch((e) => {
      console.log(e)
    })
}

function departmentChanged(branch) {
  state.value.departmentErr = false
  branch.value = branch ? branch : ""
  const depts = store.state.preapproved.departmentBranch
  if (department.value) {
    branchList.value = depts[department.value]?.branches || []
  } else {
    branchList.value = []
  }
}

function removeTraveller(item) {
  profiles.value = profiles.value.filter(
    (profile) => !(profile.profileName == item.profileName && profile.department == item.department)
  )
  if (profiles.value.length == 0 && undefinedTraveller.value) {
    profilesNum.value = null
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
    text: "New",
    to: {
      name: "travel-pre-approvals/TravelPreApprovalNewPage",
    },
  },
])
</script>

<style scoped>
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
