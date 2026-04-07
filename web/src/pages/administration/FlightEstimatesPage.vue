<template>
  <div>
    <v-alert color="warning"> Page is not yet implemented </v-alert>

    <h1>Flight Estimates</h1>
    <v-card class="default">
      <v-card-text>
        <v-row
          v-for="(flightEstimate, index) in flightEstimates"
          :key="index"
        >
          <v-col cols="3">
            <v-text-field v-model="flightEstimate.flight"> </v-text-field>
          </v-col>
          <v-col cols="3">
            <v-text-field v-model="flightEstimate.estimate"> </v-text-field>
          </v-col>
          <v-col cols="1">
            <v-btn
              class="ma-2"
              dense
              small
              color="red"
              @click="removeStop(index)"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-col>
        </v-row>

        <v-btn
          class="ma-2"
          dense
          small
          color="green"
        >
          Save
        </v-btn>
        <v-btn
          class="ma-2"
          dense
          small
          color="red"
        >
          Discard Changes
        </v-btn></v-card-text
      >
    </v-card>
  </div>
</template>

<script setup>
import { ref } from "vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"

const flightEstimates = ref([
  {
    flight: "Whitehorse to Vancouver",
    estimate: "780",
  },
])

useBreadcrumbs([
  {
    title: "Administration",
    to: { name: "AdministrationPage" },
  },
  {
    title: "Flight Estimates",
    to: { name: "administration/FlightEstimatesPage" },
  },
])
</script>
