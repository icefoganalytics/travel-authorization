<template>
  <div>
    <h4>Leg 1</h4>
    <v-row class="mt-4">
      <v-col
        cols="12"
        md="2"
      >
        <LocationsAutocomplete
          :value="firstStop.locationId"
          :in-territory="allTravelWithinTerritory"
          :rules="[required]"
          label="From"
          background-color="white"
          dense
          outlined
          persistent-hint
          required
          @input="updateStop(0, 'locationId', $event)"
        />
      </v-col>
      <v-col
        cols="12"
        md="2"
      >
        <LocationsAutocomplete
          :value="secondStop.locationId"
          :in-territory="allTravelWithinTerritory"
          :rules="[required]"
          label="To"
          background-color="white"
          dense
          outlined
          persistent-hint
          required
          @input="updateStop(1, 'locationId', $event)"
        />
      </v-col>
      <v-col
        cols="12"
        md="2"
      >
        <DatePicker
          :value="firstStop.departureDate"
          :rules="[required]"
          label="Date"
          dense
          persistent-hint
          @input="updateStop(0, 'departureDate', $event)"
        />
      </v-col>
      <v-col
        cols="12"
        md="2"
      >
        <TimePicker
          :value="firstStop.departureTime"
          label="Time (24h)"
          persistent-hint
          @input="updateStop(0, 'departureTime', $event)"
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <TravelMethodSelect
          :value="firstStop.transport"
          :rules="[required]"
          background-color="white"
          dense
          persistent-hint
          required
          outlined
          @input="updateStop(0, 'transport', $event)"
        />
        <AccommodationTypeSelect
          :value="firstStop.accommodationType"
          :rules="[required]"
          background-color="white"
          dense
          outlined
          required
          @input="updateStop(0, 'accommodationType', $event)"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-divider class="my-4" />
        <h4>Leg 2</h4>
      </v-col>
      <v-col
        cols="12"
        md="2"
      >
        <LocationsAutocomplete
          :value="secondStop.locationId"
          :in-territory="allTravelWithinTerritory"
          :rules="[required]"
          label="To"
          background-color="white"
          dense
          outlined
          persistent-hint
          required
          @input="updateStop(1, 'locationId', $event)"
        />
      </v-col>
      <v-col
        cols="12"
        md="2"
      >
        <LocationsAutocomplete
          :value="thirdStop.locationId"
          :in-territory="allTravelWithinTerritory"
          :rules="[required]"
          label="From"
          background-color="white"
          dense
          outlined
          persistent-hint
          required
          @input="updateStop(2, 'locationId', $event)"
        />
      </v-col>
      <v-col
        cols="12"
        md="2"
      >
        <DatePicker
          :value="secondStop.departureDate"
          :min="firstStop.departureDate"
          :rules="[
            required,
            greaterThanOrEqualToDate(firstStop.departureDate, {
              referenceFieldLabel: 'previous departure date',
            }),
          ]"
          label="Date"
          dense
          persistent-hint
          @input="updateStop(1, 'departureDate', $event)"
        />
      </v-col>
      <v-col
        cols="12"
        md="2"
      >
        <TimePicker
          :value="secondStop.departureTime"
          label="Time (24 hour)"
          persistent-hint
          @input="updateStop(1, 'departureTime', $event)"
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <TravelMethodSelect
          :value="secondStop.transport"
          :rules="[required]"
          background-color="white"
          dense
          persistent-hint
          required
          outlined
          @input="updateStop(1, 'transport', $event)"
        />
        <AccommodationTypeSelect
          :value="secondStop.accommodationType"
          dense
          outlined
          v-bind="finalAccommodationTypeSelectDefaults(0)"
          @input="updateStop(1, 'accommodationType', $event)"
        />
      </v-col>
    </v-row>
    <template v-if="stops.length > 3">
      <v-row
        v-for="(_, index) in stops.slice(0, -3)"
        :key="index"
      >
        <v-col cols="12">
          <v-divider class="my-4" />
          <h4 class="d-flex justify-space-between align-center">
            Leg {{ index + 3 }}

            <v-btn
              title="Remove leg"
              icon
              color="error"
              class="my-0"
              @click="removeStop(index + 3)"
            >
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </h4>
        </v-col>
        <v-col
          cols="12"
          md="2"
        >
          <LocationsAutocomplete
            :value="stops[index + 2].locationId"
            :in-territory="allTravelWithinTerritory"
            :rules="[required]"
            label="To"
            background-color="white"
            dense
            outlined
            persistent-hint
            required
            @input="updateStop(index + 2, 'locationId', $event)"
          />
        </v-col>
        <v-col
          cols="12"
          md="2"
        >
          <LocationsAutocomplete
            :value="stops[index + 3].locationId"
            :in-territory="allTravelWithinTerritory"
            :rules="[required]"
            label="From"
            background-color="white"
            dense
            outlined
            persistent-hint
            required
            @input="updateStop(index + 3, 'locationId', $event)"
          />
        </v-col>
        <v-col
          cols="12"
          md="2"
        >
          <DatePicker
            :value="stops[index + 2].departureDate"
            :min="stops[index + 1].departureDate"
            :rules="[
              required,
              greaterThanOrEqualToDate(stops[index + 1].departureDate, {
                referenceFieldLabel: 'previous departure date',
              }),
            ]"
            label="Date"
            dense
            persistent-hint
            @input="updateStop(index + 2, 'departureDate', $event)"
          />
        </v-col>
        <v-col
          cols="12"
          md="2"
        >
          <TimePicker
            :value="stops[index + 2].departureTime"
            label="Time (24 hour)"
            persistent-hint
            @input="updateStop(index + 2, 'departureTime', $event)"
          />
        </v-col>
        <v-col
          cols="12"
          md="4"
        >
          <TravelMethodSelect
            :value="stops[index + 2].transport"
            :rules="[required]"
            background-color="white"
            dense
            persistent-hint
            required
            outlined
            @input="updateStop(index + 2, 'transport', $event)"
          />
          <AccommodationTypeSelect
            :value="stops[index + 2].accommodationType"
            dense
            outlined
            v-bind="finalAccommodationTypeSelectDefaults(index + 1)"
            @input="updateStop(index + 2, 'accommodationType', $event)"
          />
        </v-col>
      </v-row>
    </template>
    <v-divider class="my-4" />
    <v-row>
      <v-col cols="12">
        <v-btn
          color="primary"
          class="my-0"
          @click="addStop"
        >
          <v-icon left>mdi-plus</v-icon> Add Leg
        </v-btn>
      </v-col>
    </v-row>
    <v-divider class="mt-4 mb-10" />
  </div>
