<template>
  <v-container>
    <h2 class="d-flex justify-space-between align-center">
      Meals and Incidental Expenses for Employees on Travel Status
      <v-btn
        v-if="isAdmin"
        class="primary"
        :to="{ name: 'administration/TravelRatesEditPage' }"
        >Edit</v-btn
      >
    </h2>

    <FullDayPerDiemsCard />
    <PartialDaysPerDiemsCard class="mt-6" />

    <v-card class="mt-6">
      <v-card-title><h3>Incidental expenses</h3></v-card-title>
      <IncidentalPerDiemsDataTable />
    </v-card>

    <PrivateVehicleTravelAllowanceCard class="mt-6" />
    <NonCommercialAccommodationTravelAllowanceCard class="mt-6" />

    <p class="mt-6">
      Source data
      <a
        href="https://yukon.ca/travel-rates"
        target="_blank"
        >Yukon Travel Rates</a
      >.
    </p>
  </v-container>
</template>

<script setup>
import useBreadcrumbs from "@/use/use-breadcrumbs"
import useCurrentUser from "@/use/use-current-user"

import FullDayPerDiemsCard from "@/components/per-diems/FullDayPerDiemsCard.vue"
import PartialDaysPerDiemsCard from "@/components/per-diems/PartialDaysPerDiemsCard.vue"
import IncidentalPerDiemsDataTable from "@/components/per-diems/IncidentalPerDiemsDataTable.vue"
import PrivateVehicleTravelAllowanceCard from "@/components/travel-allowances/PrivateVehicleTravelAllowanceCard.vue"
import NonCommercialAccommodationTravelAllowanceCard from "@/components/travel-allowances/NonCommercialAccommodationTravelAllowanceCard.vue"

const { isAdmin } = useCurrentUser()

useBreadcrumbs([
  {
    title: "Administration",
    to: { name: "AdministrationPage" },
  },
  {
    title: "Travel Rates",
    to: { name: "administration/TravelRatesPage" },
  },
])
</script>
