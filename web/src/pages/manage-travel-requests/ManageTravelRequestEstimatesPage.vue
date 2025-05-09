<template>
  <div class="mt-4">
    <EstimatesTable :travel-authorization-id="travelAuthorizationIdAsNumber" />
  </div>
</template>

<script setup>
import { computed } from "vue"

import EstimatesTable from "@/modules/travel-authorizations/components/read-travel-authorization-estimate-page/EstimatesTable"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const travelAuthorizationIdAsNumber = computed(() => parseInt(props.travelAuthorizationId))
</script>
