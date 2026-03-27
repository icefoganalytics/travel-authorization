<template>
  <component
    :is="tag"
    class="primary--text"
    :class="headerClass"
  >
    <v-icon
      color="primary"
      size="28"
      class="mr-2"
    >
      {{ icon }}
    </v-icon>
    {{ title }}
  </component>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    icon: string
    tag?: string
    headerClass?: string
  }>(),
  {
    tag: "h3",
    headerClass: "",
  }
)
</script>
