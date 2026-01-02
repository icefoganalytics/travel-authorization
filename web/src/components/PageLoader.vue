<template>
  <!-- Vuetify v2 fill-height becomes Vuetify v3 h-screen -->
  <div class="d-flex justify-center align-center fill-height fill-width">
    <div class="d-flex flex-column align-center">
      <v-progress-circular
        indeterminate
        size="64"
        class="mb-5"
        color="primary"
      ></v-progress-circular>
      <h1 class="text-center">{{ message }}</h1>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    message?: string
  }>(),
  {
    message: "Loading ...",
  }
)
</script>

<style scoped>
.fill-width {
  width: 100%;
}
</style>
