<template>
  <v-sheet>
    <v-skeleton-loader
      v-if="isNil(travelDeskTravelRequest)"
      type="card@4"
    />
    <div
      v-else
      class="grey lighten-4"
    >
      <TravelDeskFlightRequestsManageCard
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

      <div class="d-flex flex-column flex-md-row mt-6">
        <v-btn
          :to="{
            name: 'TravelDeskPage',
          }"
          :loading="isLoading"
          :block="smAndDown"
        >
          Return
        </v-btn>
      </div>
    </div>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed, ref, Ref, watchEffect } from "vue"
import { isNil } from "lodash"
import { useRouter, useRoute } from "vue2-helpers/vue-router"
import goTo from "vuetify/lib/services/goto"

import useDisplayVuetify2 from "@/use/utils/use-display-vuetify2"
import useBreadcrumbs from "@/use/use-breadcrumbs"
import useTravelDeskTravelRequest from "@/use/use-travel-desk-travel-request"

import TravelDeskFlightRequestsManageCard from "@/components/travel-desk-flight-requests/TravelDeskFlightRequestsManageCard.vue"
import TravelDeskHotelsEditCard from "@/components/travel-desk-hotels/TravelDeskHotelsEditCard.vue"
import TravelDeskOtherTransportationEditCard from "@/components/travel-desk-other-transportations/TravelDeskOtherTransportationEditCard.vue"
import TravelDeskRentalCarsEditCard from "@/components/travel-desk-rental-cars/TravelDeskRentalCarsEditCard.vue"

const props = defineProps<{
  travelDeskTravelRequestId: string
}>()

const { smAndDown } = useDisplayVuetify2()

const travelDeskTravelRequestIdAsNumber = computed(() => parseInt(props.travelDeskTravelRequestId))
const { travelDeskTravelRequest, isLoading } = useTravelDeskTravelRequest(
  travelDeskTravelRequestIdAsNumber
)

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
