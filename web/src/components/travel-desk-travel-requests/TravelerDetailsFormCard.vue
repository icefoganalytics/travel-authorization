<template>
  <v-card class="card--outlined">
    <v-card-title class="d-flex justify-space-between align-center">
      <h4 class="text-h6">Traveler Details</h4>
      <SaveStateProgress
        v-if="showSaveStateProgress"
        class="my-0"
        :saving="isSaving"
        @click="emit('save-requested')"
      />
    </v-card-title>
    <v-card-text>
      <v-form ref="form">
        <v-row class="mt-5 mx-3">
          <v-col
            cols="12"
            md="3"
          >
            <v-text-field
              v-model="travelerDetails.legalFirstName"
              label="Legal First Name *"
              :rules="[required]"
              outlined
            />
          </v-col>
          <v-col
            cols="12"
            md="2"
          >
            <v-text-field
              v-model="travelerDetails.legalMiddleName"
              label="Legal Middle Name"
              outlined
            />
          </v-col>
          <v-col
            cols="12"
            md="3"
          >
            <v-text-field
              v-model="travelerDetails.legalLastName"
              label="Legal Last Name *"
              :rules="[required]"
              outlined
            />
          </v-col>
          <v-col
            cols="12"
            md="2"
          >
            <v-text-field
              v-model="travelerDetails.birthDate"
              label="Birth Date *"
              type="date"
              :max="dobMaxDate"
              :rules="[required]"
              outlined
            />
          </v-col>
          <v-col
            cols="12"
            md="2"
          >
            <v-text-field
              v-model="travelAuthorizationId"
              readonly
              label="Travel Auth"
              outlined
            />
          </v-col>
        </v-row>
        <v-row class="mt-0 mx-3">
          <v-col
            cols="12"
            md="3"
          >
            <v-text-field
              v-model="travelerDetails.strAddress"
              label="Address *"
              :rules="[required]"
              outlined
            />
          </v-col>
          <v-col
            cols="12"
            md="3"
          >
            <LocationsAutocomplete
              v-model="travelerDetails.city"
              label="City *"
              item-value="city"
              :rules="[required]"
              outlined
            />
          </v-col>
          <v-col
            cols="12"
            md="2"
          >
            <v-text-field
              v-model="travelerDetails.province"
              label="Province *"
              :rules="[required]"
              outlined
            />
          </v-col>
          <v-col
            cols="12"
            md="2"
          >
            <v-text-field
              v-model="travelerDetails.postalCode"
              label="Postal Code *"
              :rules="[required]"
              outlined
            />
          </v-col>
          <v-col
            cols="12"
            md="2"
          >
            <v-checkbox
              v-model="travelerDetails.isInternationalTravel"
              label="International travel"
            />
          </v-col>
        </v-row>
        <v-row
          v-if="travelerDetails.isInternationalTravel"
          class="mt-0 mx-3"
        >
          <v-col
            cols="12"
            md="3"
          >
            <v-text-field
              v-model="travelerDetails.passportNum"
              label="Passport Number *"
              :rules="[required]"
              outlined
            />
          </v-col>
          <v-col
            cols="12"
            md="3"
          >
            <v-text-field
              v-model="travelerDetails.passportCountry"
              label="Passport Country *"
              :rules="[required]"
              outlined
            />
          </v-col>
        </v-row>

        <v-row class="mt-0 mx-3">
          <v-col
            cols="12"
            md="2"
          >
            <v-text-field
              v-model="travelerDetails.busPhone"
              :rules="[isPhoneNumber, required]"
              label="Business Phone *"
              outlined
              validate-on-blur
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <v-text-field
              v-model="travelerDetails.busEmail"
              :rules="[isEmail, required]"
              label="Business Email *"
              outlined
              validate-on-blur
            />
          </v-col>
          <v-col
            cols="12"
            md="3"
          >
            <v-checkbox
              v-model="travelerDetails.travelContact"
              label="Contact information different for travel"
            />
          </v-col>
        </v-row>
        <v-row
          v-if="travelerDetails.travelContact"
          class="mt-0 mx-3"
        >
          <v-col
            cols="12"
            md="2"
          >
            <v-text-field
              v-model="travelerDetails.travelPhone"
              :rules="[isPhoneNumber, required]"
              label="Travel Phone *"
              outlined
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <v-text-field
              v-model="travelerDetails.travelEmail"
              :rules="[isEmail, required]"
              label="Travel Email *"
              outlined
            />
          </v-col>
        </v-row>
        <v-row class="mt-0 mx-3">
          <v-col cols="12">
            <v-textarea
              v-model="travelerDetails.additionalInformation"
              label="Additional Information"
              outlined
              auto-grow
              counter
            />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, reactive, ref, watch } from "vue"
import { cloneDeep, isNil } from "lodash"

import { isPhoneNumber, isEmail, required } from "@/utils/validators"

import SaveStateProgress from "@/components/SaveStateProgress.vue"
import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"

const props = defineProps({
  value: {
    type: Object,
    required: true,
  },
  showSaveStateProgress: {
    type: Boolean,
    default: false,
  },
  isSaving: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(["input", "save-requested"])

const travelerDetails = reactive({
  legalFirstName: "",
  legalMiddleName: "",
  legalLastName: "",
  birthDate: "",
  strAddress: "",
  city: "",
  province: "",
  postalCode: "",
  isInternationalTravel: false,
  passportNum: "",
  passportCountry: "",
  busPhone: "",
  busEmail: "",
  travelContact: false,
  travelPhone: "",
  travelEmail: "",
  additionalInformation: "",
  ...props.value,
})
const form = ref(null)

const travelAuthorizationId = computed(() => {
  return travelerDetails.travelAuthorizationId.toString().padStart(5, "0")
})
const dobMaxDate = computed(() => {
  const currentDate = new Date()
  currentDate.setFullYear(currentDate.getFullYear() - 18)
  return currentDate.toISOString().slice(0, 10)
})

watch(
  travelerDetails,
  (newValue) => {
    if (newValue.isInternationalTravel === false) {
      newValue.passportNum = null
      newValue.passportCountry = null
    }

    if (newValue.travelContact === false) {
      newValue.travelPhone = null
      newValue.travelEmail = null
    }

    emit("input", cloneDeep({ ...props.value, ...newValue }))
  },
  {
    deep: true,
  }
)

function validate() {
  if (isNil(form.value)) {
    throw new Error("Form could not be found")
  }

  return form.value.validate()
}

defineExpose({
  validate,
})
</script>

<style scoped></style>
