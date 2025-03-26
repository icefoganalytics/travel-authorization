<template>
  <v-skeleton-loader
    v-if="isNil(travelAuthorizationPreApproval)"
    type="card"
  />
  <HeaderActionsFormCard
    v-else
    ref="headerActionsFormCard"
    title="Edit Travel Pre-Approval"
    header-tag="h2"
    lazy-validation
    @submit.prevent="saveWrapper"
  >
    <template #header-actions>
      <v-btn
        class="my-0"
        color="error"
        outlined
        :loading="savingData"
        @click="deleteDialog = true"
      >
        Delete
      </v-btn>
    </template>

    <v-row>
      <v-col
        cols="12"
        md="3"
      >
        <!-- TODO: update data model to store purpose id -->
        <TravelPurposeSelect
          v-model="travelAuthorizationPreApproval.purpose"
          label="Purpose *"
          item-value="purpose"
          :rules="[required]"
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
        <LocationsAutocomplete
          v-model="travelAuthorizationPreApproval.location"
          label="Location *"
          item-value="text"
          outlined
          :rules="[required]"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="3"
      >
        <v-text-field
          v-model="travelAuthorizationPreApproval.estimatedCost"
          label="Estimated Cost ($) *"
          type="number"
          :rules="[required]"
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
        <v-textarea
          v-model="travelAuthorizationPreApproval.reason"
          label="Reason"
          outlined
          clearable
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="4"
      >
        <v-switch
          :input-value="exactTravelDateKnown"
          :label="exactTravelDateKnown ? 'Exact date known' : 'Exact date not known'"
          inset
          @change="toggleExactTravelDateKnown"
        />
      </v-col>
      <template v-if="exactTravelDateKnown">
        <v-col
          cols="12"
          md="3"
        >
          <v-text-field
            v-model="travelAuthorizationPreApproval.startDate"
            label="Start Date *"
            type="date"
            :rules="[required]"
            outlined
          />
        </v-col>
        <v-col
          cols="12"
          md="3"
        >
          <v-text-field
            v-model="travelAuthorizationPreApproval.endDate"
            label="End Date *"
            type="date"
            :rules="[required]"
            outlined
          />
        </v-col>
      </template>
      <v-col
        v-else
        cols="12"
        md="3"
      >
        <MonthSelect
          v-model="travelAuthorizationPreApproval.month"
          :disabled="!travelAuthorizationPreApproval.isOpenForAnyDate"
          label="Anticipated Month *"
          :rules="[required]"
          outlined
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <DepartmentAutocomplete
          v-model="travelAuthorizationPreApproval.department"
          label="Department *"
          :rules="[required]"
          outlined
          :clearable="false"
          @input="resetDependentFieldsDepartment"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <BranchAutocomplete
          v-model="travelAuthorizationPreApproval.branch"
          label="Branch"
          :disabled="isNil(travelAuthorizationPreApproval.department)"
          :hint="
            isNil(travelAuthorizationPreApproval.department)
              ? 'Select a department to unlock'
              : 'Search for a branch'
          "
          :where="branchWhere"
          outlined
          clearable
          @input="resetDependentFieldsBranch"
        />
      </v-col>
    </v-row>

    <v-alert
      v-if="isNil(travelAuthorizationPreApproval.department)"
      type="info"
      class="mt-4"
    >
      Please select a department to add traveler details
    </v-alert>
    <template v-else>
      <v-row>
        <v-col>
          <TravelAuthorizationPreApprovalTravelerAttributesFormCard
            v-model="travelAuthorizationPreApprovalProfilesAttributes"
            :numberTravelers.sync="travelAuthorizationPreApproval.numberTravelers"
            :isOpenForAnyTraveler.sync="travelAuthorizationPreApproval.isOpenForAnyTraveler"
            :department="travelAuthorizationPreApproval.department"
            :branch="travelAuthorizationPreApproval.branch"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col
          cols="12"
          md="12"
        >
          <v-textarea
            v-model="travelAuthorizationPreApproval.travelerNotes"
            label="Traveler Notes"
            outlined
            clearable
          />
        </v-col>
      </v-row>
    </template>

    <v-card
      v-if="showApproval"
      class="mt-5 grey lighten-5"
      outlined
    >
      <v-card-title
        class="grey lighten-5"
        style="border-bottom: 1px solid black"
      >
        <div
          v-if="approved"
          class="text-h5"
        >
          Approval
        </div>
        <div
          v-else
          class="text-h5 red--text"
        >
          Declined
        </div>
      </v-card-title>
      <v-row class="mt-0 mx-3">
        <v-col cols="5">
          <v-text-field
            v-model="approvedBy"
            readonly
            hide-details
            :label="approved ? 'Approved By' : 'Signed By'"
            outlined
          />
        </v-col>
        <v-col cols="1" />
        <v-col cols="5">
          <v-btn
            :loading="loadingData"
            color="transparent"
            @click="downloadPdf()"
            ><span class="text-h6 primary--text text-decoration-underline">
              <b v-if="approved">approval</b>
              doc.pdf</span
            >
          </v-btn>
        </v-col>
      </v-row>
      <v-row class="mx-3 mt-n5 mb-5">
        <v-col
          cols="12"
          md="3"
        >
          <v-text-field
            v-model="approvalDate"
            readonly
            hide-details
            :label="approved ? 'Approval Date' : 'Date'"
            outlined
            type="date"
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- START DIALOGS -->
    <!-- TODO: move dialogs to their own components -->
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
            <v-col cols="12">
              <YgEmployeeAutocomplete
                v-model="adName"
                :error="adNameErr"
                item-value="fullName"
                item-text="fullName"
                label="Traveller Name"
                :where="ygEmployeeWhere"
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

    <v-dialog
      v-model="deleteDialog"
      persistent
      max-width="400px"
    >
      <v-card>
        <v-card-title
          class="amber accent-2"
          style="border-bottom: 1px solid black"
        >
          <div class="text-h5">Delete Travel Request</div>
        </v-card-title>

        <v-card-text> </v-card-text>

        <v-card-actions>
          <v-btn
            color="grey darken-5"
            @click="deleteDialog = false"
          >
            Cancel
          </v-btn>
          <v-btn
            class="ml-auto"
            color="red darken-1"
            @click="deleteTravelRequest()"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- END DIALOGS -->

    <template #actions>
      <v-btn
        color="primary"
        :loading="savingData"
        @click="saveNewTravelRequest"
      >
        Save
      </v-btn>
      <v-btn
        color="warning"
        outlined
        :to="previousRouteOrFallback"
      >
        Cancel
      </v-btn>
    </template>
  </HeaderActionsFormCard>
