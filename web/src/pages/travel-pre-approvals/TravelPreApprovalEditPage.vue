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
        :loading="isDeleting"
        @click="deleteTravelAuthorizationPreApproval"
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
          <TravelAuthorizationPreApprovalTravelerEditFormCard
            v-model="travelAuthorizationPreApprovalProfilesAttributes"
            :travel-authorization-pre-approval-id="travelAuthorizationPreApprovalId"
            :number-travelers.sync="travelAuthorizationPreApproval.numberTravelers"
            :is-open-for-any-traveler.sync="travelAuthorizationPreApproval.isOpenForAnyTraveler"
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

    <!-- TODO: move to its own component: see web/src/components/travel-authorization-pre-approval-submissions/TravelAuthorizationPreApprovalSubmissionCard.vue -->
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

    <template #actions>
      <v-btn
        color="primary"
        :loading="isLoading"
        type="submit"
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

<script setup>
import { computed, onMounted, ref, toRefs } from "vue"
import { isNil, isEmpty } from "lodash"

import blockedToTrueConfirm from "@/utils/blocked-to-true-confirm"
import { required } from "@/utils/validators"

import { PREAPPROVED_URL } from "@/urls"
import http from "@/api/http-client"
import travelAuthorizationPreApprovalsApi, {
  TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES,
} from "@/api/travel-authorization-pre-approvals-api"
import { TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES } from "@/api/travel-authorization-pre-approval-submissions-api"

import useRouteHistory from "@/use/use-route-history"
import useSnack from "@/use/use-snack"
import useTravelAuthorizationPreApproval from "@/use/use-travel-authorization-pre-approval"

import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"
import MonthSelect from "@/components/common/MonthSelect.vue"
import BranchAutocomplete from "@/components/yg-employee-groups/BranchAutocomplete.vue"
import DepartmentAutocomplete from "@/components/yg-employee-groups/DepartmentAutocomplete.vue"
import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
import TravelAuthorizationPreApprovalTravelerEditFormCard from "@/components/travel-authorization-pre-approvals/TravelAuthorizationPreApprovalTravelerEditFormCard.vue"
import TravelPurposeSelect from "@/components/travel-purposes/TravelPurposeSelect.vue"

const props = defineProps({
  travelAuthorizationPreApprovalId: {
    type: [String, Number],
    required: true,
  },
})

const { travelAuthorizationPreApprovalId } = toRefs(props)
const { travelAuthorizationPreApproval, isLoading } = useTravelAuthorizationPreApproval(
  travelAuthorizationPreApprovalId
)

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
    if (isEmpty(travelAuthorizationPreApprovalProfilesAttributes.value)) {
      await travelAuthorizationPreApprovalsApi.update(travelAuthorizationPreApproval.value)
    } else {
      await travelAuthorizationPreApprovalsApi.update({
        ...travelAuthorizationPreApproval.value,
        profilesAttributes: travelAuthorizationPreApprovalProfilesAttributes.value,
      })
    }
    snack.success("Travel authorization pre-approval saved successfully")
  } catch (error) {
    console.error(`Failed to save travel authorization pre-approval: ${error}`, { error })
    snack.error(`Failed to save travel authorization pre-approval: ${error}`)
  } finally {
    isLoading.value = false
  }
}

const isDeleting = ref(false)

async function deleteTravelAuthorizationPreApproval() {
  if (!blockedToTrueConfirm("Are you sure you want to remove this travel pre-approval?")) return

  isDeleting.value = true
  try {
    await travelAuthorizationPreApprovalsApi.delete(travelAuthorizationPreApproval.value)
    snack.success("Travel authorization pre-approval deleted successfully")
  } catch (error) {
    console.error(`Failed to delete travel authorization pre-approval: ${error}`, { error })
    snack.error(`Failed to delete travel authorization pre-approval: ${error}`)
  } finally {
    isDeleting.value = false
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

const showApproval = ref(false)
const approved = ref(false)
const approvedBy = ref("")
const approvalDate = ref("")

onMounted(() => {
  initForm()
})

function initForm() {
  showApproval.value = false
  approved.value =
    travelAuthorizationPreApproval.value?.status ===
    TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.APPROVED
  approvedBy.value = ""
  approvalDate.value = ""

  if (
    travelAuthorizationPreApproval.value?.submission?.id &&
    (travelAuthorizationPreApproval.value.status ===
      TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.APPROVED ||
      travelAuthorizationPreApproval.value.status ===
        TRAVEL_AUTHORIZATION_PRE_APPROVAL_STATUSES.DECLINED)
  ) {
    initSubmission(travelAuthorizationPreApproval.value.submission.id)
  }
}

async function initSubmission(id) {
  const { data } = await http.get(`${PREAPPROVED_URL}/submissions/${id}`)
  showApproval.value =
    data.status === TRAVEL_AUTHORIZATION_PRE_APPROVAL_SUBMISSION_STATUSES.FINISHED
  approvedBy.value = data.approvedBy
  approvalDate.value = data.approvalDate
}

async function downloadPdf() {
  isLoading.value = true
  const header = {
    responseType: "application/pdf",
    headers: {
      "Content-Type": "application/text",
    },
  }

  const { data } = await http.get(
    `${PREAPPROVED_URL}/document/${travelAuthorizationPreApproval.value.submission.id}`,
    header
  )

  isLoading.value = false
  const link = document.createElement("a")
  link.href = data
  document.body.appendChild(link)
  link.download = approved.value ? "approval_doc.pdf" : "doc.pdf"
  link.click()
  setTimeout(() => URL.revokeObjectURL(link.href), 1000)
}
</script>

<style scoped>
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
