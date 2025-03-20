<template>
  <v-skeleton-loader
    v-if="isNil(travelAuthorizationPreApproval)"
    type="card"
  />
  <v-card v-else>
    <v-card-title>
      <h2>Travel Pre-Approval</h2>
    </v-card-title>
    <v-divider />
    <v-card-text>
      <v-row class="mt-5">
        <v-col cols="3">
          <v-select
            label="Purpose"
            :value="travelAuthorizationPreApproval.purpose"
            :items="purposeList"
            readonly
            outlined
          />
        </v-col>
        <v-col cols="1" />
        <v-col cols="8">
          <v-text-field
            label="Location"
            :value="travelAuthorizationPreApproval.location"
            readonly
            outlined
          />
        </v-col>
      </v-row>

      <v-row class="mt-n5">
        <v-col cols="3">
          <v-text-field
            label="Estimated Cost ($)"
            :value="travelAuthorizationPreApproval.cost"
            readonly
            outlined
          />
          <v-text-field
            label="Start Date"
            :value="travelAuthorizationPreApproval.startDate"
            readonly
            outlined
          />
        </v-col>
        <v-col cols="1" />
        <v-col cols="8">
          <v-textarea
            label="Reason"
            :value="travelAuthorizationPreApproval.reason"
            readonly
            outlined
          />
        </v-col>
      </v-row>

      <v-row class="mt-n5">
        <v-col cols="3">
          <v-text-field
            label="End Date"
            :value="travelAuthorizationPreApproval.endDate"
            readonly
            outlined
          />
        </v-col>
        <v-col cols="1" />
        <v-col cols="8">
          <v-row>
            <v-col cols="5">
              <v-checkbox
                label="Exact Date Unknown"
                :value="travelAuthorizationPreApproval.unknownDate"
                readonly
              />
            </v-col>
            <v-col cols="5">
              <v-select
                label="Anticipated Month"
                :value="travelAuthorizationPreApproval.anticipatedMonth"
                :items="monthList"
                readonly
                outlined
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
              label="Department"
              :value="travelAuthorizationPreApproval.department"
              :items="departmentList"
              item-text="name"
              readonly
              outlined
            />
          </v-col>
          <v-col cols="6">
            <v-select
              label="Branch"
              :value="travelAuthorizationPreApproval.branch"
              :items="branchList"
              item-text="name"
              item-value="name"
              readonly
              outlined
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="1" />
          <v-col cols="3">
            <v-checkbox
              label="Exact Traveler Not Known"
              :value="travelAuthorizationPreApproval.undefinedTraveller"
              readonly
            />
          </v-col>
          <v-col cols="4">
            <v-text-field
              label="Number of Travellers"
              :value="travelAuthorizationPreApproval.profilesNum"
              readonly
              outlined
            />
          </v-col>
        </v-row>

        <v-row class="mt-5 mx-3">
          <v-col cols="9">
            <!-- TODO: move this to its own component and load data from "where" travelAuthorizationPreApprovalId -->
            <v-data-table
              :headers="headers"
              :items="preApprovalProfiles"
              hide-default-footer
              class="elevation-1"
            >
            </v-data-table>
          </v-col>
        </v-row>

        <v-row class="mx-3">
          <v-col cols="12">
            <v-textarea
              label="Traveller Notes"
              :value="travelAuthorizationPreApproval.travelerNotes"
              readonly
              outlined
            />
          </v-col>
        </v-row>
      </v-card>

      <!-- TODO: move this to its own component and load data internally -->
      <v-card
        v-if="!isNil(preApprovalSubmission)"
        class="mt-5 grey lighten-5"
        outlined
      >
        <v-card-title
          class="grey lighten-5"
          style="border-bottom: 1px solid black"
        >
          <div
            v-if="preApprovalSubmission.status === 'approved'"
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
              :value="preApprovalSubmission.approverId"
              readonly
              hide-details
              :label="preApprovalSubmission.status === 'approved' ? 'Approved By' : 'Signed By'"
              outlined
            />
          </v-col>
          <v-col cols="1" />
          <v-col cols="5">
            <v-btn
              :loading="loadingData"
              color="transparent"
              @click="downloadPdf"
              ><span class="text-h6 primary--text text-decoration-underline">
                <b v-if="preApprovalSubmission.status === 'approved'">approval</b>
                doc.pdf</span
              >
            </v-btn>
          </v-col>
        </v-row>
        <v-row class="mx-3 mt-n5 mb-5">
          <v-col cols="3">
            <v-text-field
              :value="preApprovalSubmission.approvedAt"
              readonly
              hide-details
              :label="preApprovalSubmission.status === 'approved' ? 'Approval Date' : 'Date'"
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
        Close
      </v-btn>
      <v-btn
        class="ml-5"
        color="red darken-5"
        :loading="savingData"
        @click="deleteDialog = true"
      >
        Delete
      </v-btn>
      <v-btn
        class="ml-auto"
        color="primary"
      >
        Edit
      </v-btn>
    </v-card-actions>

    <v-dialog
      :value="deleteDialog"
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
            @click="deleteTravelRequest"
          >
            Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script setup>
