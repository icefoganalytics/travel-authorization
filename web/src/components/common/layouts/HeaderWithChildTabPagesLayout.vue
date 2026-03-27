<template>
  <v-sheet class="grey lighten-4">
    <v-card-title class="d-flex justify-space-between align-baseline">
      <h2>
        {{ title }}
      </h2>
      <slot name="append" />
    </v-card-title>
    <v-tabs
      show-arrows
      background-color="grey lighten-4"
    >
      <v-tab
        v-for="tab in tabs"
        :key="tab.value"
        :to="tab.to"
      >
        {{ tab.title }}
      </v-tab>
    </v-tabs>

    <router-view class="mt-6" />
  </v-sheet>
</template>

<script setup lang="ts">
import { type Location } from "vue-router"

export interface Tab {
  value: number
  title: string
  icon?: string
  to: Location
}

defineProps<{
  title: string
  tabs: Tab[]
}>()
</script>
