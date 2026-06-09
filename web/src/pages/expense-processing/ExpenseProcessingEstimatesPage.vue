<template>
  <div class="mt-4">
    <HeaderActionsCard title="Estimates">
      <EstimatesDataTableServer
        :where="estimatesWhere"
        route-query-suffix="Estimates"
      />
    </HeaderActionsCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"

import HeaderActionsCard from "@/components/common/HeaderActionsCard.vue"
import EstimatesDataTableServer from "@/components/expenses/EstimatesDataTableServer.vue"

const props = defineProps<{
  travelAuthorizationId: string
}>()

const travelAuthorizationIdAsNumber = computed(() => parseInt(props.travelAuthorizationId))

const estimatesWhere = computed(() => ({
  travelAuthorizationId: travelAuthorizationIdAsNumber.value,
}))
</script>
