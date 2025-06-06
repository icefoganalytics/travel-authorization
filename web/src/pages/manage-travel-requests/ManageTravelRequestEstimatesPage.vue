<template>
  <div class="mt-4">
    <EstimatesTable :travel-authorization-id="travelAuthorizationIdAsNumber" />
  </div>
</template>

<script setup>
import { computed } from "vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"

import EstimatesTable from "@/modules/travel-authorizations/components/read-travel-authorization-estimate-page/EstimatesTable.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const travelAuthorizationIdAsNumber = computed(() => parseInt(props.travelAuthorizationId))

useBreadcrumbs([
  {
    text: "Manage Travel Requests",
    to: {
      name: "ManageTravelRequests",
    },
  },
  {
    text: "Estimates",
    to: {
      name: "manage-travel-requests/ManageTravelRequestEstimatesPage",
      params: {
        travelAuthorizationId: travelAuthorizationIdAsNumber,
      },
    },
  },
])
</script>
