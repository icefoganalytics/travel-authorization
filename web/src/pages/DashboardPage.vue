<template>
  <div>
    <h1>Dashboard</h1>

    <v-row>
      <v-col>
        <DashboardLatestTravelAuthorizationCard class="default" />
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card class="default">
          <v-card-title>Past Trips</v-card-title>
          <v-card-text>
            <DashboardTravelAuthorizationsDataTable
              :filters="pastTripsFilters"
              route-query-suffix="DashboardStatus"
            />
          </v-card-text>
        </v-card>
      </v-col>
      <v-col>
        <v-card class="default">
          <v-card-title>Upcoming Trips</v-card-title>
          <v-card-text>
            <DashboardTravelAuthorizationsDataTable
              :filters="upcomingTripsFilters"
              route-query-suffix="DashboardUpcoming"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card class="default">
          <v-card-title>Create a new travel request</v-card-title>
          <v-card-text>
            To begin the process of creating a new travel request, click the button below.
          </v-card-text>
          <v-card-actions>
            <CreateTravelAuthorizationButton color="blue" />
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"

import DashboardLatestTravelAuthorizationCard from "@/components/dashboards/DashboardLatestTravelAuthorizationCard.vue"
import DashboardTravelAuthorizationsDataTable from "@/components/dashboards/DashboardTravelAuthorizationsDataTable.vue"
import CreateTravelAuthorizationButton from "@/modules/travel-authorizations/components/my-travel-authorizations-page/CreateTravelAuthorizationBtn.vue"

const upcomingTripsFilters = computed(() => ({
  isUpcomingTrip: true,
}))

const pastTripsFilters = computed(() => ({
  isPastTrip: true,
}))
</script>
