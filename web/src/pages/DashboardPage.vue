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
                    <TimePicker label="Start Time"></TimePicker>
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
                    <TimePicker label="End Date"></TimePicker>
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
                  small
                  class="mr-2"
                  @click="editItem(item)"
                >
                  mdi-pencil
                </v-icon>
                <v-icon
                  small
                  @click="deleteItem(item)"
                >
                  mdi-delete
                </v-icon>
              </template>
              <template #item.receipts>
                <v-btn
                  text
                  color="blue"
                  x-small
                  @click="uploadReceiptDialog"
                >
                  Upload Receipts
                </v-btn>
              </template>
            </v-data-table>
            <v-dialog
              v-model="dialog"
              width="400"
            >
              <UploadReceipts />
            </v-dialog>
          </v-col>
        </v-row>
        <v-btn
          color="blue"
          small
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

import DatePicker from "@/components/common/DatePicker"
import TimePicker from "@/components/Utils/TimePicker.vue"
import UploadReceipts from "@/components/Utils/UploadReceipts.vue"

import CreateTravelAuthorizationButton from "@/modules/travel-authorizations/components/my-travel-authorizations-page/CreateTravelAuthorizationBtn.vue"

export default {
  name: "DashboardPage",
  components: {
    CreateTravelAuthorizationButton,
    DatePicker,
    TimePicker,
    UploadReceipts,
  },
  data: () => ({
    daysOffTravel: 1,
    data: {},
    headers: [
      {
        text: "Purpose",
        value: "purpose",
      },
      {
        text: "Departure Date",
        value: "departureDate",
      },
      {
        text: "Return Date",
        value: "dateBackToWork",
      },
      {
        text: "Status",
        value: "status",
      },
    ],
    expenseHeaders: [
      {
        text: "Type",
        value: "type",
      },
      {
        text: "Description",
        value: "description",
      },
      {
        text: "Date",
        value: "date",
      },
      {
        text: "Amount",
        value: "cost",
      },
      {
        text: "Actions",
        value: "actions",
      },
      {
        text: "Receipts",
        value: "receipts",
      },
    ],
    travelAuthHeaders: [
      {
        text: "Location",
        value: "location",
      },
      {
        text: "Description",
        value: "description",
      },
      {
        text: "Start Date",
        value: "date",
      },
      {
        text: "End Date",
        value: "cost",
      },
      {
        text: "Auth Status",
        value: "actions",
      },
      {
        text: "Booking Status",
        value: "receipts",
      },
    ],
    forms: [],
    dialog: false,
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
    uploadReceiptDialog() {
      this.dialog = true
    },
    openForm(value) {
      this.$router.push(`/TravelRequest/Request/${value.formId}`)
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
