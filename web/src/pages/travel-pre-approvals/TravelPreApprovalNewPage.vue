<template>
  <HeaderActionsFormCard
    ref="headerActionsFormCard"
    title="New Travel Pre-Approval"
    header-tag="h2"
    lazy-validation
    @submit.prevent="createTravelAuthorizationPreApproval"
  >
    <v-row>
      <v-col
        cols="12"
        md="3"
      >
        <!-- TODO: update data model to store purpose id -->
        <TravelPurposeTextSelect
          v-model="travelAuthorizationPreApprovalAttributes.purpose"
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
        <!-- TODO: update data model to store location id -->
        <LocationsAutocomplete
          v-model="travelAuthorizationPreApprovalAttributes.location"
          label="Location *"
          item-value="text"
          :rules="[required]"
          outlined
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="3"
      >
        <v-text-field
          v-model="travelAuthorizationPreApprovalAttributes.estimatedCost"
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
          v-model="travelAuthorizationPreApprovalAttributes.reason"
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
            v-model="travelAuthorizationPreApprovalAttributes.startDate"
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
            v-model="travelAuthorizationPreApprovalAttributes.endDate"
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
          v-model="travelAuthorizationPreApprovalAttributes.month"
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
          v-model="travelAuthorizationPreApprovalAttributes.department"
          label="Department *"
          :where="departmentWhere"
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
          v-model="travelAuthorizationPreApprovalAttributes.branch"
          label="Branch"
          :disabled="isNil(travelAuthorizationPreApprovalAttributes.department)"
          :hint="
            isNil(travelAuthorizationPreApprovalAttributes.department)
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
      v-if="isNil(travelAuthorizationPreApprovalAttributes.department)"
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
            :number-travelers.sync="travelAuthorizationPreApprovalAttributes.numberTravelers"
            :is-open-for-any-traveler.sync="
              travelAuthorizationPreApprovalAttributes.isOpenForAnyTraveler
            "
            :department="travelAuthorizationPreApprovalAttributes.department"
            :branch="travelAuthorizationPreApprovalAttributes.branch"
          />
        </v-col>
      </v-row>

      <v-row>
        <v-col
          cols="12"
          md="12"
        >
          <v-textarea
            v-model="travelAuthorizationPreApprovalAttributes.travelerNotes"
            label="Traveler Notes"
            outlined
            clearable
          />
        </v-col>
      </v-row>
    </template>

    <template #actions>
      <v-btn
        class="my-0"
        color="primary"
        :loading="isLoading"
        type="submit"
        :block="smAndDown"
      >
        Save
      </v-btn>
      <v-btn
        class="my-0 mt-4 mt-md-0"
        color="warning"
        outlined
        :to="{
          name: 'travel-pre-approvals/TravelPreApprovalRequestsPage',
        }"
        :block="smAndDown"
      >
        Cancel
      </v-btn>
    </template>
  </HeaderActionsFormCard>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { isNil } from "lodash"
import { useRouter } from "vue2-helpers/vue-router"

import travelAuthorizationPreApprovalsApi from "@/api/travel-authorization-pre-approvals-api"

import { required } from "@/utils/validators"

import useDisplayVuetify2 from "@/use/utils/use-display-vuetify2"
import useBreadcrumbs from "@/use/use-breadcrumbs"
import useCurrentUser from "@/use/use-current-user"
import useSnack from "@/use/use-snack"

import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"
import MonthSelect from "@/components/common/MonthSelect.vue"

import DepartmentAutocomplete from "@/components/yg-employee-groups/DepartmentAutocomplete.vue"
import BranchAutocomplete from "@/components/yg-employee-groups/BranchAutocomplete.vue"
import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
import TravelPurposeTextSelect from "@/components/travel-purposes/TravelPurposeTextSelect.vue"
import TravelAuthorizationPreApprovalTravelerAttributesFormCard from "@/components/travel-authorization-pre-approvals/TravelAuthorizationPreApprovalTravelerAttributesFormCard.vue"

/** @typedef {import('@/api/travel-authorization-pre-approvals-api').TravelAuthorizationPreApproval} TravelAuthorizationPreApproval */

const { smAndDown } = useDisplayVuetify2()

/** @type {Partial<TravelAuthorizationPreApproval>} */
const travelAuthorizationPreApprovalAttributes = ref({
  estimatedCost: undefined,
  location: undefined,
  department: undefined,
  branch: undefined,
  purpose: undefined,
  reason: undefined,
  startDate: undefined,
  endDate: undefined,
  isOpenForAnyDate: false,
  month: undefined,
  isOpenForAnyTraveler: false,
  numberTravelers: undefined,
  travelerNotes: undefined,
})

const travelAuthorizationPreApprovalProfilesAttributes = ref([])

const exactTravelDateKnown = ref(true)

function toggleExactTravelDateKnown(value: boolean) {
  exactTravelDateKnown.value = value

  travelAuthorizationPreApprovalAttributes.value.isOpenForAnyDate = !value
  travelAuthorizationPreApprovalAttributes.value.startDate = undefined
  travelAuthorizationPreApprovalAttributes.value.endDate = undefined
  travelAuthorizationPreApprovalAttributes.value.month = undefined
}

const { currentUser, isAdmin } = useCurrentUser<true>()

const departmentWhere = computed(() => {
  if (isAdmin.value) {
    return {}
  }

  return {
    department: currentUser.value.department ?? "DEPARTMENT_MISSING",
  }
})
const branchWhere = computed(() => ({
  department: travelAuthorizationPreApprovalAttributes.value.department,
}))

function resetDependentFieldsDepartment() {
  travelAuthorizationPreApprovalAttributes.value.branch = undefined
  travelAuthorizationPreApprovalAttributes.value.isOpenForAnyTraveler = false
  travelAuthorizationPreApprovalAttributes.value.numberTravelers = undefined
  travelAuthorizationPreApprovalProfilesAttributes.value = []
}

function resetDependentFieldsBranch() {
  travelAuthorizationPreApprovalAttributes.value.isOpenForAnyTraveler = false
  travelAuthorizationPreApprovalAttributes.value.numberTravelers = undefined
  travelAuthorizationPreApprovalProfilesAttributes.value = []
}

const headerActionsFormCard = ref<InstanceType<typeof HeaderActionsFormCard> | null>(null)
const isLoading = ref(false)
const snack = useSnack()
const router = useRouter()

async function createTravelAuthorizationPreApproval() {
  if (headerActionsFormCard.value === null) return
  if (!headerActionsFormCard.value.validate()) return

  isLoading.value = true

  try {
    await travelAuthorizationPreApprovalsApi.create({
      ...travelAuthorizationPreApprovalAttributes.value,
      profilesAttributes: travelAuthorizationPreApprovalProfilesAttributes.value,
    })
    snack.success("Travel pre-approval created.")
    return router.push({
      name: "travel-pre-approvals/TravelPreApprovalRequestsPage",
    })
  } catch (error) {
    console.error(`Failed to create travel authorization pre-approval: ${error}`, { error })
    snack.error(`Failed to create travel authorization pre-approval: ${error}`)
  } finally {
    isLoading.value = false
  }
}

const breadcrumbs = computed(() => [
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
useBreadcrumbs(breadcrumbs)
</script>

<style scoped>
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
