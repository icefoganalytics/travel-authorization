<template>
  <div>
    <v-dialog
      v-model="addNewTravelDialog"
      persistent
    >
      <template #activator="{ on, attrs }">
        <v-btn
          style="width: 80%"
          class="mr-5 my-2"
          color="primary"
          v-bind="attrs"
          @click="initForm"
          v-on="on"
        >
          <div v-if="type == 'Submit'">Submit Travel Desk Request</div>
          <div v-else-if="type == 'Review'">Review Travel Options</div>
        </v-btn>
      </template>

      <v-card
        :loading="loadingData"
        :disabled="loadingData"
        en
      >
        <v-card-title
          class="primary"
          style="border-bottom: 1px solid black"
        >
          <div class="text-h5">Travel Desk Request</div>
        </v-card-title>

        <div
          v-if="loadingData"
          class="mt-10"
          style="text-align: center"
        >
          loading ...
        </div>
        <v-card-text v-if="!loadingData">
          <v-row class="mb-3">
            <v-col :cols="type != 'Submit' ? 8 : 12">
              <traveler-details
                :traveler-details="travelerDetails"
                :traveler-state="state"
                :readonly="false"
              />

              <title-card
                class="mt-10"
                large-title
              >
                <template #title>
                  <div>Travel Information</div>
                </template>
                <template #body>
                  <title-card class="mt-5 mx-5">
                    <template #title>
                      <div>Flight Request</div>
                    </template>
                    <template #body>
                      <v-row class="mt-0 mx-0">
                        <v-col cols="9">
                          <flight-request-table
                            :travel-desk-travel-request-id="travelerDetails.id"
                            :authorized-travel="authorizedTravel"
                            :readonly="false"
                            :travel-desk-user="false"
                            :show-flight-options="travelerDetails.status != 'draft'"
                            :flight-requests="travelerDetails.flightRequests"
                          />
                        </v-col>
                        <v-col
                          cols="3"
                          class="px-0"
                        >
                          <v-textarea
                            v-model="travelerDetails.additionalInformation"
                            class="mt-5 mr-5"
                            :readonly="readonly"
                            label="Additional Information"
                            outlined
                            auto-grow
                            counter
                            :clearable="!readonly"
                          />
                        </v-col>
                      </v-row>
                    </template>
                  </title-card>

                  <TravelDeskRentalCarsEditCard
                    :travel-desk-travel-request-id="authorizedTravel.id"
                    :return-to="returnTo"
                  />
                  <hotel-request-table
                    :authorized-travel="authorizedTravel"
                    :readonly="false"
                    :flight-requests="travelerDetails.flightRequests"
                    :hotels="travelerDetails.hotels"
                  />
                  <transportation-request-table
                    :authorized-travel="authorizedTravel"
                    :readonly="false"
                    :other-transportations="travelerDetails.otherTransportations"
                  />
                </template>
              </title-card>
            </v-col>
            <v-col
              v-if="type != 'Submit'"
              cols="4"
            >
              <v-row class="mt-3 mb-0 mx-0">
                <v-col cols="6" />
                <v-col cols="6">
                  <v-text-field
                    v-model="travelerDetails.travelDeskOfficer"
                    readonly
                    class="mr-2"
                    label="Travel Desk Agent Assigned"
                    outlined
                  />
                </v-col>
              </v-row>
              <questions-table
                :readonly="false"
                :questions="travelerDetails.questions"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-btn
            color="grey darken-5"
            class="px-5"
            @click="addNewTravelDialog = false"
          >
            <div v-if="!type">Close</div>
            <div v-else>Cancel</div>
          </v-btn>
          <v-btn
            v-if="type"
            class="ml-auto mr-2 px-5"
            color="green darken-1"
            :loading="savingData"
            @click="saveNewTravelRequest('save')"
            >Save Draft
          </v-btn>
          <v-btn
            v-if="type"
            class="mr-5 px-5"
            color="brown darken-1"
            :loading="savingData"
            @click="saveNewTravelRequest('submit')"
            >Submit
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { LOOKUP_URL, TRAVEL_DESK_URL } from "@/urls"
import http from "@/api/http-client"

