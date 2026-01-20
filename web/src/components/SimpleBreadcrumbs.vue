<template>
  <v-breadcrumbs
    :items="breadcrumbsWithExactTrueByDefault"
    large
  >
    <template #divider>/</template>
  </v-breadcrumbs>
</template>

<script setup>
import { computed } from "vue"

const props = defineProps({
  items: {
    type: Array,
    required: true,
  },
})

// "Fixes" https://v2.vuetifyjs.com/en/components/breadcrumbs/#caveats
// By default v-breadcrumbs will disable all crumbs up to the current page in a nested paths.
// You can prevent this behavior by using exact: true on each applicable breadcrumb in the items array.
const breadcrumbsWithExactTrueByDefault = computed(() =>
  props.items.map((item) => ({
    ...item,
    exact: item.exact ?? true,
  }))
)
</script>
