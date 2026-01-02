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
        <TravelPurposeTextSelect
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
import { computed, ref, toRefs } from "vue"
import { useRouter } from "vue2-helpers/vue-router"
import { isNil } from "lodash"

import blockedToTrueConfirm from "@/utils/blocked-to-true-confirm"
import { required } from "@/utils/validators"

import travelAuthorizationPreApprovalsApi from "@/api/travel-authorization-pre-approvals-api"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useRouteHistory from "@/use/use-route-history"
import useSnack from "@/use/use-snack"
import useTravelAuthorizationPreApproval from "@/use/use-travel-authorization-pre-approval"

import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"
import MonthSelect from "@/components/common/MonthSelect.vue"
import BranchAutocomplete from "@/components/yg-employee-groups/BranchAutocomplete.vue"
import DepartmentAutocomplete from "@/components/yg-employee-groups/DepartmentAutocomplete.vue"
import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
import TravelAuthorizationPreApprovalTravelerEditFormCard from "@/components/travel-authorization-pre-approvals/TravelAuthorizationPreApprovalTravelerEditFormCard.vue"
import TravelPurposeTextSelect from "@/components/travel-purposes/TravelPurposeTextSelect.vue"

const props = defineProps({
  travelAuthorizationPreApprovalId: {
    type: [String, Number],
    required: true,
  },
})

const { travelAuthorizationPreApprovalId } = toRefs(props)
const { travelAuthorizationPreApproval, isLoading, refresh } = useTravelAuthorizationPreApproval(
  travelAuthorizationPreApprovalId
)

const exactTravelDateKnown = computed(() => !travelAuthorizationPreApproval.value.isOpenForAnyDate)

function toggleExactTravelDateKnown(value) {
  travelAuthorizationPreApproval.value.isOpenForAnyDate = !value
  travelAuthorizationPreApproval.value.startDate = undefined
  travelAuthorizationPreApproval.value.endDate = undefined
  travelAuthorizationPreApproval.value.month = undefined
}

const branchWhere = computed(() => ({
  department: travelAuthorizationPreApproval.value.department,
}))

function resetDependentFieldsDepartment() {
  travelAuthorizationPreApproval.value.branch = undefined
  travelAuthorizationPreApproval.value.isOpenForAnyTraveler = false
  travelAuthorizationPreApproval.value.numberTravelers = undefined
  // TODO: delete all traveler profiles?
}

function resetDependentFieldsBranch() {
  travelAuthorizationPreApproval.value.isOpenForAnyTraveler = false
  travelAuthorizationPreApproval.value.numberTravelers = undefined
  // TODO: delete all traveler profiles?
}

const snack = useSnack()

async function saveWrapper() {
  isLoading.value = true
  try {
    await travelAuthorizationPreApprovalsApi.update(
      props.travelAuthorizationPreApprovalId,
      travelAuthorizationPreApproval.value
    )
    snack.success("Travel authorization pre-approval saved successfully")
    await refresh()
  } catch (error) {
    console.error(`Failed to save travel authorization pre-approval: ${error}`, { error })
    snack.error(`Failed to save travel authorization pre-approval: ${error}`)
  } finally {
    isLoading.value = false
  }
}

const isDeleting = ref(false)
const router = useRouter()

async function deleteTravelAuthorizationPreApproval() {
  if (!blockedToTrueConfirm("Are you sure you want to remove this travel pre-approval?")) return

  isDeleting.value = true
  try {
    await travelAuthorizationPreApprovalsApi.delete(props.travelAuthorizationPreApprovalId)
    snack.success("Travel authorization pre-approval deleted successfully")
    return router.replace({
      name: "travel-pre-approvals/TravelPreApprovalRequestsPage",
    })
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

useBreadcrumbs([
  {
    text: "Travel Pre-Approvals",
    to: {
      name: "travel-pre-approvals/TravelPreApprovalRequestsPage",
    },
  },
  {
    text: "Travel Pre-Approval",
    to: {
      name: "travel-pre-approvals/TravelPreApprovalPage",
      params: {
        travelAuthorizationPreApprovalId: props.travelAuthorizationPreApprovalId,
      },
    },
  },
  {
    text: "Edit",
    to: {
      name: "travel-pre-approvals/TravelPreApprovalEditPage",
      params: {
        travelAuthorizationPreApprovalId: props.travelAuthorizationPreApprovalId,
      },
    },
  },
])
</script>

<style scoped>
::v-deep(tbody tr:nth-of-type(even)) {
  background-color: rgba(0, 0, 0, 0.05);
}
</style>
