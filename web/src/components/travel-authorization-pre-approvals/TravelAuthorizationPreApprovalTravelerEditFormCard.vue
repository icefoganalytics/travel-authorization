<template>
  <HeaderActionsFormCard
    title="Traveller Details"
    header-tag="h3"
  >
    <v-row>
      <v-col
        cols="12"
        md="3"
      >
        <!-- TODO: update travelPreApproval attributes on add traveller. -->
        <v-switch
          v-model="exactTravelerKnown"
          :label="exactTravelerKnown ? 'Exact traveler known' : 'Exact traveler not known'"
          inset
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-if="exactTravelerKnown"
        cols="12"
        md="4"
      >
        <YgEmployeeAutocomplete
          v-model="travelerName"
          label="Traveler name *"
          :where="ygEmployeeWhere"
          item-value="fullName"
          item-text="fullName"
          :clearable="false"
          hint="Search for a traveler. If no travelers are found, try a different department or branch."
          outlined
        />
      </v-col>
      <v-col
        v-else
        cols="12"
        md="4"
      >
        <v-text-field
          v-model="numberTravelersLocal"
          label="Number of Travelers *"
          type="number"
          outlined
          persistent-hint
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <v-btn
          color="primary"
          :disabled="isNil(travelerName) && isNil(numberTravelersLocal)"
          :loading="isLoading"
          @click="createTravelAuthorizationPreApprovalProfile"
        >
          Add traveler profile
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="9"
      >
        <TravelAuthorizationPreApprovalProfilesDataTable
          ref="travelAuthorizationPreApprovalProfilesDataTable"
          :where="preApprovalProfileWhere"
          route-query-suffix="Profile"
        >
          <template #item.actions="{ item }">
            <v-btn
              title="Remove traveler profile"
              icon
              color="error"
              @click="removeTravelAuthorizationPreApprovalProfile(item.id)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </TravelAuthorizationPreApprovalProfilesDataTable>
      </v-col>
    </v-row>
  </HeaderActionsFormCard>
</template>

<script setup>
import { computed, ref } from "vue"
import { isEmpty, isNil } from "lodash"

import travelAuthorizationPreApprovalsApi from "@/api/travel-authorization-pre-approvals-api"
import travelAuthorizationPreApprovalProfilesApi from "@/api/travel-authorization-pre-approval-profiles-api"
import useSnack from "@/use/use-snack"

import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"
import YgEmployeeAutocomplete from "@/components/yg-employees/YgEmployeeAutocomplete.vue"
import TravelAuthorizationPreApprovalProfilesDataTable from "@/components/travel-authorization-pre-approval-profiles/TravelAuthorizationPreApprovalProfilesDataTable.vue"

/** @typedef {import("@/api/travel-authorization-pre-approvals-api").TravelAuthorizationPreApprovalProfile} TravelAuthorizationPreApprovalProfile */

const props = defineProps({
  travelAuthorizationPreApprovalId: {
    type: [String, Number],
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  isOpenForAnyTraveler: {
    type: Boolean,
    required: true,
  },
  numberTravelers: {
    type: Number,
    default: undefined,
  },
  branch: {
    type: String,
    default: undefined,
  },
})

const emit = defineEmits(["update:numberTravelers", "update:isOpenForAnyTraveler"])

const preApprovalProfileWhere = computed(() => ({
  preApprovalId: props.travelAuthorizationPreApprovalId,
}))

const exactTravelerKnown = computed({
  get() {
    return props.isOpenForAnyTraveler === false
  },
  set(value) {
    travelerName.value = undefined
    emit("update:isOpenForAnyTraveler", !value)
    emit("update:numberTravelers", undefined)
  },
})

const numberTravelersLocal = computed({
  get() {
    if (isNil(props.numberTravelers)) return undefined

    return props.numberTravelers
  },
  set(value) {
    if (isNil(value) || isEmpty(value)) {
      emit("update:numberTravelers", undefined)
    } else {
      const newNumberOfTravelers = parseInt(value)
      emit("update:numberTravelers", newNumberOfTravelers)
    }
  },
})

const travelerName = ref(undefined)

const branchWhere = computed(() => {
  if (isNil(props.branch)) return {}

  return {
    branch: props.branch,
  }
})
const ygEmployeeWhere = computed(() => ({
  department: props.department,
  ...branchWhere.value,
}))

const isLoading = ref(false)
const snack = useSnack()

/** @type {import("vue").Ref<InstanceType<typeof TravelAuthorizationPreApprovalProfilesDataTable> | null>} */
const travelAuthorizationPreApprovalProfilesDataTable = ref(null)

async function createTravelAuthorizationPreApprovalProfile() {
  let profileName
  if (exactTravelerKnown.value) {
    profileName = travelerName.value
  } else {
    const profilePrefix = [props.department, props.branch].filter(Boolean).join(" ")
    // TODO: consider if we should be adding one record for each "number of travelers"?
    // TODO: consider if we should be including the "number of travelers" in the profile name
    profileName = `${profilePrefix} staff`
  }

  const newProfileAttributes = {
    preApprovalId: props.travelAuthorizationPreApprovalId,
    profileName,
    department: props.department,
    branch: props.branch,
  }

  isLoading.value = true
  try {
    await travelAuthorizationPreApprovalsApi.update(props.travelAuthorizationPreApprovalId, {
      isOpenForAnyTraveler: props.isOpenForAnyTraveler,
      numberTravelers: props.numberTravelers,
    })
    await travelAuthorizationPreApprovalProfilesApi.create(newProfileAttributes)
    snack.success(`Travel pre-approval profile created successfully`)
    await travelAuthorizationPreApprovalProfilesDataTable.value.refresh()
    reset()
  } catch (error) {
    console.error(`failed to create travel authorization pre-approval profile: ${error}`, { error })
    snack.error(`Failed to create travel pre-approval profile: ${error}`)
  } finally {
    isLoading.value = false
  }
}

const isDeleting = ref(false)

async function removeTravelAuthorizationPreApprovalProfile(
  travelAuthorizationPreApprovalProfileId
) {
  isDeleting.value = true
  try {
    await travelAuthorizationPreApprovalProfilesApi.delete(travelAuthorizationPreApprovalProfileId)
    snack.success(`Travel pre-approval profile deleted successfully`)
    await travelAuthorizationPreApprovalProfilesDataTable.value.refresh()
  } catch (error) {
    console.error(`failed to delete travel authorization pre-approval profile: ${error}`, { error })
    snack.error(`Failed to delete travel pre-approval profile: ${error}`)
  } finally {
    isDeleting.value = false
  }
}

function reset() {
  travelerName.value = undefined
  emit("update:numberTravelers", undefined)
}
</script>
