<template>
  <v-container class="px-0 px-md-6">
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
    TODO: Build travel desk travel request rank options page.
  </v-container>
</template>

<script setup>
import { computed, toRefs } from "vue"
import { isNil } from "lodash"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useTravelAuthorization from "@/use/use-travel-authorization"
import useTravelDeskTravelRequests from "@/use/use-travel-desk-travel-requests"

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
</script>
