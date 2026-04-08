<template>
  <div class="home">
    <h1>Dashboard</h1>

    <v-card class="mt-5 default">
      <v-card-title>Current/Recent Trip</v-card-title>
      <v-card-text>
        <v-row>
          <v-col>
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
                    <DatePicker
                      label="Start Date"
                      dense
                    ></DatePicker>
                  </v-col>
                  <v-col>
                    <TimeTextField
                      label="Start Time (24 hour)"
                      dense
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <DatePicker
                      label="End Date"
                      dense
                    ></DatePicker>
                  </v-col>
                  <v-col>
                    <TimeTextField
                      label="End Time (24 hour)"
                      dense
                    />
                  </v-col>
                </v-row>
                <v-row>
                  <v-col>
                    <v-text-field
                      v-model="daysOffTravel"
                      dense
                      label="# of days off travel"
                      prepend-icon="mdi-hail"
                    ></v-text-field>
                  </v-col>
                </v-row>
              </v-col>
            </v-card>
          </v-col>
          <v-col cols="8">
            <v-data-table
              :headers="expenseHeaders"
              :items="data.expenses"
              hide-default-footer
              disable-pagination
              class="elevation-2"
              style="margin: 20px"
            >
              <template #item.actions="{ item }">
                <v-icon
                  size="small"
                  class="mr-2"
                  @click="editItem(item)"
                >
                  mdi-pencil
                </v-icon>
                <v-icon
                  size="small"
                  @click="deleteItem(item)"
                >
                  mdi-delete
                </v-icon>
              </template>
              <template #item.receipts="{ item }">
                <AddReceiptButtonForm :expense-id="item.id" />
              </template>
            </v-data-table>
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

<script>
import { v4 as uuidv4 } from "uuid"

import http from "@/api/http-client"
import { FORM_URL } from "@/urls"

import DatePicker from "@/components/common/DatePicker.vue"
import TimeTextField from "@/components/common/TimeTextField.vue"
import AddReceiptButtonForm from "@/components/expenses/edit-data-table/AddReceiptButtonForm.vue"

import CreateTravelAuthorizationButton from "@/modules/travel-authorizations/components/my-travel-authorizations-page/CreateTravelAuthorizationBtn.vue"

export default {
  name: "DashboardPage",
  components: {
    AddReceiptButtonForm,
    CreateTravelAuthorizationButton,
    DatePicker,
    TimeTextField,
  },
  data: () => ({
    daysOffTravel: 1,
    data: {},
    headers: [
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
    ],
    expenseHeaders: [
      {
        title: "Type",
        key: "type",
      },
      {
        title: "Description",
        key: "description",
      },
      {
        title: "Date",
        key: "date",
      },
      {
        title: "Amount",
        key: "cost",
      },
      {
        title: "Actions",
        key: "actions",
      },
      {
        title: "Receipts",
        key: "receipts",
      },
    ],
    travelAuthHeaders: [
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
    ],
    forms: [],
  }),
  created() {
    this.loadTravelAuthorizations()
    this.getTrip()
  },
  methods: {
    loadTravelAuthorizations() {
      return http.get(FORM_URL).then((resp) => {
        this.forms = resp.data
      })
    },
    openForm(_event, { item }) {
      this.$router.push(`/TravelRequest/Request/${item.formId}`)
    },
    createForm() {
      this.$router.push(`/TravelRequest/Request/${uuidv4()}`)
    },
    getTrip() {
      return http.get(`${FORM_URL}/recent`).then((resp) => {
        this.data = resp.data
      })
    },
    editItem() {},
    deleteItem() {},
    saveChanges() {},
  },
}
</script>
