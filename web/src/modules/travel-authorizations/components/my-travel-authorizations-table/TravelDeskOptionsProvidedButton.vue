<template>
  <v-btn
    class="ma-0"
    variant="outlined"
    :to="{
      name: 'my-travel-requests/MyTravelRequestWizardPage',
      params: {
        travelAuthorizationId,
        stepName: 'rank-flight-options',
      },
    }"
    @click.stop
  >
    Rank Travel Desk Options
  </v-btn>
</template>

<script setup>
defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})
</script>
