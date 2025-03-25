<template>
  <HeaderActionsFormCard
    title="Traveller Details"
    header-tag="h3"
  >
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
          :hint="'Search for a traveler'"
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
        <v-data-table
          :headers="headers"
          :items="value"
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

/** @typedef {import("@/api/travel-authorization-pre-approvals-api").TravelAuthorizationPreApprovalProfile} TravelAuthorizationPreApprovalProfile */

const props = defineProps({
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

const exactTravelerKnown = ref(true)
const travelerName = ref(undefined)
const numberTravelersLocal = ref(undefined)

const ygEmployeeWhere = computed(() => ({
  department: props.department,
  branch: props.branch,
}))

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

function removeTravelerProfileAttributes(item) {
  const travelerProfilesAttributesWithoutItem = props.value.filter(
    (profile) => !isEqual(profile, item)
  )
  emit("input", travelerProfilesAttributesWithoutItem)
}
</script>
