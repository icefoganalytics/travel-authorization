<template>
  <div>
    <v-row>
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
          :value="lastStop.locationId"
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
          label="Time (24 hour)"
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
          :default-value="null"
          hint="Optional, set only if neccessary"
          placeholder="N/A"
          background-color="white"
          clearable
          dense
          outlined
          persistent-hint
          @input="updateStop(0, 'accommodationType', $event)"
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed } from "vue"

import { required } from "@/utils/validators"

import DatePicker from "@/components/common/DatePicker.vue"
import TimePicker from "@/components/common/TimePicker.vue"
import AccommodationTypeSelect from "@/modules/travel-authorizations/components/AccommodationTypeSelect.vue"
import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
import TravelMethodSelect from "@/modules/travel-authorizations/components/TravelMethodSelect.vue"

const props = defineProps({
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

const firstStop = computed(() => props.value[0] || {})
const lastStop = computed(() => props.value[props.value.length - 1] || {})

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
