<template>
  <v-btn
    class="ma-0"
    variant="outlined"
    :to="{
      name: 'my-travel-requests/MyTravelRequestWizardPage',
      params: {
        travelAuthorizationId,
        stepName: 'submit-to-travel-desk',
      },
    }"
    @click.stop
  >
    Submit Travel Desk Request
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
