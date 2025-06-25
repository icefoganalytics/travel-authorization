<template>
  <div>
    <v-dialog
      v-model="itineraryDialog"
      persistent
      max-width="50%"
    >
      <template #activator="{ on, attrs }">
        <v-btn
          class="mx-0 px-3"
          color="#005A65"
          style="min-width: 0"
          v-bind="attrs"
          @click="initForm"
          v-on="on"
          >View Itinerary
        </v-btn>
      </template>

      <v-card :loading="loadingData">
        <v-card-title
          color="red"
          class="primary white--text"
        >
          <div class="text-h5">Travel Itinerary</div>
          <v-btn
            class="ml-auto"
            color="secondary"
            :loading="loadingData"
            @click="print"
          >
            Print
            <v-icon
              class="ml-2"
              color="primary darken-2"
              >mdi-printer</v-icon
            >
          </v-btn>
          <v-btn
            class="ml-3"
            color="grey darken-5"
            @click="itineraryDialog = false"
          >
            Close
          </v-btn>
        </v-card-title>

        <v-card-text v-if="loadingData">
          <div class="text-center mt-5 text-h6">Loading ...</div>
        </v-card-text>

        <v-card-text v-else>
          <title-card
            class="mt-10"
            large-title
          >
            <template #title>
              <div>Flight Details</div>
            </template>
            <template #body>
              <div :id="'pdf-page-' + invoiceNumber">
                <div
                  v-for="(flightSegment, inx) in flightSegments"
                  :key="'flight-' + inx"
                  class="one-section"
                  style="margin-top: 0.25rem"
                >
                  <div
                    v-if="flightSegment.tkHeader"
                    style="margin: 1rem 0 1rem 0.75rem"
                  >
                    <div style="line-height: 1.25rem">
                      <b>Ticket Number:</b> {{ flightSegment.ticketNumber }}
                    </div>
                    <div style="line-height: 1.25rem">
                      <b>Passenger Name:</b> {{ flightSegment.passengerName }}
                    </div>
                    <div style="line-height: 1.25rem"><b>Total Cost:</b> $ {{ totalCost }}</div>
                  </div>
                  <table
                    style="width: 99%"
                    class="mx-2 mb-7"
                  >
                    <tbody>
                      <tr style="line-height: 1rem">
                        <td
                          class="text-left"
                          style="width: 12%"
                        >
                          <b>Flight:</b>
                        </td>
                        <td colspan="2">{{ flightSegment.flightNumber }}</td>
                      </tr>
                      <tr style="background: #f9f9f9">
                        <td
                          class="text-left"
                          style="width: 12%"
                        >
                          <b>Departure:</b>
                        </td>
                        <td style="width: 21%">
                          {{ flightSegment.departAt | beautifyDateTime }}
                        </td>
                        <td style="width: 66%">{{ flightSegment.departLocation }}</td>
                      </tr>
                      <tr style="line-height: 1rem">
                        <td
                          class="text-left"
                          style="width: 12%"
                        >
                          <b>Arrival:</b>
                        </td>
                        <td style="width: 21%">
                          {{ flightSegment.arriveAt | beautifyDateTime }}
                        </td>
                        <td style="width: 66%">{{ flightSegment.arriveLocation }}</td>
                      </tr>
                      <tr style="background: #f9f9f9">
                        <td
                          class="text-left"
                          style="width: 12%"
                        >
                          <b>Class</b>
                        </td>
                        <td style="width: 21%">{{ flightSegment.class }}</td>
                        <td style="width: 66%"></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div style="margin: 1rem 0.25rem; white-space: pre">
                  <p>{{ invoiceRemarks }}</p>
                </div>
              </div>
            </template>
          </title-card>
        </v-card-text>
        <v-card-actions>
          <v-btn
            class="ml-3"
            color="grey darken-5"
            @click="itineraryDialog = false"
          >
            Close
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { Printd } from "printd"

import { TRAVEL_COM_URL } from "@/urls"
import http from "@/api/http-client"

import TitleCard from "@/modules/travelDesk/views/Common/TitleCard.vue"

export default {
  name: "ItineraryModal",
  components: {
    TitleCard,
  },
  props: {
    invoiceNumber: {
      type: [String, Number],
      required: true,
    },
  },
  data() {
    return {
      itineraryDialog: false,
      flightSegments: [],
      loadingData: false,
      invoiceRemarks: "",
      totalCost: 0,
    }
  },
  mounted() {},
  methods: {
    async initForm() {
      this.loadingData = true
      await this.getFlightInvoice()
      this.loadingData = false
    },

    async getFlightInvoice() {
      return http
        .get(`${TRAVEL_COM_URL}/itinerary/${this.invoiceNumber}`)
        .then((resp) => {
          console.log(resp.data)
          const flightSegments = resp.data.segments
          let tkNum = ""
          for (const segment of flightSegments) {
            if (segment.ticketNumber != tkNum) {
              segment.tkHeader = true
              tkNum = segment.ticketNumber
            } else {
              segment.tkHeader = false
            }
          }

          this.flightSegments = flightSegments
          this.invoiceRemarks = resp.data.remarks
          this.totalCost = resp.data.totalCost
        })
        .catch((e) => {
          console.log(e)
        })
    },

    print() {
      const styles = [
        `@media print {
						@page {
							size: 8.5in 11in;
						}
						div.form-footer {
							position: fixed;
							bottom: 0;
							width:100%;
							display:inline-block;
						}
						.new-page{
							page-break-before: always;
							position: relative; top: 8em;
						}
						.one-section{
							page-break-inside: avoid;
						}

					}`,
        `https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.min.css`,
        `thead th {
						font-size: 11pt !important;
						color: #111111 !important;
						text-align: left !important;
						border:  1px solid #333334 !important;
						border-bottom: 2px solid #333334 !important;
					}`,
        `tbody td { border:  0px solid #666666 !important;}`,
        `table {border: 2px solid #333334;}`,
      ]

      const pdf_id = "pdf-page-" + this.invoiceNumber
      const pageToPrint = window.document.getElementById(pdf_id)

      if (pageToPrint) {
        const pdf = new Printd()
        pdf.print(pageToPrint, styles)
        this.printReportDialog = false
      }
    },
  },
}
</script>

<style scoped></style>
