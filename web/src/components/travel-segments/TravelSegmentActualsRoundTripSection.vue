<template>
  <v-skeleton-loader
    v-if="isNil(firstTravelSegment) || isNil(lastTravelSegment)"
    type="card"
  />
  <div v-else>
    <h4>Departure</h4>
    <v-row class="mt-4">
      <v-col
        cols="12"
        md="6"
      >
        <TravelMethodSelect
          v-model="firstTravelSegment.modeOfTransport"
          :rules="[required]"
          background-color="white"
          dense
          persistent-hint
          required
          outlined
          @input="
            $event === TRAVEL_METHODS.OTHER
              ? null
              : saveTravelSegment(firstTravelSegment.id, {
                  modeOfTransport: $event,
                })
          "
        />
      </v-col>
      <v-col
        v-if="firstTravelSegment.modeOfTransport === TRAVEL_METHODS.OTHER"
        cols="12"
        md="6"
      >
        <v-text-field
          :value="firstTravelSegment.modeOfTransportOther"
          label="Travel Method - Other"
          dense
          outlined
          @input="
            saveTravelSegment(firstTravelSegment.id, {
              modeOfTransportOther: $event,
            })
          "
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="3"
      >
        <LocationsAutocomplete
          :value="firstTravelSegment.departureLocationId"
          :in-territory="allTravelWithinTerritory"
          :rules="[required]"
          label="From"
          background-color="white"
          dense
          outlined
          persistent-hint
          required
          @input="
            saveTravelSegment(firstTravelSegment.id, {
              departureLocationId: $event,
            })
          "
        />
      </v-col>
      <v-col
        cols="12"
        md="3"
      >
        <LocationsAutocomplete
          :value="lastTravelSegment.arrivalLocationId"
          :in-territory="allTravelWithinTerritory"
          :rules="[required]"
          label="To"
          background-color="white"
          dense
          outlined
          persistent-hint
          required
          @input="
            saveTravelSegment(lastTravelSegment.id, {
              arrivalLocationId: $event,
            })
          "
        />
      </v-col>
      <v-col
        cols="12"
        md="3"
      >
        <DatePicker
          :value="firstTravelSegment.departureOn"
          :rules="[required]"
          label="Date"
          dense
          persistent-hint
          @input="
            saveTravelSegment(firstTravelSegment.id, {
              departureOn: $event,
            })
          "
        />
      </v-col>
      <v-col
        cols="12"
        md="3"
      >
        <TimePicker
          :value="firstTravelSegment.departureTime"
          label="Time (24h)"
          persistent-hint
          @input="
            saveTravelSegment(firstTravelSegment.id, {
              departureTime: $event,
            })
          "
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <AccommodationTypeSelect
          :value="firstTravelSegment.accommodationType"
          :rules="[required]"
          background-color="white"
          dense
          outlined
          required
          @input="
            saveTravelSegment(firstTravelSegment.id, {
              accommodationType: $event,
            })
          "
        />
      </v-col>
    </v-row>
    <v-divider class="my-4" />
    <h4>Return</h4>
    <v-row class="mt-4">
      <v-col cols="12">
        <TravelMethodSelect
          :value="lastTravelSegment.modeOfTransport"
          :rules="[required]"
          background-color="white"
          dense
          persistent-hint
          required
          outlined
          @input="
            saveTravelSegment(lastTravelSegment.id, {
              modeOfTransport: $event,
            })
          "
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="3"
      >
        <LocationsAutocomplete
          :value="lastTravelSegment.departureLocationId"
          :in-territory="allTravelWithinTerritory"
          :rules="[required]"
          label="To"
          background-color="white"
          dense
          outlined
          persistent-hint
          required
          @input="
            saveTravelSegment(lastTravelSegment.id, {
              departureLocationId: $event,
            })
          "
        />
      </v-col>
      <v-col
        cols="12"
        md="3"
      >
        <LocationsAutocomplete
          :value="firstTravelSegment.arrivalLocationId"
          :in-territory="allTravelWithinTerritory"
          :rules="[required]"
          label="From"
          background-color="white"
          dense
          outlined
          persistent-hint
          required
          @input="
            saveTravelSegment(firstTravelSegment.id, {
              arrivalLocationId: $event,
            })
          "
        />
      </v-col>
      <v-col
        cols="12"
        md="3"
      >
        <DatePicker
          :value="lastTravelSegment.departureOn"
          :min="firstTravelSegment.departureOn"
          :rules="[
            required,
            greaterThanOrEqualToDate(firstTravelSegment.departureOn, {
              referenceFieldLabel: 'previous departure date',
            }),
          ]"
          label="Date"
          dense
          persistent-hint
          @input="
            saveTravelSegment(lastTravelSegment.id, {
              departureOn: $event,
            })
          "
        />
      </v-col>
      <v-col
        cols="12"
        md="3"
      >
        <TimePicker
          :value="lastTravelSegment.departureTime"
          label="Time (24h)"
          persistent-hint
          @input="
            saveTravelSegment(lastTravelSegment.id, {
              departureTime: $event,
            })
          "
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12">
        <AccommodationTypeSelect
          :value="lastTravelSegment.accommodationType"
          :default-value="null"
          hint="Optional, set only if neccessary"
          placeholder="N/A"
          background-color="white"
          clearable
          dense
          outlined
          persistent-hint
          @input="
            saveTravelSegment(lastTravelSegment.id, {
              accommodationType: $event,
            })
          "
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue"
import { isEmpty, isNil } from "lodash"

import { required, greaterThanOrEqualToDate } from "@/utils/validators"

import travelSegmentsApi, { TRAVEL_METHODS } from "@/api/travel-segments-api"

import useSnack from "@/use/use-snack"
import useTravelSegments from "@/use/use-travel-segments"

import DatePicker from "@/components/common/DatePicker.vue"
import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
import TimePicker from "@/components/Utils/TimePicker.vue"
import TravelMethodSelect from "@/components/travel-segments/TravelMethodSelect.vue"
import AccommodationTypeSelect from "@/modules/travel-authorizations/components/AccommodationTypeSelect.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
  allTravelWithinTerritory: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(["updated"])

const travelSegmentActualsQuery = computed(() => ({
  where: {
    travelAuthorizationId: props.travelAuthorizationId,
    isActual: true,
  },
}))
const { travelSegments, isLoading, refresh } = useTravelSegments(travelSegmentActualsQuery)
const firstTravelSegment = computed(() => travelSegments.value[0])
const lastTravelSegment = computed(() => travelSegments.value[travelSegments.value.length - 1])

watch(
  () => isLoading.value,
  (newIsLoading, oldIsLoading) => {
    if (oldIsLoading === true && newIsLoading === false && isEmpty(travelSegments.value)) {
      // ensure default travel segments are created
    }
  },
  {
    immediate: true,
  }
)

const isSaving = ref(false)
const snack = useSnack()

async function saveTravelSegment(id, travelSegment) {
  isSaving.value = true

  try {
    await travelSegmentsApi.update(id, travelSegment)
    await refresh()
    emit("updated")
  } catch (error) {
    console.error(`Errored while saving travel segment: ${error}`)
    snack.error(`Errored while saving travel segment: ${error}`)
  } finally {
    isSaving.value = false
  }
}
</script>
