<template>
  <div>
    <title-card
      class="mt-10"
      large-title
    >
      <template #title>
        <div>Traveler Details</div>
      </template>
      <template #body>
        <v-row class="mt-5 mx-3">
          <v-col cols="2">
            <v-text-field
              v-model="travelerDetails.legalFirstName"
              :readonly="readonly"
              :error="travelerState.firstNameErr"
              label="Legal First Name"
              outlined
            />
          </v-col>
          <v-col cols="2">
            <v-text-field
              v-model="travelerDetails.legalMiddleName"
              :readonly="readonly"
              :error="travelerState.middleNameErr"
              label="Legal Middle Name"
              outlined
            />
          </v-col>
          <v-col cols="2">
            <v-text-field
              v-model="travelerDetails.legalLastName"
              :readonly="readonly"
              :error="travelerState.lastNameErr"
              label="Legal Last Name"
              outlined
            />
          </v-col>
          <v-col cols="2">
            <v-text-field
              v-model="travelerDetails.birthDate"
              :readonly="readonly"
              :error="travelerState.birthDateErr"
              label="Birth Date"
              outlined
              :max="dobMaxDate"
              type="date"
              @input="travelerState.birthDateErr = false"
            />
          </v-col>
          <v-col cols="2">
            <v-text-field
              v-model="travelAuthorizationId"
              readonly
              :error="travelerState.travelAuthErr"
              label="Travel Auth"
              outlined
            />
          </v-col>
        </v-row>
        <v-row class="mt-0 mx-3">
          <v-col cols="2">
            <v-text-field
              v-model="travelerDetails.strAddress"
              :readonly="readonly"
              :error="travelerState.addressErr"
              label="Address"
              outlined
            />
          </v-col>
          <v-col cols="2">
            <LocationsAutocomplete
              v-model="travelerDetails.city"
              item-value="city"
              :readonly="readonly"
              :error="travelerState.cityErr"
              label="City"
              outlined
            />
          </v-col>
          <v-col cols="2">
            <v-text-field
              v-model="travelerDetails.province"
              :readonly="readonly"
              :error="travelerState.provinceErr"
              label="Province"
              outlined
            />
          </v-col>
          <v-col cols="2">
            <v-text-field
              v-model="travelerDetails.postalCode"
              :readonly="readonly"
              :error="travelerState.postalCodeErr"
              label="Postal Code"
              outlined
            />
          </v-col>
          <v-col
            v-if="!travelerDetails.internationalTravel"
            cols="2"
          >
            <v-checkbox
              v-model="travelerDetails.internationalTravel"
              :readonly="readonly"
              label="International travel"
            />
          </v-col>
          <v-col
            v-if="travelerDetails.internationalTravel"
            cols="2"
          >
            <v-text-field
              v-model="travelerDetails.passportNum"
              :readonly="readonly"
              :error="travelerState.passportNumberErr"
              label="Passport Number"
              outlined
            />
          </v-col>
          <v-col
            v-if="travelerDetails.internationalTravel"
            cols="2"
          >
            <v-text-field
              v-model="travelerDetails.passportCountry"
              :readonly="readonly"
              :error="travelerState.passportCountryErr"
              label="Passport Country"
              outlined
            />
          </v-col>
        </v-row>

        <v-row class="mt-0 mx-3">
          <v-col cols="2">
            <v-text-field
              v-model="travelerDetails.busPhone"
              :readonly="readonly"
              :rules="[rules.phone]"
              :error="travelerState.businessPhoneErr"
              label="Business Phone"
              outlined
            />
          </v-col>
          <v-col cols="2">
            <v-text-field
              v-model="travelerDetails.busEmail"
              :readonly="readonly"
              :rules="[rules.email]"
              :error="travelerState.businessEmailErr"
              label="Business Email"
              outlined
            />
          </v-col>
          <v-col cols="3">
            <v-checkbox
              v-model="travelerDetails.travelContact"
              :readonly="readonly"
              label="Contact information different for travel"
            />
          </v-col>
          <v-col
            v-if="travelerDetails.travelContact"
            cols="2"
          >
            <v-text-field
              v-model="travelerDetails.travelPhone"
              :readonly="readonly"
              :rules="[rules.phone]"
              :error="travelerState.travelPhoneErr"
              label="Travel Phone"
              outlined
            />
          </v-col>
          <v-col
            v-if="travelerDetails.travelContact"
            cols="3"
          >
            <v-text-field
              v-model="travelerDetails.travelEmail"
              :readonly="readonly"
              :rules="[rules.email]"
              :error="travelerState.travelEmailErr"
              label="Travel Email"
              outlined
            />
          </v-col>
        </v-row>
      </template>
    </title-card>
  </div>
</template>

<script>
import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
import TitleCard from "@/modules/travelDesk/views/Common/TitleCard.vue"

export default {
  name: "TravelerDetails",
  components: {
    TitleCard,
    LocationsAutocomplete,
  },
  props: {
    readonly: Boolean,
    travelerDetails: {
      type: Object,
      required: true,
    },
    // TODO: replace with more traditional Vuetify form input "rules"
    travelerState: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      admin: false,
      travelAuthorizationId: "",
      dobMaxDate: "",
      rules: {
        phone: (value) => {
          const pattern = /^[0-9]{3}[-. ][0-9]{3}[-. ][0-9]{4}((\s\x[0-9]{4})|)?$/
          return pattern.test(value) || "Invalid Phone (888-888-8888)"
        },
        email: (value) => {
          const pattern =
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
          return pattern.test(value) || "Invalid e-mail."
        },
      },
    }
  },
  mounted() {
    this.travelAuthorizationId = this.travelerDetails.travelAuthorizationId
      .toString()
      .padStart(5, "0")
    const currentDate = new Date()
    currentDate.setDate(currentDate.getDate() - 18 * 365)
    this.dobMaxDate = currentDate.toISOString().slice(0, 10)
  },
  methods: {},
}
</script>

<style scoped></style>
