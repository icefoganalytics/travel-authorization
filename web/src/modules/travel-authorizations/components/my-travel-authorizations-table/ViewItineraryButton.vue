<template>
  <v-btn
    class="ma-0"
    color="secondary"
    @click.stop="viewItinerary"
  >
    View Itinerary
  </v-btn>
</template>

<script setup lang="ts">
const props = defineProps<{
  travelAuthorizationId: number
}>()

function viewItinerary() {
  alert(`TODO: view itinerary for travel authorization ${props.travelAuthorizationId}`)
}
</script>
