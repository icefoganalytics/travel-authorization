<template>
  <div>
    <v-dialog
      v-model="addNewTravelDialog"
      persistent
      max-width="950px"
    >
      <template #activator="{ on, attrs }">
        <v-btn
          style="min-width: 0"
          :class="type == 'Add New' ? 'mr-5 my-7' : 'px-1'"
          :color="type == 'Add New' ? 'primary' : 'transparent'"
          v-bind="attrs"
          @click="initForm"
          v-on="on"
        >
          <div v-if="type == 'Add New'">Add New Travel</div>
          <v-icon
            v-else
            dense
            color="primary"
            >mdi-pencil</v-icon
          >
        </v-btn>
      </template>

      <v-card>
        <v-card-title
          class="primary"
          style="border-bottom: 1px solid black"
        >
          <div class="text-h5">
            {{ type }}
            Travel
          </div>
        </v-card-title>

        <v-card-text>
          <v-row class="mt-5">
            <v-col cols="3">
              <v-select
                v-model="purpose"
                :readonly="readonly"
                :error="state.purposeErr"
                :items="purposeList"
                label="Purpose"
                outlined
                @change="state.purposeErr = false"
              />
            </v-col>
            <v-col cols="1" />
            <v-col cols="8">
              <v-text-field
                v-model="location"
                :readonly="readonly"
                :error="state.locationErr"
                label="Location"
                outlined
                :clearable="!readonly"
                @input="state.locationErr = false"
              />
            </v-col>
          </v-row>

          <v-row class="mt-n5">
            <v-col cols="3">
              <v-text-field
                v-model="cost"
                :readonly="readonly"
                :error="state.costErr"
                label="Estimated Cost ($)"
                type="number"
                outlined
                :clearable="!readonly"
                @input="state.costErr = false"
              />
              <v-text-field
                v-model="startDate"
                :readonly="readonly"
                :error="state.startDateErr"
                label="Start Date"
                outlined
                type="date"
                @input="state.unknownDateErr = false"
              />
            </v-col>
            <v-col cols="1" />
            <v-col cols="8">
              <v-textarea
                v-model="reason"
                :readonly="readonly"
                label="Reason"
                outlined
                :clearable="!readonly"
              />
            </v-col>
          </v-row>

          <v-row class="mt-n5">
            <v-col cols="3">
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
            <v-col cols="1" />
            <v-col cols="8">
              <v-row>
                <v-col cols="5">
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
                <v-col cols="5">
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

          <div id="traveller-detail">Traveller Details</div>
          <v-card outlined>
            <v-row class="mt-5 mx-3">
              <v-col cols="6">
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
              <v-col cols="6">
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
              <v-col cols="1" />
              <v-col cols="3">
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
              <v-col cols="4">
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
              <v-col cols="9">
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
              <v-col cols="3">
                <v-btn
                  :disabled="undefinedTraveller || readonly"
                  class="ml-auto mr-5 my-7"
                  color="primary"
                  @click="addTravellerName"
                >
                  Add Traveller
                </v-btn>
              </v-col>
            </v-row>

            <v-row class="mx-3">
              <v-col cols="12">
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
              <v-col cols="3">
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
        </v-card-text>

        <v-card-actions>
          <v-btn
            color="grey darken-5"
            @click="addNewTravelDialog = false"
          >
            <div v-if="type == 'View'">Close</div>
            <div v-else>Cancel</div>
          </v-btn>
          <v-btn
            v-if="type == 'Edit' && isAdmin"
            class="ml-5"
            color="red darken-5"
            :loading="savingData"
            @click="deleteDialog = true"
          >
            Delete
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
        </v-card-actions>
      </v-card>
    </v-dialog>

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
          <v-row class="mt-5">
            <v-col cols="12">
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
  </div>
</template>

<script>
import Vue from "vue"

