<template>
  <v-container>
    <h2 class="d-flex justify-space-between align-center">
      Edit Meals and Incidental Expenses for Employees on Travel Status
      <v-btn
        class="secondary"
        outlined
        :to="{ name: 'administration/TravelRatesPage' }"
        >Back</v-btn
      >
    </h2>

    <EditPerDiemsCard />
    <EditTravelAllowancesCard class="mt-6" />
  </v-container>
</template>

<script setup>
import useBreadcrumbs from "@/use/use-breadcrumbs"

import EditPerDiemsCard from "@/components/per-diems/EditPerDiemsCard.vue"
import EditTravelAllowancesCard from "@/components/travel-allowances/EditTravelAllowancesCard.vue"

useBreadcrumbs([
  {
    text: "Administration",
    to: { name: "AdministrationPage" },
  },
  {
    text: "Travel Rates",
    to: { name: "administration/TravelRatesPage" },
  },
  {
    text: "Edit",
    to: { name: "administration/TravelRatesEditPage" },
  },
])
</script>