</template>

<script>
import { computed, nextTick, ref, toRefs } from "vue"
import { isNil, isEmpty } from "lodash"

import { capitalize } from "@/utils/formatters"
import { required } from "@/utils/validators"

import { PREAPPROVED_URL } from "@/urls"
import http from "@/api/http-client"
import travelAuthorizationPreApprovalsApi, {
  TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES,
} from "@/api/travel-authorization-pre-approvals-api"
import { TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES } from "@/api/travel-authorization-pre-approval-submissions-api"

import useCurrentUser from "@/use/use-current-user"
import useRouteHistory from "@/use/use-route-history"
import useSnack from "@/use/use-snack"
import useTravelAuthorizationPreApproval from "@/use/use-travel-authorization-pre-approval"

import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"
import MonthSelect from "@/components/common/MonthSelect.vue"
import BranchAutocomplete from "@/components/yg-employee-groups/BranchAutocomplete.vue"
import DepartmentAutocomplete from "@/components/yg-employee-groups/DepartmentAutocomplete.vue"
import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
import TravelAuthorizationPreApprovalTravelerAttributesFormCard from "@/components/travel-authorization-pre-approvals/TravelAuthorizationPreApprovalTravelerAttributesFormCard.vue"
import TravelPurposeSelect from "@/components/travel-purposes/TravelPurposeSelect.vue"
import YgEmployeeAutocomplete from "@/components/yg-employees/YgEmployeeAutocomplete.vue"

