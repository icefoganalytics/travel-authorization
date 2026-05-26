<template>
  <div class="home">
    <h1>Dashboard</h1>

    <v-card class="mt-5 default">
      <v-card-title>Current/Recent Trip</v-card-title>
      <v-card-text>
        <v-row>
          <v-col>
            <!-- TODO: this card should show the current/recent trip information; currently it's just a placeholder -->
            <v-card>
              <v-col>
                <v-row>
                  <v-col>
                    <h3>Purpose:</h3>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <div>Trip stops:</div>
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <StringDateInput
                      v-model="startDate"
                      label="Start Date"
                      density="compact"
                    />
                  </v-col>
                  <v-col>
                    <TimeTextField
                      label="Start Time (24 hour)"
                      density="compact"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <StringDateInput
                      v-model="endDate"
                      label="End Date"
                      density="compact"
                    />
                  </v-col>
                  <v-col>
                    <TimeTextField
                      label="End Time (24 hour)"
                      density="compact"
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-text-field
                      v-model="daysOffTravel"
                      density="compact"
                      label="# of days off travel"
                      prepend-inner-icon="mdi-hail"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-col>
            </v-card>
          </v-col>
          <v-col cols="8">
            <DashboardExpensesDataTable
              v-if="recentTravelAuthorizationId"
              :where="recentTripExpensesWhere"
              route-query-suffix="DashboardRecentTripExpenses"
            />
          </v-col>
        </v-row>
        <v-btn
          color="blue"
          size="small"
          @click="saveChanges"
          >Save Changes</v-btn
        >
      </v-card-text>
    </v-card>
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
import { computed, ref, onMounted } from "vue"
import { useRouter } from "vue-router"

import http from "@/api/http-client"
import { travelAuthorizationsApi } from "@/api/travel-authorizations-api"
import { FORM_URL } from "@/urls"

import StringDateInput from "@/components/common/StringDateInput.vue"
import TimeTextField from "@/components/common/TimeTextField.vue"
import DashboardExpensesDataTable from "@/components/dashboards/DashboardExpensesDataTable.vue"
import CreateTravelAuthorizationButton from "@/modules/travel-authorizations/components/my-travel-authorizations-page/CreateTravelAuthorizationBtn.vue"

const router = useRouter()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const startDate = ref(null)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const endDate = ref(null)
const daysOffTravel = ref<number>(1)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const forms = ref([])
const recentTravelAuthorizationId = ref<number | undefined>(undefined)

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

const recentTripExpensesWhere = computed(() => ({
  travelAuthorizationId: recentTravelAuthorizationId.value,
}))

onMounted(() => {
  loadTravelAuthorizations()
  loadRecentTravelAuthorizationId()
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

async function loadRecentTravelAuthorizationId() {
  const response = await travelAuthorizationsApi.list({
    order: [["createdAt", "DESC"]],
    perPage: 1,
  })
  const recentTravelAuthorization = response.travelAuthorizations[0]
  recentTravelAuthorizationId.value = recentTravelAuthorization?.id
}

function saveChanges() {}
</script>
