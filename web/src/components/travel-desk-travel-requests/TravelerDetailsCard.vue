<template>
  <v-skeleton-loader
    v-if="isNil(travelDeskTravelRequest)"
    type="card"
  />
  <v-card
    v-else
    :loading="isLoading"
  >
    <v-card-title>
      <h3>Traveler Details</h3>
    </v-card-title>

    <v-divider></v-divider>

    <v-card-text>
      <dl>
        <v-row>
          <v-col
            cols="12"
            md="4"
          >
            <DescriptionElement
              label="Legal First Name"
              icon="mdi-account-details"
              :value="travelDeskTravelRequest.legalFirstName"
              vertical
            />
          </v-col>

          <v-col
            cols="12"
            md="4"
          >
            <DescriptionElement
              label="Legal Middle Name"
              icon="mdi-account-details"
              :value="travelDeskTravelRequest.legalMiddleName || 'N/A'"
              vertical
            />
          </v-col>

          <v-col
            cols="12"
            md="4"
          >
            <DescriptionElement
              label="Legal Last Name"
              icon="mdi-account-details"
              :value="travelDeskTravelRequest.legalLastName"
              vertical
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col
            cols="12"
            md="4"
          >
            <DescriptionElement
              label="Birth Date"
              icon="mdi-calendar"
              :value="travelDeskTravelRequest.birthDate"
              vertical
            />
          </v-col>

          <v-col
            cols="12"
            md="4"
          >
            <DescriptionElement
              label="Travel Auth"
              icon="mdi-key"
              :value="prettyTravelAuthorizationId"
              vertical
            />
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <v-row>
          <v-col
            cols="12"
            md="4"
          >
            <DescriptionElement
              label="Business Phone"
              icon="mdi-phone"
              :value="travelDeskTravelRequest.busPhone"
              vertical
            />
          </v-col>

          <v-col
            cols="12"
            md="4"
          >
            <DescriptionElement
              label="Business Email"
              icon="mdi-email"
              :value="travelDeskTravelRequest.busEmail"
              vertical
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col
            cols="12"
            md="4"
          >
            <DescriptionElement
              label="International Travel"
              icon="mdi-airplane"
              :value="travelDeskTravelRequest.isInternationalTravel ? 'Yes' : 'No'"
              vertical
            />
          </v-col>
        </v-row>

        <v-row v-if="travelDeskTravelRequest.isInternationalTravel">
          <v-col
            cols="12"
            md="4"
          >
            <DescriptionElement
              label="Passport Number"
              icon="mdi-passport"
              :value="travelDeskTravelRequest.passportNum"
              vertical
            />
          </v-col>

          <v-col
            cols="12"
            md="4"
          >
            <DescriptionElement
              label="Passport Country"
              icon="mdi-flag"
              :value="travelDeskTravelRequest.passportCountry"
              vertical
            />
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <v-row>
          <v-col
            cols="12"
            md="4"
          >
            <DescriptionElement
              label="Address"
              icon="mdi-home"
              :value="travelDeskTravelRequest.strAddress"
              vertical
            />
          </v-col>

          <v-col
            cols="12"
            md="4"
          >
            <DescriptionElement
              label="City"
              icon="mdi-city"
              :value="travelDeskTravelRequest.city"
              vertical
            />
          </v-col>

          <v-col
            cols="12"
            md="4"
          >
            <DescriptionElement
              label="Province"
              icon="mdi-map"
              :value="travelDeskTravelRequest.province"
              vertical
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col
            cols="12"
            md="4"
          >
            <DescriptionElement
              label="Postal Code"
              icon="mdi-mailbox"
              :value="travelDeskTravelRequest.postalCode"
              vertical
            />
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <v-row>
          <v-col
            cols="12"
            md="4"
          >
            <DescriptionElement
              label="Different Travel Contact"
              icon="mdi-account-switch"
              :value="travelDeskTravelRequest.travelContact ? 'Yes' : 'No'"
              vertical
            />
          </v-col>
        </v-row>

        <v-row v-if="travelDeskTravelRequest.travelContact">
          <v-col
            cols="12"
            md="4"
          >
            <DescriptionElement
              label="Travel Phone"
              icon="mdi-phone"
              :value="travelDeskTravelRequest.travelPhone"
              vertical
            />
          </v-col>

          <v-col
            cols="12"
            md="4"
          >
            <DescriptionElement
              label="Travel Email"
              icon="mdi-email"
              :value="travelDeskTravelRequest.travelEmail"
              vertical
            />
          </v-col>
        </v-row>

        <v-divider class="my-4"></v-divider>

        <v-row>
          <v-col cols="12">
            <DescriptionElement
              label="Additional Information"
              icon="mdi-text"
              :value="travelDeskTravelRequest?.additionalInformation || 'N/A'"
              vertical
            />
          </v-col>
        </v-row>
      </dl>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, toRefs } from "vue"
import { isNil } from "lodash"

import useTravelDeskTravelRequest from "@/use/use-travel-desk-travel-request"

import DescriptionElement from "@/components/common/DescriptionElement.vue"

const props = defineProps({
  travelDeskTravelRequestId: {
    type: Number,
    required: true,
  },
})

const { travelDeskTravelRequestId } = toRefs(props)
const { travelDeskTravelRequest, isLoading } = useTravelDeskTravelRequest(travelDeskTravelRequestId)

const prettyTravelAuthorizationId = computed(() => {
  return travelDeskTravelRequest.value.travelAuthorizationId.toString().padStart(5, "0")
})
</script>
