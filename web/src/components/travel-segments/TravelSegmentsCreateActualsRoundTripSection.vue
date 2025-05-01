<template>
  <div>
    <h4 class="mb-4 h-9">Depart</h4>

    <v-row>
      <v-col
        cols="12"
        md="3"
      >
        <LocationsAutocomplete
          v-model="tripOriginLocationId"
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
          v-model="tripDestinationLocationId"
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
          v-model="departTravelSegmentAttributes.departureOn"
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
          v-model="departTravelSegmentAttributes.departureTime"
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
          v-model="departTravelSegmentAttributes.modeOfTransport"
          :rules="[required]"
          dense
          persistent-hint
          required
          outlined
        />
      </v-col>
      <v-col
        v-if="departTravelSegmentAttributes.modeOfTransport === TRAVEL_METHODS.OTHER"
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="departTravelSegmentAttributes.modeOfTransportOther"
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
          v-model="departTravelSegmentAttributes.accommodationType"
          :rules="[required]"
          dense
          outlined
          required
        />
      </v-col>
      <v-col
        v-if="departTravelSegmentAttributes.accommodationType === ACCOMMODATION_TYPES.OTHER"
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="departTravelSegmentAttributes.accommodationTypeOther"
          label="Type of Accommodation - Other"
          :rules="[required]"
          dense
          outlined
          required
        />
      </v-col>
    </v-row>

    <v-divider class="my-4" />
    <h4 class="mb-4 h-9">Return</h4>

    <v-row>
      <v-col
        cols="12"
        md="3"
      >
        <LocationsAutocomplete
          v-model="tripDestinationLocationId"
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
          v-model="tripOriginLocationId"
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
          v-model="returnTravelSegmentAttributes.departureOn"
          label="Date"
          :min="departTravelSegmentAttributes.departureOn"
          :rules="[
            required,
            greaterThanOrEqualToDate(departTravelSegmentAttributes.departureOn, {
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
          v-model="returnTravelSegmentAttributes.departureTime"
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
          v-model="returnTravelSegmentAttributes.modeOfTransport"
          :rules="[required]"
          dense
          persistent-hint
          required
          outlined
        />
      </v-col>
      <v-col
        v-if="returnTravelSegmentAttributes.modeOfTransport === TRAVEL_METHODS.OTHER"
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="returnTravelSegmentAttributes.modeOfTransportOther"
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
          v-model="returnTravelSegmentAttributes.accommodationType"
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
        v-if="returnTravelSegmentAttributes.accommodationType === ACCOMMODATION_TYPES.OTHER"
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="returnTravelSegmentAttributes.accommodationTypeOther"
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
import { cloneDeep, first, isNil, last, pick } from "lodash"

import { required, greaterThanOrEqualToDate } from "@/utils/validators"

import travelSegmentsApi, {
  ACCOMMODATION_TYPES,
  TRAVEL_METHODS,
  PERMITTED_ATTRIBUTES_FOR_CLONE,
} from "@/api/travel-segments-api"

import useSnack from "@/use/use-snack"

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
  currentTravelSegmentEstimates: {
    type: Array,
    default: () => [],
    validator: (value) => value.every((travelSegment) => travelSegment.isActual === false),
  },
})

/**
 * @type {import('vue/types/v3-setup-context').EmitFn<{
 *   'saved': [number, number]
 *   'updated': [number, number]
 * }>}
 */
const emit = defineEmits(["saved", "updated"])

const travelSegmentsAttributes = ref([
  {
    travelAuthorizationId: props.travelAuthorizationId,
    isActual: true,
    segmentNumber: 1,
    departureLocationId: null,
    arrivalLocationId: null,
    departureOn: null,
    departureTime: null,
    modeOfTransport: TRAVEL_METHODS.AIRCRAFT,
    modeOfTransportOther: null,
    accommodationType: ACCOMMODATION_TYPES.HOTEL,
    accommodationTypeOther: null,
  },
  {
    travelAuthorizationId: props.travelAuthorizationId,
    isActual: true,
    segmentNumber: 2,
    departureLocationId: null,
    arrivalLocationId: null,
    departureOn: null,
    departureTime: null,
    modeOfTransport: TRAVEL_METHODS.AIRCRAFT,
    modeOfTransportOther: null,
    accommodationType: null,
    accommodationTypeOther: null,
  },
])

