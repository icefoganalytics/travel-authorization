<template>
  <PageLoader message="Loading trip details ..." />
</template>

<script setup>
import { onMounted } from "vue"
import { useRouter } from "vue2-helpers/vue-router"
import { isNil } from "lodash"

import travelAuthorizationsApi from "@/api/travel-authorizations-api"
import travelSegmentsApi from "@/api/travel-segments-api"

import PageLoader from "@/components/PageLoader.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: String,
    required: true,
  },
})

const router = useRouter()

onMounted(async () => {
  const travelAuthorizationIdAsNumber = parseInt(props.travelAuthorizationId)
  const { travelAuthorization } = await travelAuthorizationsApi.get(travelAuthorizationIdAsNumber)
  const { isApproved } = travelAuthorization
  if (!isApproved) {
    return router.replace({
      name: "manage-travel-requests/ManageTravelRequestDetailsEditTripDetailsEstimatesPage",
      params: {
        travelAuthorizationId: props.travelAuthorizationId,
      },
    })
  }

  const travelSegmentsQuery = {
    where: {
      travelAuthorizationId: props.travelAuthorizationId,
      isActual: false,
    },
    perPage: 1, // we only need the first travel segment to check if travel has started
  }
  const { travelSegments } = await travelSegmentsApi.list(travelSegmentsQuery)
  const firstTravelSegment = travelSegments.at(0)
  if (isNil(firstTravelSegment)) {
    return router.replace({
      name: "manage-travel-requests/ManageTravelRequestDetailsEditTripDetailsEstimatesPage",
      params: {
        travelAuthorizationId: props.travelAuthorizationId,
      },
    })
  }

  const { departureOn } = firstTravelSegment
  const isBeforeTravelStartDate = new Date(departureOn) > new Date()
  if (isBeforeTravelStartDate) {
    return router.replace({
      name: "manage-travel-requests/ManageTravelRequestDetailsEditTripDetailsEstimatesPage",
      params: {
        travelAuthorizationId: props.travelAuthorizationId,
      },
    })
  } else {
    return router.replace({
      name: "manage-travel-requests/ManageTravelRequestDetailsEditTripDetailsActualsPage",
      params: {
        travelAuthorizationId: props.travelAuthorizationId,
      },
    })
  }
})
</script>
