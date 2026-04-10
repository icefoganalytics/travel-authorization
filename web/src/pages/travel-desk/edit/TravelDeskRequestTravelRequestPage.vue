<template>
  <v-sheet>
    <v-skeleton-loader
      v-if="isNil(travelDeskTravelRequest)"
      type="card@5"
    />
    <div
      v-else
      class="grey lighten-4"
    >
      <v-card>
        <v-card-title>
          <SectionHeader
            title="1. Booking Assignment"
            icon="mdi-briefcase-account-outline"
            tag="h4"
          />
        </v-card-title>
        <v-form
          id="booking-assignment-form"
          ref="form"
          validate-on="lazy"
          @submit.prevent="saveTravelDeskTravelRequest"
        >
          <v-card-text>
            <v-row>
              <v-col
                cols="12"
                md="6"
              >
                <TravelDeskTravelAgencySelect
                  v-model="travelDeskTravelRequest.travelAgencyId"
                  label="Assign Agency"
                  placeholder="None"
                  clearable
                  variant="outlined"
                  persistent-placeholder
                />
              </v-col>
              <v-col
                cols="12"
                md="6"
              >
                <UserTravelDeskAgentSelect
                  v-model="travelDeskTravelRequest.travelDeskOfficer"
                  label="Travel Desk Agent Assigned *"
                  :rules="[required]"
                  variant="outlined"
                  required
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-form>
      </v-card>

      <TravelDeskFlightRequestsManageCard
        class="mt-6"
        :travel-desk-travel-request-id="travelDeskTravelRequestIdAsNumber"
        show-flight-options
      />

      <TravelDeskRentalCarsEditCard
        id="travel-desk-rental-cars-edit-card"
        class="mt-6"
        :travel-desk-travel-request-id="travelDeskTravelRequestIdAsNumber"
        :return-to="buildReturnTo('travel-desk-rental-cars-edit-card')"
      />

      <TravelDeskHotelsEditCard
        id="travel-desk-hotels-edit-card"
        class="mt-6"
        :travel-desk-travel-request-id="travelDeskTravelRequestIdAsNumber"
        :return-to="buildReturnTo('travel-desk-hotels-edit-card')"
      />

      <TravelDeskOtherTransportationEditCard
        id="travel-desk-other-transportation-edit-card"
        class="mt-6"
        :travel-desk-travel-request-id="travelDeskTravelRequestIdAsNumber"
        :return-to="buildReturnTo('travel-desk-other-transportation-edit-card')"
      />

      <div class="d-flex flex-column flex-md-row ga-2 my-4">
        <v-btn
          color="primary"
          form="booking-assignment-form"
          type="submit"
          :loading="isLoading"
          :block="smAndDown"
        >
          Save Booking Details
        </v-btn>
        <v-spacer />
        <v-btn
          color="warning"
          variant="outlined"
          :to="{
            name: 'travel-desk/edit/TravelDeskRequestTravelerDetailsPage',
            params: {
              travelDeskTravelRequestId: props.travelDeskTravelRequestId,
            },
          }"
          :loading="isLoading"
          :block="smAndDown"
        >
          Back
        </v-btn>
      </div>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useRouteHash } from "@vueuse/router"
import { isNil } from "lodash"
import { useDisplay, useGoTo } from "vuetify"
import { type VForm } from "vuetify/components"
import { useRouter } from "vue-router"

import { required } from "@/utils/validators"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useSnack from "@/use/use-snack"
import useTravelDeskTravelRequest from "@/use/use-travel-desk-travel-request"

import SectionHeader from "@/components/common/SectionHeader.vue"
import TravelDeskFlightRequestsManageCard from "@/components/travel-desk-flight-requests/TravelDeskFlightRequestsManageCard.vue"
import TravelDeskHotelsEditCard from "@/components/travel-desk-hotels/TravelDeskHotelsEditCard.vue"
import TravelDeskOtherTransportationEditCard from "@/components/travel-desk-other-transportations/TravelDeskOtherTransportationEditCard.vue"
import TravelDeskRentalCarsEditCard from "@/components/travel-desk-rental-cars/TravelDeskRentalCarsEditCard.vue"
import TravelDeskTravelAgencySelect from "@/components/travel-desk-travel-agencies/TravelDeskTravelAgencySelect.vue"
import UserTravelDeskAgentSelect from "@/components/users/UserTravelDeskAgentSelect.vue"

const props = defineProps<{
  travelDeskTravelRequestId: string
}>()

const { smAndDown } = useDisplay()
const goTo = useGoTo()

const travelDeskTravelRequestIdAsNumber = computed(() => parseInt(props.travelDeskTravelRequestId))
const { travelDeskTravelRequest, isLoading, save } = useTravelDeskTravelRequest(
  travelDeskTravelRequestIdAsNumber
)

const form = ref<InstanceType<typeof VForm> | null>(null)
const snack = useSnack()

async function saveTravelDeskTravelRequest() {
  if (isNil(travelDeskTravelRequest.value)) return
  if (isNil(form.value)) return

  const { valid } = await form.value.validate()
  if (!valid) {
    snack.warning("Please fill in all required fields.")
    return
  }

  isLoading.value = true
  try {
    await save()
    snack.success("Booking details saved successfully!")
  } catch (error) {
    console.error(`Failed to save travel desk travel request: ${error}`, { error })
    snack.error(`Failed to save: ${error}`)
  } finally {
    isLoading.value = false
  }
}

const router = useRouter()
const routeHash = useRouteHash()

function buildReturnTo(hash: string) {
  const routeLocation = router.resolve({
    name: "travel-desk/edit/TravelDeskRequestTravelRequestPage",
    params: {
      travelDeskTravelRequestId: props.travelDeskTravelRequestId,
    },
    hash: `#${hash}`,
  })
  return routeLocation.href
}

watch(
  routeHash,
  (newRouteHash) => {
    if (isNil(newRouteHash) || newRouteHash.length === 0) return

    goTo(newRouteHash, {
      easing: "easeInOutCubic",
      offset: 75,
      duration: 300,
    })
  },
  { flush: "post" }
)

const breadcrumbs = computed(() => [
  {
    title: "Travel Desk",
    to: {
      name: "TravelDeskPage",
    },
  },
  {
    title: "Request",
    to: {
      name: "travel-desk/TravelDeskRequestPage",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
      },
    },
  },
  {
    title: "Edit",
    to: {
      name: "travel-desk/TravelDeskRequestEditRedirect",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
      },
    },
  },
  {
    title: "Travel Request (Booking)",
    to: {
      name: "travel-desk/edit/TravelDeskRequestTravelRequestPage",
      params: {
        travelDeskTravelRequestId: props.travelDeskTravelRequestId,
      },
    },
  },
])
useBreadcrumbs(breadcrumbs)
</script>

<style scoped></style>
