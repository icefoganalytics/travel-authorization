<template>
  <v-list-item
    v-if="isInDevelopmentOrUserAcceptanceTesting"
    :to="{
      name: 'Qa-Scenarios',
    }"
  >
    <v-list-item-icon>
      <v-icon>mdi-tools</v-icon>
    </v-list-item-icon>
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