export default {
  name: "TravelPreApprovalEditPage",
  props: {
    travelAuthorizationPreApprovalId: {
      type: [String, Number],
      required: true,
    },
  },
  components: {
    BranchAutocomplete,
    DepartmentAutocomplete,
    HeaderActionsFormCard,
    LocationsAutocomplete,
    MonthSelect,
    TravelAuthorizationPreApprovalTravelerAttributesFormCard,
    TravelPurposeSelect,
    YgEmployeeAutocomplete,
  },
  setup(props) {
    const { travelAuthorizationPreApprovalId } = toRefs(props)
    const { travelAuthorizationPreApproval, isLoading } = useTravelAuthorizationPreApproval(
      travelAuthorizationPreApprovalId
    )

    const { currentUser } = useCurrentUser()

    const travelAuthorizationPreApprovalProfilesAttributes = ref([])

    const exactTravelDateKnown = ref(true)

    function toggleExactTravelDateKnown(value) {
      exactTravelDateKnown.value = value

      travelAuthorizationPreApproval.value.isOpenForAnyTraveler = !value
      travelAuthorizationPreApproval.value.startDate = undefined
      travelAuthorizationPreApproval.value.endDate = undefined
      travelAuthorizationPreApproval.value.month = undefined
    }

    const branchWhere = computed(() => ({
      department: travelAuthorizationPreApproval.value.department,
    }))

    function resetDependentFieldsDepartment() {
      travelAuthorizationPreApproval.value.branch = undefined
      travelAuthorizationPreApproval.value.isOpenForAnyTraveler = undefined
      travelAuthorizationPreApproval.value.numberTravelers = undefined
      travelAuthorizationPreApprovalProfilesAttributes.value = []
    }

    function resetDependentFieldsBranch() {
      travelAuthorizationPreApproval.value.isOpenForAnyTraveler = undefined
      travelAuthorizationPreApproval.value.numberTravelers = undefined
      travelAuthorizationPreApprovalProfilesAttributes.value = []
    }

    const snack = useSnack()

    async function saveWrapper() {
      isLoading.value = true
      try {
        await travelAuthorizationPreApprovalsApi.update(travelAuthorizationPreApproval.value)
        snack.success("Travel authorization pre-approval saved successfully")
      } catch (error) {
        console.error(`Failed to save travel authorization pre-approval: ${error}`, { error })
        snack.error(`Failed to save travel authorization pre-approval: ${error}`)
      } finally {
        isLoading.value = false
      }
    }

    const { previousRoute } = useRouteHistory()
    const previousRouteOrFallback = computed(() => {
      if (
        [
          "travel-pre-approvals/TravelPreApprovalRequestsPage",
          "travel-pre-approvals/TravelPreApprovalPage",
        ].includes(previousRoute.value?.name)
      ) {
        return previousRoute.value
      }

      return {
        name: "travel-pre-approvals/TravelPreApprovalRequestsPage",
      }
    })

    return {
      branchWhere,
      currentUser,
      exactTravelDateKnown,
      isEmpty,
      isLoading,
      isNil,
      previousRouteOrFallback,
      required,
      saveWrapper,
      resetDependentFieldsBranch,
      resetDependentFieldsDepartment,
      toggleExactTravelDateKnown,
      travelAuthorizationPreApproval,
      travelAuthorizationPreApprovalProfilesAttributes,
    }
  },
  data() {
    return {
      headers: [
        {
          text: "Name",
          value: "profileName",
        },
        {
          text: "Dept.",
          value: "department",
        },
        {
          text: "Branch",
          value: "branch",
        },
        {
          text: "",
          value: "remove",
          cellClass: "px-0 mx-0",
          sortable: false,
          width: "1rem",
        },
      ],
      profiles: [],
      purpose: "",
      addNewTravelDialog: false,
      unknownDate: false,
      location: "",
      cost: "",
      reason: "",
      startDate: "",
      endDate: "",
      lockDepartment: false,
      department: "",
      branch: "",
      branchList: [],
      undefinedTraveller: false,
      undefinedTravellerHint: "",
      profilesNum: null,
      anticipatedMonth: "",
      travellerNotes: "",
      travellerDialog: false,
      adName: "",
      savingData: false,
      loadingData: false,
      showApproval: false,
      approved: false,
      approvedBy: "",
      approvalDate: "",
      readonly: false,
      deleteDialog: false,

      state: {
        purposeErr: false,
        costErr: false,
        locationErr: false,
        departmentErr: false,
        branchErr: false,
        anticipatedMonthErr: false,
        travellerNumErr: false,
        startDateErr: false,
        endDateErr: false,
        unknownDateErr: false,
        undefinedTravellerErr: false,
      },

      adNameErr: false,
    }
  },
  mounted() {},
  computed: {
    departmentWhere() {
      if (isNil(this.department) || isEmpty(this.department)) return {}

      return {
        department: this.department,
      }
    },
    branchWhere() {
      if (isNil(this.branch) || isEmpty(this.branch)) return {}

      return {
        branch: this.branch,
      }
    },
    ygEmployeeWhere() {
      return {
        ...this.departmentWhere,
        ...this.branchWhere,
      }
    },
  },
  methods: {
    addTraveller() {
      if (this.adName) {
        this.travellerDialog = false
        const profileIndex = this.profiles.findIndex(
          (profile) => profile.profileName === this.adName && profile.department === this.department
        )
        if (profileIndex < 0)
          this.profiles.push({
            profileName: this.adName,
            department: this.department,
            branch: this.branch,
          })
      } else this.adNameErr = true
    },

    addTravellerName() {
      this.state.undefinedTravellerErr = false
      this.undefinedTravellerHint = ""
      this.adNameErr = false
      this.adName = ""
      this.state.departmentErr = this.department ? false : true
      this.state.branchErr = this.branchList.length > 0 && !this.branch ? true : false
      if (this.department && (this.branch || this.branchList.length == 0)) {
        this.travellerDialog = true
      }
    },

    selectUnknownDate() {
      this.state.unknownDateErr = false
      if (!this.unknownDate) {
        this.anticipatedMonth = ""
        this.state.anticipatedMonthErr = false
      }
    },

    async selectUndefinedTraveller() {
      this.undefinedTravellerHint = ""
      this.state.departmentErr = this.department ? false : true
      this.state.branchErr = this.branchList.length > 0 && !this.branch ? true : false
      if (!this.undefinedTraveller) {
        this.profiles = []
        return
      }
      if (this.department && (this.branch || this.branchList.length == 0)) {
        this.state.undefinedTravellerErr = false
        this.addUndefinedTraveller()
      } else {
        await nextTick()
        this.undefinedTraveller = false
        this.undefinedTravellerHint = "Please Select the Department and Branch First!"
      }
    },

    addUndefinedTraveller() {
      this.state.travellerNumErr = false
      if (this.profilesNum > 0) {
        this.profiles = [
          {
            profileName: this.department + " " + (this.branch ? this.branch + " " : "") + "staff",
            department: this.department,
            branch: this.branch,
          },
        ]
      }
    },

    checkFields() {
      this.state.purposeErr = this.purpose ? false : true
      this.state.costErr = this.cost ? false : true
      this.state.locationErr = this.location ? false : true

      this.state.unknownDateErr =
        !this.startDate && !this.endDate && !this.unknownDate ? true : false
      this.state.anticipatedMonthErr = this.unknownDate && !this.anticipatedMonth ? true : false

      this.state.startDateErr = !this.startDate && this.endDate && !this.unknownDate ? true : false
      this.state.endDateErr = this.startDate && !this.endDate && !this.unknownDate ? true : false

      this.state.undefinedTravellerErr =
        !this.undefinedTraveller && this.profiles.length == 0 ? true : false
      this.state.travellerNumErr =
        this.undefinedTraveller && (!this.profilesNum || this.profilesNum < 1) ? true : false

      for (const key of Object.keys(this.state)) {
        if (this.state[key]) return false
      }
      return true
    },

    saveNewTravelRequest() {
      if (this.checkFields()) {
        this.savingData = true
        const body = {
          location: capitalize(this.location),
          purpose: this.purpose,
          estimatedCost: this.cost,
          reason: this.reason,
          isOpenForAnyDate: this.unknownDate,
          month: this.anticipatedMonth,
          startDate: !this.unknownDate ? this.startDate : null,
          endDate: !this.unknownDate ? this.endDate : null,
          department: this.department,
          branch: this.branch,
          isOpenForAnyTraveler: this.undefinedTraveller,
          numberTravelers: this.profilesNum,
          profiles: this.profiles,
          travelerNotes: this.travellerNotes,
        }
        // console.log(body);
        const id = this.travelRequest?.id ? this.travelRequest.id : 0
        return http
          .post(`${PREAPPROVED_URL}/${id}`, body)
          .then(() => {
            this.savingData = false
            this.addNewTravelDialog = false
            this.$emit("updateTable")
          })
          .catch((e) => {
            this.savingData = false
            console.log(e)
          })
      }
    },

    initForm() {
      const userDept = this.currentUser.department
      this.lockDepartment = false

      this.initStates()

      this.profiles = this.travelRequest.profiles
      this.purpose = this.travelRequest.purpose
      this.unknownDate = this.travelRequest.isOpenForAnyDate
      this.location = this.travelRequest.location
      this.cost = this.travelRequest.estimatedCost
      this.reason = this.travelRequest.reason
      this.startDate = this.travelRequest.startDate
      this.endDate = this.travelRequest.endDate
      this.department = this.travelRequest.department
      this.branch = this.travelRequest.branch
      this.undefinedTraveller = this.travelRequest.isOpenForAnyTraveler
      this.undefinedTravellerHint = ""
      this.profilesNum = this.travelRequest.numberTravelers
      this.anticipatedMonth = this.travelRequest.month
      this.travellerNotes = this.travelRequest.travelerNotes
      this.travellerDialog = false
      this.adName = ""
      this.deleteDialog = false

      this.readonly = false

      this.departmentChanged(this.travelRequest.branch)

      this.loadingData = false
      this.showApproval = false
      this.approved =
        this.travelRequest?.status === TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.APPROVED
      this.approvedBy = ""
      this.approvalDate = ""

      if (
        this.travelRequest?.submissionId &&
        (this.travelRequest.status === TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.APPROVED ||
          this.travelRequest.status === TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.DECLINED)
      )
        this.initSubmission(this.travelRequest.submissionId)
    },

    initStates() {
      this.adNameErr = false
      this.undefinedTravellerHint = ""
      for (const key of Object.keys(this.state)) {
        this.state[key] = false
      }
    },

    initSubmission(id) {
      return http
        .get(`${PREAPPROVED_URL}/submissions/${id}`)
        .then((res) => {
          this.showApproval =
            res.data.status === TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES.FINISHED
          this.approvedBy = res.data.approvedBy
          this.approvalDate = res.data.approvalDate
        })
        .catch((e) => {
          console.log(e)
        })
    },

    downloadPdf() {
      this.loadingData = true
      const header = {
        responseType: "application/pdf",
        headers: {
          "Content-Type": "application/text",
        },
      }

      return http
        .get(`${PREAPPROVED_URL}/document/${this.travelRequest.submissionId}`, header)
        .then((res) => {
          this.loadingData = false
          const link = document.createElement("a")
          link.href = res.data
          document.body.appendChild(link)
          link.download = this.approved ? "approval_doc.pdf" : "doc.pdf"
          link.click()
          setTimeout(() => URL.revokeObjectURL(link.href), 1000)
        })
        .catch((e) => {
          this.loadingData = false
          console.log(e)
        })
    },

    deleteTravelRequest() {
      this.deleteDialog = false
      this.savingData = true
      return http
        .delete(`${PREAPPROVED_URL}/${this.travelRequest.id}`)
        .then(() => {
          this.savingData = false
          this.addNewTravelDialog = false
          this.$emit("updateTable")
        })
        .catch((e) => {
          this.savingData = false
          console.log(e)
        })
    },

    departmentChanged(branch) {
      this.state.departmentErr = false
      this.branch = branch ? branch : ""
      const depts = this.$store.state.preapproved.departmentBranch
      if (this.department) {
        this.branchList = depts[this.department]?.branches || []
      } else {
        this.branchList = []
      }
    },

    removeTraveller(item) {
      this.profiles = this.profiles.filter(
        (profile) =>
          !(profile.profileName == item.profileName && profile.department == item.department)
      )
      if (this.profiles.length == 0 && this.undefinedTraveller) {
        this.profilesNum = null
      }
    },
  },
}
</script>

<style scoped>
#traveller-detail {
  position: relative;
  top: 12px;
  left: 15px;
  width: 20%;
  font-size: 15pt;
  height: 100%;
  background: rgb(255, 255, 255);
  z-index: 99;
}

::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
