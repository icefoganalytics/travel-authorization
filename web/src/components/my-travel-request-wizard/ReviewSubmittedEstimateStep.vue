<template>
  <div>
    <EstimatesTable
      ref="estimatesTable"
      :travel-authorization-id="travelAuthorizationId"
    />
  </div>
</template>

<script setup>
import EstimatesTable from "@/modules/travel-authorizations/components/read-travel-authorization-estimate-page/EstimatesTable.vue"

defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

async function initialize(context) {
  context.setEditableSteps(["review-trip-details"])
}

defineExpose({
  initialize,
})
</script>