function applyExistingDefaultValues(newTravelSegments) {
  const firstTravelSegment = pick(first(newTravelSegments), PERMITTED_ATTRIBUTES_FOR_CLONE)
  const lastTravelSegment = pick(last(newTravelSegments), PERMITTED_ATTRIBUTES_FOR_CLONE)

  travelSegmentsAttributes.value = [
    {
      ...travelSegmentsAttributes.value[0],
      ...firstTravelSegment,
      modeOfTransport: firstTravelSegment?.modeOfTransport || TRAVEL_METHODS.AIRCRAFT,
      accommodationType: firstTravelSegment?.accommodationType || ACCOMMODATION_TYPES.HOTEL,
      isActual: true,
      segmentNumber: 1,
      travelAuthorizationId: props.travelAuthorizationId,
    },
    {
      ...travelSegmentsAttributes.value[1],
      ...lastTravelSegment,
      modeOfTransport: lastTravelSegment?.modeOfTransport || TRAVEL_METHODS.AIRCRAFT,
      accommodationType: null,
      isActual: true,
      segmentNumber: 2,
      travelAuthorizationId: props.travelAuthorizationId,
    },
  ]
}

watch(
  () => cloneDeep(props.currentTravelSegments),
  (newTravelSegments) => {
    applyExistingDefaultValues(newTravelSegments)
  },
  {
    deep: true,
    immediate: true,
  }
)

const departTravelSegmentAttributes = computed(() => first(travelSegmentsAttributes.value))
const returnTravelSegmentAttributes = computed(() => last(travelSegmentsAttributes.value))

const tripOriginLocationId = computed({
  get: () => departTravelSegmentAttributes.value?.departureLocationId,
  set: (value) => {
    if (!isNil(departTravelSegmentAttributes.value)) {
      departTravelSegmentAttributes.value.departureLocationId = value
    }

    if (!isNil(returnTravelSegmentAttributes.value)) {
      returnTravelSegmentAttributes.value.arrivalLocationId = value
    }
  },
})

const tripDestinationLocationId = computed({
  get: () => departTravelSegmentAttributes.value?.arrivalLocationId,
  set: (value) => {
    if (!isNil(departTravelSegmentAttributes.value)) {
      departTravelSegmentAttributes.value.arrivalLocationId = value
    }

    if (!isNil(returnTravelSegmentAttributes.value)) {
      returnTravelSegmentAttributes.value.departureLocationId = value
    }
  },
})

watch(
  () => cloneDeep(travelSegmentsAttributes.value),
  () => {
    emit("updated", travelSegmentsAttributes.value)
  },
  {
    deep: true,
  }
)

const isSaving = ref(false)
const snack = useSnack()

async function createNewTravelSegmentActuals() {
  const createdDepartTravelSegment = await travelSegmentsApi.create(
    departTravelSegmentAttributes.value
  )
  const createdReturnTravelSegment = await travelSegmentsApi.create(
    returnTravelSegmentAttributes.value
  )

  return [createdDepartTravelSegment.id, createdReturnTravelSegment.id]
}

async function save() {
  isSaving.value = true

  try {
    const createdTravelSegmentsIds = await createNewTravelSegmentActuals()
    emit("saved", createdTravelSegmentsIds)
  } catch (error) {
    console.error(`Errored while saving travel segments: ${error}`)
    snack.error(`Errored while saving travel segments: ${error}`)
  } finally {
    isSaving.value = false
  }
}

defineExpose({
  save,
})
</script>

<style scoped>
.h-9 {
  height: 2.25rem; /* 2.25 × 16 = 36px */
}
</style>
