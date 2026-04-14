<template>
  <v-row>
    <v-col
      v-for="(menuCardList, index) in menuCardLists"
      :key="index"
      cols="12"
      md="4"
    >
      <v-card class="default">
        <v-card-title>{{ menuCardList.title }}</v-card-title>
        <v-list class="pb-0 pt-0">
          <v-list-item
            v-for="(item, itemIndex) in menuCardList.items"
            :key="itemIndex"
            :to="item.to"
            :prepend-icon="item.icon"
            :title="item.title"
          />
        </v-list>
      </v-card>
    </v-col>
  </v-row>
</template>
<script setup>
import useBreadcrumbs from "@/use/use-breadcrumbs"

const menuCardLists = [
  {
    title: "User Management",
    items: [
      {
        icon: "mdi-account-group",
        title: "User Management",
        to: { name: "administration/UsersPage" },
      },
    ],
  },
  {
    title: "Rates and Estimates",
    items: [
      {
        icon: "mdi-wallet-membership",
        title: "Flight Estimate",
        to: { name: "administration/FlightEstimatesPage" },
      },
      {
        icon: "mdi-database",
        title: "Pool Car Costs",
        to: { name: "administration/PoolCarCostsPage" },
      },
      {
        icon: "mdi-shape",
        title: "Rental Car Estimates",
        to: { name: "administration/RentalCarEstimatesPage" },
      },
      {
        icon: "mdi-bug",
        title: "Travel Rates",
        to: { name: "administration/TravelRatesPage" },
      },
    ],
  },
  {
    title: "Look up Management",
    items: [
      {
        icon: "mdi-wallet-membership",
        title: "Travel Purposes",
        to: { name: "administration/TravelPurposesPage" },
      },
      {
        icon: "mdi-airplane",
        title: "Travel Agencies",
        to: { name: "administration/TravelAgenciesPage" },
      },
    ],
  },
]

useBreadcrumbs([
  {
    title: "Administration",
    to: {
      name: "AdministrationPage",
    },
  },
])
</script>
