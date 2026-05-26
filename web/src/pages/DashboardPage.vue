<template>
  <div>
    <h1>Dashboard</h1>

    <DashboardLatestTravelAuthorizationCard />
    <v-row>
      <v-col>
        <v-card class="mt-5 default">
          <v-card-title>Travel Authorization Status</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="travelAuthHeaders"
              :items="forms"
              hide-default-footer
              disable-pagination
              class="elevation-2"
              style="margin: 20px"
              @click:row="openForm"
            >
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col>
        <v-card class="mt-5 default">
          <v-card-title>Upcoming Trips</v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="forms"
              hide-default-footer
              disable-pagination
              class="elevation-2"
              style="margin: 20px"
              @click:row="openForm"
            >
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card class="mt-5 default">
          <v-card-title>Create a new travel request</v-card-title>
          <v-card-text>
            To begin the process of creating a new travel request, click the button
            bellow.</v-card-text
          >
          <v-card-actions>
            <CreateTravelAuthorizationButton color="blue" />
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// @ts-expect-error uuid types not installed
import { v4 as uuidv4 } from "uuid"
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"

import http from "@/api/http-client"
import { FORM_URL } from "@/urls"

import DashboardLatestTravelAuthorizationCard from "@/components/dashboards/DashboardLatestTravelAuthorizationCard.vue"
import CreateTravelAuthorizationButton from "@/modules/travel-authorizations/components/my-travel-authorizations-page/CreateTravelAuthorizationBtn.vue"

const router = useRouter()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const forms = ref([])

const headers = [
  {
    title: "Purpose",
    key: "purpose",
  },
  {
    title: "Departure Date",
    key: "departureDate",
  },
  {
    title: "Return Date",
    key: "dateBackToWork",
  },
  {
    title: "Status",
    key: "status",
  },
]

const travelAuthHeaders = [
  {
    title: "Location",
    key: "location",
  },
  {
    title: "Description",
    key: "description",
  },
  {
    title: "Start Date",
    key: "date",
  },
  {
    title: "End Date",
    key: "cost",
  },
  {
    title: "Auth Status",
    key: "actions",
  },
  {
    title: "Booking Status",
    key: "receipts",
  },
]

onMounted(() => {
  loadTravelAuthorizations()
})

function loadTravelAuthorizations() {
  return http.get(FORM_URL).then((resp) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    forms.value = resp.data
  })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function openForm(_event: unknown, { item }: { item: any }) {
  router.push(`/TravelRequest/Request/${item.formId}`)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function createForm() {
  router.push(`/TravelRequest/Request/${uuidv4()}`)
}
</script>
