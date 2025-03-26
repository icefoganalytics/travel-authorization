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
        <v-switch
          :input-value="exactTravelerKnown"
          :label="exactTravelerKnown ? 'Exact traveler known' : 'Exact traveler not known'"
          inset
          @change="toggleExactTravelerKnown"
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
          item-value="fullName"
          item-text="fullName"
          label="Traveler name *"
          :clearable="false"
          hint="Search for a traveler. If no travelers are found, try a different department or branch."
          outlined
          :where="ygEmployeeWhere"
          :rules="[required]"
        />
      </v-col>
      <v-col
        v-else
        cols="12"
        md="4"
      >
        <v-text-field
          v-model.number="numberTravelersLocal"
          label="Number of Travelers *"
          type="number"
          :rules="[required]"
          outlined
          persistent-hint
          @input="emit('update:numberTravelers', Number($event))"
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <v-btn
          color="primary"
          :disabled="isNil(travelerName) && isNil(numberTravelersLocal)"
          @click="addTravelerProfileAttributes"
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
import { isNil } from "lodash"

import { required } from "@/utils/validators"
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
  value: {
    /**
     * @type {Partial<TravelAuthorizationPreApprovalProfile>[]}
     */
    type: Array,
    default: () => [],
  },
  numberTravelers: {
    type: Number,
    default: undefined,
  },
  isOpenForAnyTraveler: {
    type: Boolean,
    default: false,
  },
  branch: {
    type: String,
    default: undefined,
  },
})

const emit = defineEmits(["input", "update:numberTravelers", "update:isOpenForAnyTraveler"])

const preApprovalProfileWhere = computed(() => ({
  preApprovalId: props.travelAuthorizationPreApprovalId,
}))

const exactTravelerKnown = ref(true)
const travelerName = ref(undefined)
const numberTravelersLocal = ref(undefined)

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

function toggleExactTravelerKnown(value) {
  exactTravelerKnown.value = value
  travelerName.value = undefined
  numberTravelersLocal.value = undefined

  emit("update:isOpenForAnyTraveler", !exactTravelerKnown.value)
  emit("update:numberTravelers", numberTravelersLocal.value)
  emit("input", [])
}

function addTravelerProfileAttributes() {
  if (exactTravelerKnown.value) {
    const newProfileAttributes = {
      profileName: travelerName.value,
      department: props.department,
      branch: props.branch,
    }
    emit("input", [...props.value, newProfileAttributes])
    return
  } else {
    const profilePrefix = [props.department, props.branch].filter(Boolean).join(" ")
    // TODO: consider if we should be adding one record for each "number of travelers"?
    // TODO: consider if we should be including the "number of travelers" in the profile name
    const profileName = `${profilePrefix} staff`
    const newProfileAttributes = {
      profileName,
      department: props.department,
      branch: props.branch,
    }
    emit("input", [...props.value, newProfileAttributes])
    return
  }
}

const isDeleting = ref(false)
const snack = useSnack()

/** @type {import("vue").Ref<InstanceType<typeof TravelAuthorizationPreApprovalProfilesDataTable> | null>} */
const travelAuthorizationPreApprovalProfilesDataTable = ref(null)

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
</script>
