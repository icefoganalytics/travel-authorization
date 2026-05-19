<template>
  <v-card
    class="card--outlined"
    style="--card-title-bg: white"
  >
    <v-card-title class="d-flex justify-space-between align-center">
      <h4 class="text-h6">Traveler Details</h4>
    </v-card-title>
    <v-card-text>
      <div class="d-flex justify-center justify-md-end mt-md-n4 mb-2">
        <DescriptionElement
          :value="formattedTravelAuthorizationId"
          label="Travel Auth"
        />
      </div>
      <v-form ref="form">
        <v-row class="mt-0 mx-3">
          <v-col
            cols="12"
            md="3"
          >
            <v-text-field
              v-model="travelDeskTravelRequest.legalFirstName"
              label="Legal First Name *"
              :rules="[required]"
              variant="outlined"
            />
          </v-col>
          <v-col
            cols="12"
            md="3"
          >
            <v-text-field
              v-model="travelDeskTravelRequest.legalMiddleName"
              label="Legal Middle Name"
              variant="outlined"
            />
          </v-col>
          <v-col
            cols="12"
            md="3"
          >
            <v-text-field
              v-model="travelDeskTravelRequest.legalLastName"
              label="Legal Last Name *"
              :rules="[required]"
              variant="outlined"
            />
          </v-col>
          <v-col
            cols="12"
            md="3"
          >
            <StringDateInput
              v-model="travelDeskTravelRequest.birthDate"
              label="Birth Date *"
              :max="dobMaxDate"
              :rules="[required]"
              variant="outlined"
            />
          </v-col>
        </v-row>
        <v-row class="mt-0 mx-3">
          <v-col
            cols="12"
            md="3"
          >
            <v-text-field
              v-model="travelDeskTravelRequest.strAddress"
              label="Address *"
              :rules="[required]"
              variant="outlined"
            />
          </v-col>
          <v-col
            cols="12"
            md="3"
          >
            <LocationsAutocomplete
              v-model="travelDeskTravelRequest.city"
              label="City *"
              item-value="cityUniqueLegacy"
              :rules="[required]"
              variant="outlined"
            />
          </v-col>
          <v-col
            cols="12"
            md="2"
          >
            <v-text-field
              v-model="travelDeskTravelRequest.province"
              label="Province *"
              :rules="[required]"
              variant="outlined"
            />
          </v-col>
          <v-col
            cols="12"
            md="2"
          >
            <v-text-field
              v-model="travelDeskTravelRequest.postalCode"
              label="Postal Code *"
              :rules="[required]"
              variant="outlined"
            />
          </v-col>
          <v-col
            cols="12"
            md="2"
          >
            <v-checkbox
              v-model="travelDeskTravelRequest.isInternationalTravel"
              label="International travel"
            />
          </v-col>
        </v-row>
        <v-row
          v-if="travelDeskTravelRequest.isInternationalTravel"
          class="mt-0 mx-3"
        >
          <v-col
            cols="12"
            md="3"
          >
            <v-text-field
              v-model="travelDeskTravelRequest.passportNum"
              label="Passport Number *"
              :rules="[required]"
              variant="outlined"
            />
          </v-col>
          <v-col
            cols="12"
            md="3"
          >
            <v-text-field
              v-model="travelDeskTravelRequest.passportCountry"
              label="Passport Country *"
              :rules="[required]"
              variant="outlined"
            />
          </v-col>
        </v-row>

        <v-row class="mt-0 mx-3">
          <v-col
            cols="12"
            md="3"
          >
            <v-text-field
              v-model="travelDeskTravelRequest.busPhone"
              :rules="[isPhoneNumber, required]"
              label="Business Phone *"
              variant="outlined"
              validate-on="blur"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <v-text-field
              v-model="travelDeskTravelRequest.busEmail"
              :rules="[isEmail, required]"
              label="Business Email *"
              variant="outlined"
              validate-on="blur"
            />
          </v-col>
          <v-col
            cols="12"
            md="3"
          >
            <v-checkbox
              v-model="travelDeskTravelRequest.travelContact"
              label="Contact information different for travel"
            />
          </v-col>
        </v-row>
        <v-row
          v-if="travelDeskTravelRequest.travelContact"
          class="mt-0 mx-3"
        >
          <v-col
            cols="12"
            md="2"
          >
            <v-text-field
              v-model="travelDeskTravelRequest.travelPhone"
              :rules="[isPhoneNumber, required]"
              label="Travel Phone *"
              variant="outlined"
            />
          </v-col>
          <v-col
            cols="12"
            md="4"
          >
            <v-text-field
              v-model="travelDeskTravelRequest.travelEmail"
              :rules="[isEmail, required]"
              label="Travel Email *"
              variant="outlined"
            />
          </v-col>
        </v-row>
        <v-row class="mt-0 mx-3">
          <v-col cols="12">
            <v-textarea
              v-model="travelDeskTravelRequest.additionalInformation"
              label="Additional Information"
              variant="outlined"
              auto-grow
              counter
            />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import { computed, useTemplateRef, watch } from "vue"
import { isNil } from "lodash"

import { isPhoneNumber, isEmail, required } from "@/utils/validators"
import { type TravelDeskTravelRequest } from "@/api/travel-desk-travel-requests-api"

import DescriptionElement from "@/components/common/DescriptionElement.vue"
import StringDateInput from "@/components/common/StringDateInput.vue"
import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"

/**
 * TravelDeskTravelRequest contains traveller details fields:
 * - legalFirstName, legalMiddleName, legalLastName
 * - birthDate
 * - strAddress, city, province, postalCode
 * - isInternationalTravel
 * - passportNum, passportCountry (when international)
 * - busPhone, busEmail
 * - travelContact, travelPhone, travelEmail (when different from business contact)
 * - additionalInformation
 */
const travelDeskTravelRequest = defineModel<TravelDeskTravelRequest>({
  required: true,
})

const formattedTravelAuthorizationId = computed(() => {
  return travelDeskTravelRequest.value.travelAuthorizationId.toString().padStart(4, "0")
})
const dobMaxDate = computed(() => {
  const currentDate = new Date()
  currentDate.setFullYear(currentDate.getFullYear() - 18)
  return currentDate.toISOString().slice(0, 10)
})

watch(
  travelDeskTravelRequest,
  (newTravelDeskTravelRequest) => {
    if (newTravelDeskTravelRequest.isInternationalTravel === false) {
      newTravelDeskTravelRequest.passportNum = null
      newTravelDeskTravelRequest.passportCountry = null
    }

    if (newTravelDeskTravelRequest.travelContact === false) {
      newTravelDeskTravelRequest.travelPhone = null
      newTravelDeskTravelRequest.travelEmail = null
    }
  },
  {
    deep: true,
  }
)

const form = useTemplateRef("form")

async function validate() {
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
