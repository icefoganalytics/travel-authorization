<template>
  <div>
    <!-- TODO: move this into the top level layout, once everything is using this layout -->
    <SimpleBreadcrumbs
      class="grey lighten-4 mt-n3 mb-4"
      :items="breadcrumbs"
    />

    <router-view />
  </div>
</template>

<script setup>
import useBreadcrumbs from "@/use/use-breadcrumbs"

import SimpleBreadcrumbs from "@/components/SimpleBreadcrumbs.vue"

const { breadcrumbs } = useBreadcrumbs()
</script>
