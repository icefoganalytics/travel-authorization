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
          lazy-validation
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
                  outlined
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
                  outlined
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
        ref="travelDeskRentalCarsEditCard"
        class="mt-6"
        :travel-desk-travel-request-id="travelDeskTravelRequestIdAsNumber"
        :return-to="buildReturnTo('travel-desk-rental-cars-edit-card')"
      />

      <TravelDeskHotelsEditCard
        ref="travelDeskHotelsEditCard"
        class="mt-6"
        :travel-desk-travel-request-id="travelDeskTravelRequestIdAsNumber"
        :return-to="buildReturnTo('travel-desk-hotels-edit-card')"
      />

      <TravelDeskOtherTransportationEditCard
        ref="travelDeskOtherTransportationEditCard"
        class="mt-6"
        :travel-desk-travel-request-id="travelDeskTravelRequestIdAsNumber"
        :return-to="buildReturnTo('travel-desk-other-transportation-edit-card')"
      />

      <div class="d-flex flex-column flex-md-row">
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
          outlined
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
import { computed, ref, Ref, watchEffect } from "vue"
import { isNil } from "lodash"
import { type VForm } from "vuetify/lib/components"
import { useRouter, useRoute } from "vue2-helpers/vue-router"
import goTo from "vuetify/lib/services/goto"

import { required } from "@/utils/validators"

import useDisplayVuetify2 from "@/use/utils/use-display-vuetify2"
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

const { smAndDown } = useDisplayVuetify2()

const travelDeskTravelRequestIdAsNumber = computed(() => parseInt(props.travelDeskTravelRequestId))
const { travelDeskTravelRequest, isLoading, save } = useTravelDeskTravelRequest(
  travelDeskTravelRequestIdAsNumber
)

const form = ref<InstanceType<typeof VForm> | null>(null)
const snack = useSnack()

async function saveTravelDeskTravelRequest() {
  if (isNil(travelDeskTravelRequest.value)) return
  if (!form.value?.validate()) return

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

const travelDeskRentalCarsEditCard = ref<InstanceType<typeof TravelDeskRentalCarsEditCard> | null>(
  null
)
const travelDeskHotelsEditCard = ref<InstanceType<typeof TravelDeskHotelsEditCard> | null>(null)
const travelDeskOtherTransportationEditCard = ref<InstanceType<
  typeof TravelDeskOtherTransportationEditCard
> | null>(null)

const scrollToTargetMap: Record<string, Ref<{ $el?: Element } | null>> = {
  ["#travel-desk-rental-cars-edit-card"]: travelDeskRentalCarsEditCard,
  ["#travel-desk-hotels-edit-card"]: travelDeskHotelsEditCard,
  ["#travel-desk-other-transportation-edit-card"]: travelDeskOtherTransportationEditCard,
}

const route = useRoute()

watchEffect(() => {
  const { hash } = route
  if (isNil(hash)) return

  const targetRef = scrollToTargetMap[hash]
  if (isNil(targetRef)) return

  const componentRef = targetRef.value
  if (isNil(componentRef)) return

  const { $el } = componentRef
  if (isNil($el)) return

  const targetElement = toHTMLElement($el)
  if (isNil(targetElement)) return

  scrollToTarget(targetElement)
})

function toHTMLElement(element: Element): HTMLElement | null {
  return element instanceof HTMLElement ? element : null
}

function scrollToTarget(targetElement: HTMLElement) {
  return goTo(targetElement, {
    easing: "easeInOutCubic",
    offset: 75,
    duration: 300,
  })
}

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
    text: "Travel Request (Booking)",
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