import { computed, onMounted, ref, toRefs } from "vue"
import { useStore } from "vue2-helpers/vuex"
import { isNil } from "lodash"

import { PREAPPROVED_URL } from "@/urls"
import http from "@/api/http-client"

import useTravelAuthorizationPreApproval from "@/use/use-travel-authorization-pre-approval"

const props = defineProps({
  travelAuthorizationPreApprovalId: {
    type: [String, Number],
    required: true,
  },
})

const { travelAuthorizationPreApprovalId } = toRefs(props)
const { travelAuthorizationPreApproval } = useTravelAuthorizationPreApproval(
  travelAuthorizationPreApprovalId
)

const preApprovalProfiles = computed(() => travelAuthorizationPreApproval.value?.profiles)
const preApprovalSubmission = computed(() => travelAuthorizationPreApproval.value?.submission)

const headers = ref([
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
    text: "Actions",
    value: "actions",
    sortable: false,
  },
])

const purposeList = ref([])
const departmentList = ref([])
const branchList = ref([])
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
const employeeList = ref([])
const savingData = ref(false)
const loadingData = ref(false)
const deleteDialog = ref(false)

onMounted(() => {
  initEmployeeList()
  initDepartments()
})

const store = useStore()

function initEmployeeList() {
  // TODO: load from back-end
  employeeList.value = store.state.preapproved.employees.map((item) => {
    return {
      fullName: item.fullName,
      department: item.department,
    }
  })
}

function initDepartments() {
  // TODO: load from back-end
  departmentList.value = []
  const depts = store.state.preapproved.departmentBranch
  for (const key of Object.keys(depts)) {
    departmentList.value.push({
      name: key,
    })
  }
}

async function downloadPdf() {
  loadingData.value = true
  try {
    const header = {
      responseType: "application/pdf",
      headers: {
        "Content-Type": "application/text",
      },
    }

    const { data } = await http.get(
      `${PREAPPROVED_URL}/document/${travelAuthorizationPreApproval.value.submissionId}`,
      header
    )
    loadingData.value = false
    const link = document.createElement("a")
    link.href = data
    document.body.appendChild(link)
    link.download = "approval_doc.pdf"
    link.click()
    setTimeout(() => URL.revokeObjectURL(link.href), 1000)
  } catch (error) {
    console.error(`Failed to download PDF: ${error}`)
  } finally {
    loadingData.value = false
  }
}

async function deleteTravelRequest() {
  deleteDialog.value = false
  savingData.value = true
  try {
    await http.delete(`${PREAPPROVED_URL}/${props.travelAuthorizationPreApprovalId}`)
  } catch (error) {
    console.error(`Failed to delete travel request: ${error}`)
  } finally {
    savingData.value = false
  }
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
