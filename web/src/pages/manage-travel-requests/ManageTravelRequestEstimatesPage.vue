<template>
  <div>
    <HeaderActionsCard title="Estimates">
      <EstimatesDataTable :travel-authorization-id="travelAuthorizationIdAsNumber" />
    </HeaderActionsCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"

import HeaderActionsCard from "@/components/common/HeaderActionsCard.vue"

import EstimatesDataTable from "@/components/expenses/EstimatesDataTable.vue"

const props = defineProps<{
  travelAuthorizationId: string
}>()

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
