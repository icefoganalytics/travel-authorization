<template>
  <v-skeleton-loader
    v-if="isNil(departTravelSegment) || isNil(returnTravelSegment)"
    type="card"
  />
  <div v-else>
    <h4 class="mb-4">Depart</h4>

    <v-row>
      <v-col
        cols="12"
        md="3"
      >
        <LocationsAutocomplete
          v-model="departTravelSegment.departureLocationId"
          label="From"
          :in-territory="allTravelWithinTerritory"
          :rules="[required]"
          dense
          outlined
          persistent-hint
          required
        />
      </v-col>
      <v-col
        cols="12"
        md="3"
      >
        <LocationsAutocomplete
          v-model="returnTravelSegment.arrivalLocationId"
          label="To"
          :in-territory="allTravelWithinTerritory"
          :rules="[required]"
          dense
          outlined
          persistent-hint
          required
        />
      </v-col>
      <v-col
        cols="12"
        md="3"
      >
        <DatePicker
          v-model="departTravelSegment.departureOn"
          label="Date"
          :rules="[required]"
          dense
          persistent-hint
        />
      </v-col>
      <v-col
        cols="12"
        md="3"
      >
        <TimePicker
          v-model="departTravelSegment.departureTime"
          label="Time (24h)"
          persistent-hint
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <TravelMethodSelect
          v-model="departTravelSegment.modeOfTransport"
          :rules="[required]"
          dense
          persistent-hint
          required
          outlined
        />
      </v-col>
      <v-col
        v-if="departTravelSegment.modeOfTransport === TRAVEL_METHODS.OTHER"
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="departTravelSegment.modeOfTransportOther"
          label="Travel Method - Other"
          :rules="[required]"
          dense
          outlined
          required
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <AccommodationTypeSelect
          v-model="departTravelSegment.accommodationType"
          :rules="[required]"
          dense
          outlined
          required
        />
      </v-col>
      <v-col
        v-if="departTravelSegment.accommodationType === ACCOMMODATION_TYPES.OTHER"
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="departTravelSegment.accommodationTypeOther"
          label="Type of Accommodation - Other"
          :rules="[required]"
          dense
          outlined
          required
        />
      </v-col>
    </v-row>

    <v-divider class="my-4" />
    <h4 class="mb-4">Return</h4>

    <v-row>
      <v-col
        cols="12"
        md="3"
      >
        <LocationsAutocomplete
          v-model="returnTravelSegment.departureLocationId"
          label="To"
          :in-territory="allTravelWithinTerritory"
          :rules="[required]"
          dense
          outlined
          persistent-hint
          required
        />
      </v-col>
      <v-col
        cols="12"
        md="3"
      >
        <LocationsAutocomplete
          v-model="departTravelSegment.arrivalLocationId"
          label="From"
          :in-territory="allTravelWithinTerritory"
          :rules="[required]"
          dense
          outlined
          persistent-hint
          required
        />
      </v-col>
      <v-col
        cols="12"
        md="3"
      >
        <DatePicker
          v-model="returnTravelSegment.departureOn"
          label="Date"
          :min="departTravelSegment.departureOn"
          :rules="[
            required,
            greaterThanOrEqualToDate(departTravelSegment.departureOn, {
              referenceFieldLabel: 'previous departure date',
            }),
          ]"
          dense
          persistent-hint
        />
      </v-col>
      <v-col
        cols="12"
        md="3"
      >
        <TimePicker
          v-model="returnTravelSegment.departureTime"
          label="Time (24h)"
          persistent-hint
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <TravelMethodSelect
          v-model="returnTravelSegment.modeOfTransport"
          :rules="[required]"
          dense
          persistent-hint
          required
          outlined
        />
      </v-col>
      <v-col
        v-if="returnTravelSegment.modeOfTransport === TRAVEL_METHODS.OTHER"
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="returnTravelSegment.modeOfTransportOther"
          label="Travel Method - Other"
          :rules="[required]"
          dense
          outlined
          required
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <AccommodationTypeSelect
          v-model="returnTravelSegment.accommodationType"
          :default-value="null"
          hint="Optional, set only if neccessary"
          placeholder="N/A"
          clearable
          dense
          outlined
          persistent-hint
        />
      </v-col>
      <v-col
        v-if="returnTravelSegment.accommodationType === ACCOMMODATION_TYPES.OTHER"
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="returnTravelSegment.accommodationTypeOther"
          label="Type of Accommodation - Other"
          :rules="[required]"
          dense
          outlined
          required
        />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue"
import { first, isEmpty, isNil, last } from "lodash"

import { required, greaterThanOrEqualToDate } from "@/utils/validators"

import travelSegmentsApi, { ACCOMMODATION_TYPES, TRAVEL_METHODS } from "@/api/travel-segments-api"

import useSnack from "@/use/use-snack"
import useTravelSegments from "@/use/use-travel-segments"

import TimePicker from "@/components/Utils/TimePicker.vue"
import DatePicker from "@/components/common/DatePicker.vue"
import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
import AccommodationTypeSelect from "@/components/travel-segments/AccommodationTypeSelect.vue"
import TravelMethodSelect from "@/components/travel-segments/TravelMethodSelect.vue"

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

/** @type {import('vue/types/v3-setup-context').EmitFn<{'saved': [number, number]}> */
const emit = defineEmits(["saved"])

const travelSegmentActualsQuery = computed(() => ({
  where: {
    travelAuthorizationId: props.travelAuthorizationId,
    isActual: true,
  },
}))
const { travelSegments, isLoading, refresh } = useTravelSegments(travelSegmentActualsQuery)

const departTravelSegment = computed(() => first(travelSegments.value))
const returnTravelSegment = computed(() => last(travelSegments.value))

watch(
  () => isLoading.value,
  (newIsLoading, oldIsLoading) => {
    if (oldIsLoading === true && newIsLoading === false && isEmpty(travelSegments.value)) {
      // TODO: ensure default travel segments are created
    }
  },
  {
    immediate: true,
  }
)

const isSaving = ref(false)
const snack = useSnack()

async function save() {
  isSaving.value = true

  try {
    await Promise.all([
      travelSegmentsApi.update(departTravelSegment.value.id, departTravelSegment.value),
      travelSegmentsApi.update(returnTravelSegment.value.id, returnTravelSegment.value),
    ])
    await refresh()
    emit("saved", [departTravelSegment.value.id, returnTravelSegment.value.id])
  } catch (error) {
    console.error(`Errored while saving travel segment: ${error}`)
    snack.error(`Errored while saving travel segment: ${error}`)
  } finally {
    isSaving.value = false
  }
}

defineExpose({
  save,
})
</script>
