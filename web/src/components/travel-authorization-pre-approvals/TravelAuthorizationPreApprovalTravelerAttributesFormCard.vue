<template>
  <HeaderActionsFormCard
    title="Traveller Details"
    header-tag="h3"
  >
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <DepartmentAutocomplete
          v-model="department"
          label="Department *"
          :rules="[required]"
          outlined
          @input="resetDependentFieldsDepartment"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <BranchAutocomplete
          v-model="branch"
          label="Branch"
          :disabled="isNil(department)"
          :hint="isNil(department) ? 'Select a department to unlock' : 'Search for a branch'"
          :where="branchWhere"
          outlined
          clearable
          @input="resetDependentFieldsBranch"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="12"
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
          :disabled="isNil(department)"
          :hint="isNil(department) ? 'Select a department to unlock' : 'Search for a traveler'"
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
          v-model="numberTravelers"
          label="Number of Travelers *"
          type="number"
          :disabled="isNil(department)"
          :hint="isNil(department) ? 'Select a department to unlock' : ''"
          :rules="[required]"
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
          :disabled="isNil(department) && (isNil(travelerName) || isNil(numberTravelers))"
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
        <v-data-table
          :headers="headers"
          :items="profilesAttributesReadOnly"
          hide-default-footer
        >
          <template #item.actions="{ item }">
            <v-btn
              title="Remove traveler profile"
              icon
              color="error"
              @click="removeTravelerProfileAttributes(item)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
  </HeaderActionsFormCard>
</template>

<script setup>
import { computed, ref } from "vue"
import { isEqual, isNil } from "lodash"

import { required } from "@/utils/validators"

import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"
import YgEmployeeAutocomplete from "@/components/yg-employees/YgEmployeeAutocomplete.vue"
import DepartmentAutocomplete from "@/components/yg-employee-groups/DepartmentAutocomplete.vue"
import BranchAutocomplete from "@/components/yg-employee-groups/BranchAutocomplete.vue"

/** @typedef {import("@/api/travel-authorization-pre-approvals-api").TravelAuthorizationPreApproval} TravelAuthorizationPreApproval */
/** @typedef {import("@/api/travel-authorization-pre-approvals-api").TravelAuthorizationPreApprovalProfile} TravelAuthorizationPreApprovalProfile */

const props = defineProps({
  value: {
    /**
     * @type {Partial<TravelAuthorizationPreApproval> & {
     *   profilesAttributes: Partial<TravelAuthorizationPreApprovalProfile>[]
     * }}
     */
    type: Object,
    default: () => ({
      profilesAttributes: [],
    }),
  },
})

const emit = defineEmits(["input"])

const profilesAttributesReadOnly = computed(() => props.value.profilesAttributes)

const exactTravelerKnown = ref(true)
const department = ref(undefined)
const branch = ref(undefined)
const travelerName = ref(undefined)
const numberTravelers = ref(undefined)

const branchWhere = computed(() => ({
  department: department.value,
}))

const ygEmployeeWhere = computed(() => ({
  department: department.value,
  branch: branch.value,
}))

function resetDependentFieldsDepartment() {
  branch.value = undefined
  travelerName.value = undefined
  numberTravelers.value = undefined
}

function resetDependentFieldsBranch() {
  travelerName.value = undefined
  numberTravelers.value = undefined
}

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

function toggleExactTravelerKnown(value) {
  exactTravelerKnown.value = value
  department.value = undefined
  branch.value = undefined
  travelerName.value = undefined

  const { profilesAttributes, ...otherAttributes } = props.value
  const newPreApprovalAttributes = {
    ...otherAttributes,
    isOpenForAnyTraveler: !exactTravelerKnown.value,
    department: undefined,
    branch: undefined,
    numberTravelers: undefined,
    profilesAttributes: [],
  }
  emit("input", newPreApprovalAttributes)
}

function addTravelerProfileAttributes() {
  const { profilesAttributes, ...otherAttributes } = props.value
  if (exactTravelerKnown.value) {
    const newProfileAttributes = {
      profileName: travelerName.value,
      department: department.value,
      branch: branch.value,
    }
    const newPreApprovalAttributes = {
      ...otherAttributes,
      profilesAttributes: [...profilesAttributes, newProfileAttributes],
    }
    emit("input", newPreApprovalAttributes)
    return
  } else {
    const profileName = [department.value, branch.value].filter(Boolean).join(" ") + " staff"
    const newProfileAttributes = {
      profileName,
      department: department.value,
      branch: branch.value,
    }
    const newPreApprovalAttributes = {
      ...otherAttributes,
      profilesAttributes: [...profilesAttributes, newProfileAttributes],
    }

    emit("input", newPreApprovalAttributes)
    return
  }
}

function removeTravelerProfileAttributes(item) {
  const { profilesAttributes, ...otherAttributes } = props.value
  const travelerProfilesAttributesWithoutItem = profilesAttributes.filter(
    (profile) => !isEqual(profile, item)
  )
  const newPreApprovalAttributes = {
    ...otherAttributes,
    profilesAttributes: travelerProfilesAttributesWithoutItem,
  }
  emit("input", newPreApprovalAttributes)
}
</script>
