<template>
  <v-sheet>
    <v-skeleton-loader
      v-if="isNil(travelDeskTravelRequest)"
      type="card@2"
    />
    <v-form
      v-else
      ref="form"
      class="grey lighten-4"
      lazy-validation
      @submit.prevent="saveTravelDeskTravelRequest"
    >
      <v-card>
        <v-card-title>
          <SectionHeader
            title="1. Personal Information"
            icon="mdi-account-outline"
            tag="h4"
          />
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col
              cols="12"
              md="3"
            >
              <v-text-field
                v-model="travelDeskTravelRequest.legalFirstName"
                label="Legal First Name *"
                :rules="[required]"
                outlined
              />
            </v-col>
            <v-col
              cols="12"
              md="3"
            >
              <v-text-field
                v-model="travelDeskTravelRequest.legalMiddleName"
                label="Legal Middle Name"
                outlined
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
                outlined
              />
            </v-col>
            <v-col
              cols="12"
              md="3"
            >
              <v-text-field
                v-model="travelDeskTravelRequest.birthDate"
                label="Birth Date *"
                type="date"
                :max="dobMaxDate"
                :rules="[required]"
                outlined
              />
            </v-col>
          </v-row>
          <v-sheet class="grey lighten-4 rounded-lg px-4 mb-4">
            <v-row>
              <v-col>
                <YesNoRowRadioGroup
                  v-model="travelDeskTravelRequest.isInternationalTravel"
                  label="Travelling Internationally?"
                  class="mt-1"
                />
              </v-col>
            </v-row>
            <v-row v-if="travelDeskTravelRequest.isInternationalTravel">
              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="travelDeskTravelRequest.passportNum"
                  label="Passport Number *"
                  :rules="[required]"
                  outlined
                />
              </v-col>
              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="travelDeskTravelRequest.passportCountry"
                  label="Passport Country *"
                  :rules="[required]"
                  outlined
                />
              </v-col>
            </v-row>
          </v-sheet>
        </v-card-text>
      </v-card>

      <v-card class="mt-6">
        <v-card-title>
          <SectionHeader
            title="2. Contact Information"
            icon="mdi-card-account-mail-outline"
            tag="h4"
          />
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="travelDeskTravelRequest.busPhone"
                :rules="[isPhoneNumber, required]"
                label="Business Phone *"
                outlined
                validate-on-blur
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="travelDeskTravelRequest.busEmail"
                :rules="[isEmail, required]"
                label="Business Email *"
                outlined
                validate-on-blur
              />
            </v-col>
          </v-row>
          <v-sheet class="grey lighten-4 rounded-lg px-4 mb-4">
            <v-row>
              <v-col
                cols="12"
                md="6"
              >
                <YesNoRowRadioGroup
                  v-model="travelContactAsBoolean"
                  label="Contact information different for travel"
                  class="mt-1"
                />
              </v-col>
            </v-row>
            <v-row v-if="travelDeskTravelRequest.travelContact">
              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="travelDeskTravelRequest.travelPhone"
                  :rules="[isPhoneNumber, required]"
                  label="Travel Phone *"
                  outlined
                />
              </v-col>
              <v-col
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="travelDeskTravelRequest.travelEmail"
                  :rules="[isEmail, required]"
                  label="Travel Email *"
                  outlined
                />
              </v-col>
            </v-row>
          </v-sheet>
        </v-card-text>
      </v-card>

      <v-card class="mt-6">
        <v-card-title>
          <SectionHeader
            title="2. Home Address"
            icon="mdi-map-marker-outline"
            tag="h4"
          />
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="travelDeskTravelRequest.strAddress"
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
                v-model="travelDeskTravelRequest.city"
                label="City *"
                item-value="city"
                :rules="[required]"
                outlined
              />
            </v-col>
            <v-col
              cols="12"
              md="3"
            >
              <v-text-field
                v-model="travelDeskTravelRequest.province"
                label="Province *"
                :rules="[required]"
                outlined
              />
            </v-col>
            <v-col
              cols="12"
              md="3"
            >
              <v-text-field
                v-model="travelDeskTravelRequest.postalCode"
                label="Postal Code *"
                :rules="[required]"
                outlined
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <v-card class="mt-6">
        <v-card-title>
          <SectionHeader
            title="3. Additional Information"
            icon="mdi-help-circle-outline"
            tag="h4"
          />
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col cols="12">
              <v-textarea
                v-model="travelDeskTravelRequest.additionalInformation"
                label="Additional Information"
                outlined
                auto-grow
                counter
              />
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

      <div class="d-flex flex-column flex-md-row">
        <v-btn
          color="primary"
          :loading="isLoading"
          :block="smAndDown"
          @click="saveTravelDeskTravelRequest"
          >Save Details
        </v-btn>
        <v-btn
          class="ml-md-2"
          outlined
          :loading="isLoading"
          :block="smAndDown"
          @click="refresh"
        >
          Reset</v-btn
        >
        <v-spacer />
        <v-btn
          :to="{
            name: 'TravelDeskPage',
          }"
          :loading="isLoading"
          :block="smAndDown"
          >Return
        </v-btn>
      </div>
    </v-form>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed, watchEffect } from "vue"
