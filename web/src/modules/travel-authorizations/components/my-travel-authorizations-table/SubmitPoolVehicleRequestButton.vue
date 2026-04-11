<template>
  <v-btn
    class="ma-0"
    variant="outlined"
    @click.stop="submitPoolVehicleRequest"
  >
    Submit Pool Vehicle Request
  </v-btn>
</template>

<script setup lang="ts">
const props = defineProps<{
  travelAuthorizationId: number
}>()

function submitPoolVehicleRequest() {
  alert(`TODO: submit pool vehicle request for travel authorization ${props.travelAuthorizationId}`)
}
</script>
