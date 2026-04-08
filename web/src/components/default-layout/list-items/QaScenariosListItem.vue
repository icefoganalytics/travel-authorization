<template>
  <v-list-item
    v-if="isInDevelopmentOrUserAcceptanceTesting"
    :to="{
      name: 'qa/ScenariosListPage',
    }"
    prepend-icon="mdi-tools"
  >
    <v-list-item-title>QA Scenarios</v-list-item-title>
  </v-list-item>
</template>

<script setup lang="ts">
import { computed } from "vue"

import { ENVIRONMENT } from "@/config"

const isInDevelopmentOrUserAcceptanceTesting = computed(() => {
  return (
    ENVIRONMENT === "development" || window.location.hostname === "travel-auth-dev.ynet.gov.yk.ca"
  )
})
</script>
