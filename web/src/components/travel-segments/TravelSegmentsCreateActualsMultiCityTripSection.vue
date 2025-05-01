<template>
  <div>
    <h4 class="mb-4 h-9">Leg 1</h4>

    <v-row>
      <v-col
        cols="12"
        md="3"
      >
        <LocationsAutocomplete
          v-model="firstTravelSegmentAttributes.departureLocationId"
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
          v-model="firstTravelSegmentAttributes.arrivalLocationId"
          label="To"
          :in-territory="allTravelWithinTerritory"
          :rules="[required]"
          dense
          outlined
          persistent-hint
          required
          @input="updateTravelSegmentAttributeByIndex(1, 'departureLocationId', $event)"
        />
      </v-col>
      <v-col
        cols="12"
        md="3"
      >
        <DatePicker
          v-model="firstTravelSegmentAttributes.departureOn"
          label="Date"
          :rules="[required]"
          dense
          persistent-hint
          @input="nudgeLaterTravelSegmentsDates(1, $event)"
        />
      </v-col>
      <v-col
        cols="12"
        md="3"
      >
        <TimePicker
          v-model="firstTravelSegmentAttributes.departureTime"
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
          v-model="firstTravelSegmentAttributes.modeOfTransport"
          :rules="[required]"
          dense
          persistent-hint
          required
          outlined
        />
      </v-col>
      <v-col
        v-if="firstTravelSegmentAttributes.modeOfTransport === TRAVEL_METHODS.OTHER"
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="firstTravelSegmentAttributes.modeOfTransportOther"
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
          v-model="firstTravelSegmentAttributes.accommodationType"
          :rules="[required]"
          dense
          outlined
          required
        />
      </v-col>
      <v-col
        v-if="firstTravelSegmentAttributes.accommodationType === ACCOMMODATION_TYPES.OTHER"
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="firstTravelSegmentAttributes.accommodationTypeOther"
          label="Type of Accommodation - Other"
          :rules="[required]"
          dense
          outlined
          required
        />
      </v-col>
    </v-row>

    <div
      v-for="index in times(travelSegmentsAttributes.length - 1, (i) => i + 1)"
      :key="index"
    >
      <v-divider class="my-4" />
      <h4 class="d-flex justify-space-between mb-4 h-9">
        Leg {{ index + 1 }}

        <v-btn
          v-if="travelSegmentsAttributes.length > 2"
          title="Remove leg"
          icon
          color="error"
          class="my-0"
          @click="removeTravelSegmentAttribute(index)"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </h4>

      <v-row>
        <v-col
          cols="12"
          md="3"
        >
          <LocationsAutocomplete
            v-model="travelSegmentsAttributes[index].departureLocationId"
            label="From"
            :in-territory="allTravelWithinTerritory"
            :rules="[required]"
            dense
            outlined
            persistent-hint
            required
            @input="updateTravelSegmentAttributeByIndex(index - 1, 'arrivalLocationId', $event)"
          />
        </v-col>
        <v-col
          cols="12"
          md="3"
        >
          <LocationsAutocomplete
            v-model="travelSegmentsAttributes[index].arrivalLocationId"
            label="To"
            :in-territory="allTravelWithinTerritory"
            :rules="[required]"
            dense
            outlined
            persistent-hint
            required
            @input="updateTravelSegmentAttributeByIndex(index + 1, 'departureLocationId', $event)"
          />
        </v-col>
        <v-col
          cols="12"
          md="3"
        >
          <DatePicker
            v-model="travelSegmentsAttributes[index].departureOn"
            label="Date"
            :min="travelSegmentsAttributes[index - 1].departureOn"
            :rules="[
              required,
              greaterThanOrEqualToDate(travelSegmentsAttributes[index - 1].departureOn, {
                referenceFieldLabel: 'previous departure date',
              }),
            ]"
            dense
            persistent-hint
            @input="nudgeLaterTravelSegmentsDates(index + 1, $event)"
          />
        </v-col>
        <v-col
          cols="12"
          md="3"
        >
          <TimePicker
            v-model="travelSegmentsAttributes[index].departureTime"
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
            v-model="travelSegmentsAttributes[index].modeOfTransport"
            :rules="[required]"
            dense
            persistent-hint
            required
            outlined
          />
        </v-col>
        <v-col
          v-if="travelSegmentsAttributes[index].modeOfTransport === TRAVEL_METHODS.OTHER"
          cols="12"
          md="6"
        >
          <v-text-field
            v-model="travelSegmentsAttributes[index].modeOfTransportOther"
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
            v-model="travelSegmentsAttributes[index].accommodationType"
            v-bind="finalAccommodationTypeSelectDefaults(index)"
            dense
            outlined
          />
        </v-col>
        <v-col
          v-if="travelSegmentsAttributes[index].accommodationType === ACCOMMODATION_TYPES.OTHER"
          cols="12"
          md="6"
        >
          <v-text-field
            v-model="travelSegmentsAttributes[index].accommodationTypeOther"
            label="Type of Accommodation - Other"
            :rules="[required]"
            dense
            outlined
            required
          />
        </v-col>
      </v-row>
    </div>

    <v-divider class="my-4" />
    <v-row>
      <v-col cols="12">
        <v-btn
          color="primary"
          class="my-0"
          @click="addTravelSegmentAttribute"
        >
          <v-icon left>mdi-plus</v-icon> Add Leg
        </v-btn>
      </v-col>
    </v-row>
    <v-divider class="mt-4 mb-10" />
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue"
import { cloneDeep, first, isNil, last, pick, times } from "lodash"

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
  currentTravelSegments: {
    type: Array,
    default: () => [],
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
  const newTravelSegmentsSize = Math.max(
    travelSegmentsAttributes.value.length,
    newTravelSegments.length
  )

  const newTravelSegmentsAttributes = []
  for (let index = 0; index < newTravelSegmentsSize; index++) {
    const currentTravelSegmentAttributes = travelSegmentsAttributes.value[index]
    const newTravelSegment = pick(newTravelSegments[index], PERMITTED_ATTRIBUTES_FOR_CLONE)

    const isLastTravelSegment = index === newTravelSegmentsSize - 1
    const accommodationType = isLastTravelSegment
      ? null
      : newTravelSegment?.accommodationType || ACCOMMODATION_TYPES.HOTEL

    const newTravelSegmentAttributes = {
      ...currentTravelSegmentAttributes,
      ...newTravelSegment,
      modeOfTransport: newTravelSegment?.modeOfTransport || TRAVEL_METHODS.AIRCRAFT,
      accommodationType,
      isActual: true,
      segmentNumber: index + 1,
      travelAuthorizationId: props.travelAuthorizationId,
    }

    newTravelSegmentsAttributes.push(newTravelSegmentAttributes)
  }

  travelSegmentsAttributes.value = newTravelSegmentsAttributes
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

const firstTravelSegmentAttributes = computed(() => first(travelSegmentsAttributes.value))

function updateTravelSegmentAttributeByIndex(index, attribute, value) {
  const travelSegment = travelSegmentsAttributes.value[index]
  if (isNil(travelSegment)) return

  travelSegment[attribute] = value
}

function nudgeLaterTravelSegmentsDates(index, value) {
  for (let i = index; i < travelSegmentsAttributes.value.length; i++) {
    const travelSegment = travelSegmentsAttributes.value[i]
    if (isNil(travelSegment)) return

    if (isNil(value) || value > travelSegment.departureOn) {
      travelSegment.departureOn = value
    }
  }
}

function removeTravelSegmentAttribute(index) {
  travelSegmentsAttributes.value.splice(index, 1)
}

function addTravelSegmentAttribute() {
  const previousLastTravelSegment = last(travelSegmentsAttributes.value)

  travelSegmentsAttributes.value.push({
    travelAuthorizationId: props.travelAuthorizationId,
    isActual: true,
    segmentNumber: travelSegmentsAttributes.value.length + 1,
    departureLocationId: previousLastTravelSegment.arrivalLocationId,
    arrivalLocationId: null,
    departureOn: previousLastTravelSegment.departureOn,
    departureTime: null,
    modeOfTransport: TRAVEL_METHODS.AIRCRAFT,
    modeOfTransportOther: null,
    accommodationType: null,
    accommodationTypeOther: null,
  })

  previousLastTravelSegment.accommodationType =
    previousLastTravelSegment.accommodationType || ACCOMMODATION_TYPES.HOTEL
}

function finalAccommodationTypeSelectDefaults(index) {
  if (index === travelSegmentsAttributes.value.length - 1) {
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

async function deleteCurrentTravelSegments() {
  await Promise.all(
    props.currentTravelSegments.map((travelSegment) => travelSegmentsApi.destroy(travelSegment.id))
  )
}

async function createNewTravelSegments() {
  const createdTravelSegmentsIds = []
  for (const travelSegmentAttributes of travelSegmentsAttributes.value) {
    const createdTravelSegment = await travelSegmentsApi.create(travelSegmentAttributes)
    createdTravelSegmentsIds.push(createdTravelSegment.id)
  }

  return createdTravelSegmentsIds
}

async function save() {
  isSaving.value = true

  try {
    // TODO: Consider switching to a dedicated replace endpoint?
    await deleteCurrentTravelSegments()
    const createdTravelSegmentsIds = await createNewTravelSegments()
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
