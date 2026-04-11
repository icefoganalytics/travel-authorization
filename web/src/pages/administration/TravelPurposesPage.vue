<template>
  <div>
    <v-alert color="warning"> Page is not yet implemented </v-alert>

    <h1>Travel Purposes</h1>
    <v-card>
      <v-card-text> Admin table for travel purpose </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import useBreadcrumbs from "@/use/use-breadcrumbs"

useBreadcrumbs([
  {
    title: "Administration",
    to: {
      name: "AdministrationPage",
    },
  },
  {
    title: "Travel Purposes",
    to: {
      name: "administration/TravelPurposesPage",
    },
  },
])
</script>
