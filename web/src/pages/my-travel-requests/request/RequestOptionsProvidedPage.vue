<template>
  <v-container class="mx-0 mx-md-auto px-0 px-md-4">
    <v-skeleton-loader
      v-if="isNil(travelDeskTravelRequestId) && !isErrored"
      type="card"
    />
    <v-alert
      v-else-if="isErrored"
      type="error"
    >
      Failed to fetch travel desk travel request.
    </v-alert>
    <template v-else>
      <v-card>
        <v-card-title>
          <h3>Rank Options</h3>
        </v-card-title>
        <v-card-text class="px-0 px-md-4">
          <TravelDeskFlightRequestsCard
            class="card--outlined"
            :travel-desk-travel-request-id="travelDeskTravelRequestId"
          />
          <TravelDeskFlightRequestFlightOptionsOrderCard
            ref="travelDeskFlightRequestFlightOptionsOrderCard"
            class="mt-8"
            :travel-desk-travel-request-id="travelDeskTravelRequestId"
          />
        </v-card-text>
      </v-card>
    </template>
  </v-container>
</template>

<script setup>
import { computed, ref, toRefs } from "vue"
import { isNil } from "lodash"

import travelDeskTravelRequestsApi from "@/api/travel-desk-travel-requests-api"
import useBreadcrumbs from "@/use/use-breadcrumbs"
import useSnack from "@/use/use-snack"
import useTravelAuthorization from "@/use/use-travel-authorization"
import useTravelDeskTravelRequests from "@/use/use-travel-desk-travel-requests"

import TravelDeskFlightRequestFlightOptionsOrderCard from "@/components/travel-desk-flight-requests/TravelDeskFlightRequestFlightOptionsOrderCard.vue"
import TravelDeskFlightRequestsCard from "@/components/travel-desk-flight-requests/TravelDeskFlightRequestsCard.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: [String, Number],
    required: true,
  },
})

const travelAuthorizationIdAsNumber = computed(() => parseInt(props.travelAuthorizationId))

// TODO: Consider loading travelAuthorization and pulling travelDeskTravel request from there.
const travelDeskTravelRequestQueryOptions = computed(() => ({
  where: {
    travelAuthorizationId: travelAuthorizationIdAsNumber.value,
  },
  perPage: 1,
}))
const { travelDeskTravelRequests, isErrored } = useTravelDeskTravelRequests(
  travelDeskTravelRequestQueryOptions
)

const travelDeskTravelRequestId = computed(() => {
  return travelDeskTravelRequests.value[0]?.id
})

const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization } = useTravelAuthorization(travelAuthorizationId)

/** @type {import("vue").Ref<InstanceType<typeof TravelDeskFlightRequestFlightOptionsOrderCard> | null>} */
const travelDeskFlightRequestFlightOptionsOrderCard = ref(null)

const snack = useSnack()

async function save() {
  try {
    const flightOptionSavingResult =
      await travelDeskFlightRequestFlightOptionsOrderCard.value?.save()
    if (!flightOptionSavingResult) return false

    await travelDeskTravelRequestsApi.optionsRanked(travelDeskTravelRequestId.value)
    return true
  } catch (error) {
    console.error(error)
    snack.error(`Failed to submit options rankings: ${error}`)
    return false
  }
}

const breadcrumbs = computed(() => [
  {
    text: "My Travel Requests",
    to: {
      name: "my-travel-requests/MyTravelRequestsPage",
    },
  },
  {
    text: travelAuthorization.value?.eventName || "loading ...",
    to: {
      name: "my-travel-requests/request/RequestPage",
      params: { travelAuthorizationId: travelAuthorizationId.value },
    },
  },
  {
    text: "Rank Options",
    to: {
      name: "my-travel-requests/request/RequestOptionsProvidedPage",
      params: { travelAuthorizationId: travelAuthorizationId.value },
    },
  },
])
useBreadcrumbs(breadcrumbs)

defineExpose({
  continue: save,
})
</script>
