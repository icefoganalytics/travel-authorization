<template>
  <v-card>
    <v-card-title>
      <h2>Awaiting Booking</h2>
    </v-card-title>

    <v-card-text>
      <p>
        You have ranked your flight options and are waiting to hear back from the travel desk about
        your booking confirmation or follow-up.
      </p>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, toRefs } from "vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useTravelAuthorization from "@/use/use-travel-authorization"

const props = defineProps({
  travelAuthorizationId: {
    type: [String, Number],
    required: true,
  },
})

const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization } = useTravelAuthorization(travelAuthorizationId)

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
      name: "my-travel-requests/details/DetailsPage",
      params: { travelAuthorizationId: travelAuthorizationId.value },
    },
  },
])
useBreadcrumbs(breadcrumbs)
</script>
