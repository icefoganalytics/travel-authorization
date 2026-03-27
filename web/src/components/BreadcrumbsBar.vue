<template>
  <SimpleBreadcrumbs
    :class="classes"
    :items="items"
  />
</template>

<script setup>
import SimpleBreadcrumbs from "@/components/SimpleBreadcrumbs.vue"

defineProps({
  items: {
    type: Array,
    required: true,
  },
  classes: {
    type: [String, Array, Object],
    default: "default-style",
  },
})
</script>

<style scoped>
.default-style {
  margin: -12px -24px 16px;
  padding: 16px 24px 16px;
}
</style>
