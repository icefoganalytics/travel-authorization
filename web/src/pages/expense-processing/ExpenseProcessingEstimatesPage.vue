<template>
  <div class="mt-4">
    <EstimatesDataTableServer
      :where="estimatesWhere"
      route-query-suffix="Estimates"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"

import EstimatesDataTableServer from "@/components/expenses/EstimatesDataTableServer.vue"

const props = defineProps<{
  travelAuthorizationId: string
}>()

const travelAuthorizationIdAsNumber = computed(() => parseInt(props.travelAuthorizationId))

const estimatesWhere = computed(() => ({
  travelAuthorizationId: travelAuthorizationIdAsNumber.value,
}))
</script>