import { PREAPPROVED_URL } from "@/urls"
import http from "@/api/http-client"
import { TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES } from "@/api/travel-authorization-pre-approvals-api"
import { STATUSES as SUBMISSION_STATUSES } from "@/api/travel-authorization-pre-approval-submissions-api"
import useCurrentUser from "@/use/use-current-user"

export default {
  name: "NewTravelRequest",
  props: {
    type: {
      type: String,
      default: "Add New",
    },
    travelRequest: {
      type: Object,
      default: () => {},
    },
  },
  setup() {
    const { isAdmin } = useCurrentUser()

    return {
      isAdmin,
    }
  },
  data() {
    return {
      headers: [
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
      ],
      profiles: [],
      purposeList: [],
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
      departmentList: [],
      branch: "",
      branchList: [],
      undefinedTraveller: false,
      undefinedTravellerHint: "",
      profilesNum: null,
      anticipatedMonth: "",
      travellerNotes: "",
      monthList: [
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
      ],
      travellerDialog: false,
      employeeList: [],
      adNameList: [],
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
        this.adNameList = this.employeeList
          .filter((employee) => employee.department == this.department)
          .sort((a, b) => (a.fullName >= b.fullName ? 1 : -1))
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

    selectUndefinedTraveller() {
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
      } else
        Vue.nextTick(() => {
          this.undefinedTraveller = false
          this.undefinedTravellerHint = "Please Select the Department and Branch First!"
        })
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
          location: Vue.filter("capitalize")(this.location),
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
      const userDept = this.$store.state.auth.department
      this.lockDepartment = !this.isAdmin || this.type != "Add New"

      this.initStates()
      this.initEmployeeList()
      this.initDepartments()
      this.purposeList = this.$store.state.preapproved?.travelPurposes?.map((item) => item.purpose)

      this.profiles = this.type == "Add New" ? [] : this.travelRequest.profiles
      this.purpose = this.type == "Add New" ? "" : this.travelRequest.purpose
      this.unknownDate = this.type == "Add New" ? false : this.travelRequest.isOpenForAnyDate
      this.location = this.type == "Add New" ? "" : this.travelRequest.location
      this.cost = this.type == "Add New" ? "" : this.travelRequest.estimatedCost
      this.reason = this.type == "Add New" ? "" : this.travelRequest.reason
      this.startDate = this.type == "Add New" ? "" : this.travelRequest.startDate
      this.endDate = this.type == "Add New" ? "" : this.travelRequest.endDate
      this.department = this.type == "Add New" ? userDept : this.travelRequest.department
      this.branch = this.type == "Add New" ? "" : this.travelRequest.branch
      this.undefinedTraveller =
        this.type == "Add New" ? false : this.travelRequest.isOpenForAnyTraveler
      this.undefinedTravellerHint = ""
      this.profilesNum = this.type == "Add New" ? null : this.travelRequest.numberTravelers
      this.anticipatedMonth = this.type == "Add New" ? "" : this.travelRequest.month
      this.travellerNotes = this.type == "Add New" ? "" : this.travelRequest.travelerNotes
      this.travellerDialog = false
      this.adName = ""
      this.deleteDialog = false

      this.readonly = this.type != "Add New" && this.type != "Edit"

      if (this.type != "Add New") this.departmentChanged(this.travelRequest.branch)
      else this.departmentChanged()

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

    initEmployeeList() {
      this.employeeList = this.$store.state.preapproved.employees.map((item) => {
        return {
          fullName: item.fullName,
          department: item.department,
        }
      })
    },

    initDepartments() {
      this.departmentList = []
      const depts = this.$store.state.preapproved.departmentBranch
      for (const key of Object.keys(depts)) {
        this.departmentList.push({
          name: key,
        })
      }
    },

    initSubmission(id) {
      return http
        .get(`${PREAPPROVED_URL}/submissions/${id}`)
        .then((res) => {
          this.showApproval = res.data.status === SUBMISSION_STATUSES.FINISHED
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
