<template>
  <v-card>
    <v-card-title> Purpose </v-card-title>
    <v-card-text>
      <v-form
        ref="form"
        lazy-validation
      >
        <v-row>
          <v-col
            cols="12"
            md="6"
          >
            <v-row dense>
              <v-col
                cols="12"
                md="6"
              >
                <v-select
                  v-model="travelAuthorization.purposeId"
                  :items="travelPurposes"
                  :loading="isLoadingTravelPurposes"
                  :rules="[required]"
                  dense
                  item-text="purpose"
                  item-value="id"
                  label="Purpose *"
                  outlined
                  required
                  validate-on-blur
                ></v-select>
              </v-col>
              <v-col cols="12">
                <v-text-field
                  v-model="travelAuthorization.eventName"
                  :rules="[required]"
                  dense
                  label="Name of meeting/conference, mission, trade fair or course *"
                  outlined
                  required
                  validate-on-blur
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                md="3"
              >
                <!-- Depending on in territory flag we will load a different list of destinations -->
                <v-checkbox
                  v-model="travelAuthorization.allTravelWithinTerritory"
                  label="In Territory?"
                  dense
                >
                </v-checkbox>
              </v-col>
              <v-col
                cols="12"
                md="9"
              >
                <LocationsAutocomplete
                  :value="lastStop.locationId"
                  :in-territory="travelAuthorization.allTravelWithinTerritory"
                  :rules="[required]"
                  clearable
                  dense
                  label="Final Destination *"
                  outlined
                  persistent-hint
                  required
                  validate-on-blur
                  @input="updateLastStopLocationId"
                />
              </v-col>
            </v-row>
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <v-row>
              <v-col
                cols="12"
                md="3"
              >
                <h3>Objectives</h3>
                <ul>
                  <li>Purpose of attendance</li>
                  <li>Relevance and anticipated benefits to branch and Government of Yukon</li>
                </ul>
              </v-col>
              <v-col
                cols="12"
                md="9"
              >
                <v-textarea
                  v-model="travelAuthorization.benefits"
                  :rules="[required]"
                  auto-grow
                  dense
                  label="Objectives *"
                  outlined
                  required
                  rows="10"
                  validate-on-blur
                >
                </v-textarea>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
import { mapState, mapActions, mapGetters } from "vuex"

import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete"

export default {
  name: "PurposeFormCard",
  components: {
    LocationsAutocomplete,
  },
  props: {
    travelAuthorizationId: {
      type: Number,
      required: true,
    },
  },
  data: () => ({
    required: (v) => !!v || "This field is required",
  }),
  computed: {
    ...mapGetters("travelAuthorization", {
      travelAuthorization: "attributes",
      stops: "stops",
      lastStop: "lastStop",
    }),
    ...mapState("travelPurposes", {
      travelPurposes: "items",
      isLoadingTravelPurposes: "isLoading",
    }),
  },
  async mounted() {
    await Promise.all([
      await this.ensureTravelAuthorization(this.travelAuthorizationId),
      await this.ensureTravelPurposes(),
    ])
  },
  methods: {
    ...mapActions("travelAuthorization", {
      ensureTravelAuthorization: "ensure",
      replaceStops: "replaceStops",
    }),
    ...mapActions("travelPurposes", { ensureTravelPurposes: "ensure" }),
    async updateLastStopLocationId(locationId) {
      await this.replaceStops([
        ...this.stops.slice(0, -1),
        {
          ...this.lastStop,
          locationId,
        },
      ])
    },
  },
}
</script>