</template>

<script setup>
import { computed } from "vue"
import { first, nth } from "lodash"

import { required, greaterThanOrEqualToDate } from "@/utils/validators"

import DatePicker from "@/components/common/DatePicker"
import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete"
import TimePicker from "@/components/Utils/TimePicker"
import AccommodationTypeSelect from "@/modules/travel-authorizations/components/AccommodationTypeSelect"
import TravelMethodSelect from "@/modules/travel-authorizations/components/TravelMethodSelect"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
  value: {
    type: Array,
    default: () => [],
  },
  allTravelWithinTerritory: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(["input"])

const firstStop = computed(() => first(props.value) || {})
const secondStop = computed(() => nth(props.value, 1) || {})
const thirdStop = computed(() => nth(props.value, 2) || {})
const stops = computed(() => props.value)

function finalAccommodationTypeSelectDefaults(index) {
  if (index === stops.value.length - 3) {
    return {
      defaultValue: null,
      hint: "Optional, set only if neccessary",
      persistentHint: true,
      placeholder: "N/A",
      clearable: true,
    }
  }

  return {
    rules: [required],
    required: true,
  }
}

function removeStop(index) {
  const updatedStops = props.value.filter((_, i) => i !== index)
  emit("input", updatedStops)
}

function addStop() {
  const newLastStop = {
    travelAuthorizationId: props.travelAuthorizationId,
    locationId: null,
    transport: null,
    accommodationType: null,
  }

  emit("input", [...props.value, newLastStop])
}

async function updateStop(index, attribute, value) {
  const updatedStops = props.value.map((stop, i) => {
    if (i === index) {
      return { ...stop, [attribute]: value }
    }

    if (attribute === "departureDate" && i > index && stop.departureDate < value) {
      return { ...stop, [attribute]: value }
    }

    return stop
  })

  emit("input", updatedStops)
}
</script>
