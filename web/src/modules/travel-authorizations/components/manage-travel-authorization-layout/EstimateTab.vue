<template>
  <v-tab
    :to="{
      name: 'manage-travel-requests/ManageTravelRequestEstimatesPage',
      params: { travelAuthorizationId },
    }"
    >Estimate</v-tab
  >
</template>

<script>
export default {
  name: "EstimateTab",
  props: {
    travelAuthorizationId: {
      type: Number,
      required: true,
    },
  },
}
</script>