import { isNil } from "lodash"

import { isPhoneNumber, isEmail, required } from "@/utils/validators"

import useDisplayVuetify2 from "@/use/utils/use-display-vuetify2"
import useBreadcrumbs from "@/use/use-breadcrumbs"
import useSnack from "@/use/use-snack"
import useTravelDeskTravelRequest from "@/use/use-travel-desk-travel-request"

import SectionHeader from "@/components/common/SectionHeader.vue"
import YesNoRowRadioGroup from "@/components/common/YesNoRowRadioGroup.vue"

import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"

const props = defineProps<{
  travelDeskTravelRequestId: string
}>()

const travelDeskTravelRequestIdAsNumber = computed(() => parseInt(props.travelDeskTravelRequestId))
const { travelDeskTravelRequest, isLoading, save, refresh } = useTravelDeskTravelRequest(
  travelDeskTravelRequestIdAsNumber
)

const dobMaxDate = computed(() => {
  const currentDate = new Date()
  currentDate.setFullYear(currentDate.getFullYear() - 18)
  return currentDate.toISOString().slice(0, 10)
})

watchEffect(() => {
  if (isNil(travelDeskTravelRequest.value)) return

  const { isInternationalTravel } = travelDeskTravelRequest.value
  if (isInternationalTravel === false) {
    travelDeskTravelRequest.value.passportNum = null
    travelDeskTravelRequest.value.passportCountry = null
  }
})

const travelContactAsBoolean = computed({
  get() {
    return travelDeskTravelRequest.value?.travelContact ?? false
  },
  set(value: boolean) {
    if (isNil(travelDeskTravelRequest.value)) return

    travelDeskTravelRequest.value.travelContact = value
  },
})

watchEffect(() => {
  if (isNil(travelDeskTravelRequest.value)) return

  const { travelContact } = travelDeskTravelRequest.value
  if (travelContact === false) {
    travelDeskTravelRequest.value.travelPhone = null
    travelDeskTravelRequest.value.travelEmail = null
  }
})

const snack = useSnack()

async function saveTravelDeskTravelRequest() {
  if (isNil(travelDeskTravelRequest.value)) return

  isLoading.value = true
  try {
    await save()
    snack.success("Traveler details saved successfully!")
  } catch (error) {
    console.error(`Failed to save travel desk travel request: ${error}`, { error })
    snack.error(`Failed to save: ${error}`)
  } finally {
    isLoading.value = false
  }
}

const { smAndDown } = useDisplayVuetify2()

const breadcrumbs = computed(() => [
  {
    text: "Travel Desk",
    to: {
      name: "TravelDeskPage",
    },
  },
  {
    text: "Request",
    to: {
      name: "travel-desk/TravelDeskRequestPage",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
      },
    },
  },
  {
    text: "Edit",
    to: {
      name: "travel-desk/TravelDeskRequestEditPage",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
      },
    },
  },
  {
    text: "Traveler Details",
    to: {
      name: "travel-desk/edit/TravelDeskRequestTravelerDetailsPage",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
      },
    },
  },
])
useBreadcrumbs(breadcrumbs)
</script>
