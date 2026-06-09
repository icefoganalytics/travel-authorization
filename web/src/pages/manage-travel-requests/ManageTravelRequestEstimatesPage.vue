<template>
  <div>
    <HeaderActionsCard title="Estimates">
      <EstimatesTable :travel-authorization-id="travelAuthorizationIdAsNumber" />
    </HeaderActionsCard>
  </div>
</template>

<script setup>
import { computed } from "vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"

import HeaderActionsCard from "@/components/common/HeaderActionsCard.vue"

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
    title: "Manage Travel Requests",
    to: {
      name: "ManageTravelRequests",
    },
  },
  {
    title: "Estimates",
    to: {
      name: "manage-travel-requests/ManageTravelRequestEstimatesPage",
      params: {
        travelAuthorizationId: travelAuthorizationIdAsNumber,
      },
    },
  },
])
</script>