import TitleCard from "@/modules/travelDesk/views/Common/TitleCard.vue"
import TravelerDetails from "@/modules/travelDesk/views/Requests/Components/TravelerDetails.vue"
import FlightRequestTable from "@/modules/travelDesk/views/Requests/RequestDialogs/FlightRequestTable.vue"
import TravelDeskRentalCarsEditCard from "@/components/travel-desk-rental-cars/TravelDeskRentalCarsEditCard.vue"
import HotelRequestTable from "@/modules/travelDesk/views/Requests/RequestDialogs/HotelRequestTable.vue"
import TransportationRequestTable from "@/modules/travelDesk/views/Requests/RequestDialogs/TransportationRequestTable.vue"
import QuestionsTable from "@/modules/travelDesk/views/Desk/Components/QuestionsTable.vue"

export default {
  name: "NewTravelDeskRequest",
  components: {
    TitleCard,
    TravelerDetails,
    FlightRequestTable,
    TravelDeskRentalCarsEditCard,
    TransportationRequestTable,
    HotelRequestTable,
    QuestionsTable,
  },
  props: {
    type: {
      type: String,
      required: true,
    },
    authorizedTravel: {
      type: Object,
      required: true,
    },
    returnTo: {
      type: String,
      default: undefined,
    },
  },
  data() {
    return {
      addNewTravelDialog: false,
      readonly: false,
      internationalTravel: false,

      travelerDetails: {},
      savingData: false,

      state: {
        firstNameErr: false,
        middleNameErr: false,
        lastNameErr: false,
        birthDateErr: false,
        travelAuthErr: false,
        addressErr: false,
        cityErr: false,
        provinceErr: false,
        postalCodeErr: false,
        passportNumberErr: false,
        passportCountryErr: false,
        businessPhoneErr: false,
        businessEmailErr: false,
        travelPhoneErr: false,
        travelEmailErr: false,
        flightRequestsErr: false,
        rentalCarsErr: false,
        hotelsErr: false,
        otherTransportationErr: false,
      },

      loadingData: false,
    }
  },
  mounted() {},
  methods: {
    updateTable() {
      this.$emit("updateTable")
    },

    async initForm() {
      this.initStates()
      this.savingData = false
      this.loadingData = true
      const travelRequest = await this.getTravelRequestInfo()
      // console.log(travelRequest)
      if (travelRequest) {
        this.extractTravelRequestInfo(travelRequest)
      } else await this.getEmployeeInfo()
    },

    async getTravelRequestInfo() {
      return http
        .get(`${TRAVEL_DESK_URL}/travel-request/` + this.authorizedTravel.id)
        .then((resp) => {
          // console.log(resp.data)
          return resp.data
        })
        .catch((e) => {
          console.log(e)
        })
    },

    async getEmployeeInfo() {
      return http
        .get(`${LOOKUP_URL}/employee-info?email=` + this.authorizedTravel.email)
        .then((resp) => {
          console.log(resp.data)
          const employee = resp.data
          const travelerDetails = {
            legalFirstName: employee.firstName,
            legalMiddleName: "",
            legalLastName: employee.lastName,
            birthDate: "",
            strAddress: employee.address,
            city: employee.community,
            province: employee.community?.toLowerCase() == "whitehorse" ? "Yukon" : "",
            postalCode: employee.postalCode,
            passportCountry: "",
            passportNum: "",
            travelPurpose: "",
            travelLocation: "",
            travelNotes: "",
            busPhone: employee.businessPhone,
            busEmail: employee.email,
            travelContact: false,
            travelPhone: employee.mobile,
            travelEmail: "",
            travelDeskOfficer: "",
            internationalTravel: false,
            office: employee.office,
            department: employee.department,
            fullName: employee.fullName,
            travelAuthorizationId: this.authorizedTravel.id,
            additionalInformation: "",
            rentalCars: [],
            flightRequests: [],
            hotels: [],
            otherTransportations: [],
            questions: [],
            status: "draft",
          }
          this.travelerDetails = travelerDetails
          this.loadingData = false
        })
        .catch((e) => {
          console.log(e)
          this.loadingData = false
        })
    },

    extractTravelRequestInfo(travelerDetails) {
      travelerDetails.internationalTravel =
        travelerDetails.passportCountry || travelerDetails.passportNum
      travelerDetails.office = ""
      travelerDetails.department = this.$store.state.auth.department
      travelerDetails.fullName =
        travelerDetails.legalFirstName + "." + travelerDetails.legalLastName
      this.travelerDetails = travelerDetails
      this.loadingData = false
    },

    saveNewTravelRequest(saveType) {
      console.log(saveType)
      // console.log(this.travelerDetails)

      if (saveType == "save" || this.checkFields()) {
        this.savingData = true
        const body = this.travelerDetails
        delete body.internationalTravel
        delete body.differentTravelContact
        delete body.office
        delete body.department
        delete body.fullName
        if (saveType == "submit" && body.status == "draft") {
          body.status = "submitted"
        } else if (saveType == "submit" && body.status == "options_provided") {
          body.status = "options_ranked"
        }
        // console.log(body);
        const id = this.authorizedTravel.id
        return http
          .post(`${TRAVEL_DESK_URL}/travel-request/${id}`, body)
          .then(() => {
            this.savingData = false
            this.addNewTravelDialog = false
            this.$emit("updateTable")
          })
          .catch((e) => {
            this.savingData = false
            console.log(e)
          })
      }
    },

    initStates() {
      for (const key of Object.keys(this.state)) {
        this.state[key] = false
      }
    },

    checkFields() {
      this.state.firstNameErr = this.travelerDetails.legalFirstName ? false : true
      ;(this.state.middleNameErr = false),
        (this.state.lastNameErr = this.travelerDetails.legalLastName ? false : true)
      this.state.birthDateErr = this.travelerDetails.birthDate ? false : true
      this.state.travelAuthErr = false //this.travelerDetails.travelAuth? false:true; TODO: add this in backend
      this.state.addressErr = this.travelerDetails.strAddress ? false : true
      this.state.cityErr = this.travelerDetails.city ? false : true
      this.state.provinceErr = this.travelerDetails.province ? false : true
      this.state.postalCodeErr = this.travelerDetails.postalCode ? false : true
      this.state.passportNumberErr =
        this.internationalTravel && !this.travelerDetails.passportNum ? true : false
      this.state.passportCountryErr =
        this.internationalTravel && !this.travelerDetails.passportCountry ? true : false
      this.state.businessPhoneErr = this.travelerDetails.busPhone ? false : true
      this.state.businessEmailErr = this.travelerDetails.busEmail ? false : true
      this.state.travelPhoneErr =
        this.travelerDetails.travelContact && !this.travelerDetails.travelPhone ? true : false //show hint
      this.state.travelEmailErr =
        this.travelerDetails.travelContact && !this.travelerDetails.travelEmail ? true : false //show hint
      this.state.flightRequestsErr = false
      this.state.rentalCarsErr = false
      this.state.hotelsErr = false
      this.state.otherTransportationErr = false

      if (this.travelerDetails.status == "options_provided") {
        let error = false
        for (const question of this.travelerDetails.questions) {
          if (question.response) {
            question.state = {
              ...question.state,
              questionErr: question.state?.responseErr ?? false,
            }
          } else {
            question.state = {
              ...question.state,
              questionErr: question.state?.responseErr ?? true,
            }
            error = true
          }
        }

        for (const flightRequest of this.travelerDetails.flightRequests) {
          for (const flightOption of flightRequest.flightOptions) {
            if (!flightOption.flightPreferenceOrder) {
              error = true
            }
          }
        }

        if (error) return false
      }

      for (const key of Object.keys(this.state)) {
        if (this.state[key]) return false
      }
      return true
    },
  },
}
</script>

<style scoped></style>
