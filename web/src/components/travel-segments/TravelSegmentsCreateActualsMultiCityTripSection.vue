<template>
  <div>
    <h4 class="mb-4">Leg 1</h4>

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
          @input="nudgeTravelSegmentDateByIndexIfGreater(1, $event)"
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

    <v-divider class="my-4" />
    <h4 class="mb-4">Leg 2</h4>

    <v-row>
      <v-col
        cols="12"
        md="3"
      >
        <LocationsAutocomplete
          v-model="secondTravelSegmentAttributes.departureLocationId"
          label="From"
          :in-territory="allTravelWithinTerritory"
          :rules="[required]"
          dense
          outlined
          persistent-hint
          required
          @input="updateTravelSegmentAttributeByIndex(0, 'arrivalLocationId', $event)"
        />
      </v-col>
      <v-col
        cols="12"
        md="3"
      >
        <LocationsAutocomplete
          v-model="secondTravelSegmentAttributes.arrivalLocationId"
          label="To"
          :in-territory="allTravelWithinTerritory"
          :rules="[required]"
          dense
          outlined
          persistent-hint
          required
          @input="updateTravelSegmentAttributeByIndex(2, 'departureLocationId', $event)"
        />
      </v-col>
      <v-col
        cols="12"
        md="3"
      >
        <DatePicker
          v-model="secondTravelSegmentAttributes.departureOn"
          label="Date"
          :min="firstTravelSegmentAttributes.departureOn"
          :rules="[
            required,
            greaterThanOrEqualToDate(firstTravelSegmentAttributes.departureOn, {
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
          v-model="secondTravelSegmentAttributes.departureTime"
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
          v-model="secondTravelSegmentAttributes.modeOfTransport"
          :rules="[required]"
          dense
          persistent-hint
          required
          outlined
        />
      </v-col>
      <v-col
        v-if="secondTravelSegmentAttributes.modeOfTransport === TRAVEL_METHODS.OTHER"
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="secondTravelSegmentAttributes.modeOfTransportOther"
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
          v-model="secondTravelSegmentAttributes.accommodationType"
          v-bind="finalAccommodationTypeSelectDefaults(0)"
          dense
          outlined
        />
      </v-col>
      <v-col
        v-if="secondTravelSegmentAttributes.accommodationType === ACCOMMODATION_TYPES.OTHER"
        cols="12"
        md="6"
      >
        <v-text-field
          v-model="secondTravelSegmentAttributes.accommodationTypeOther"
          label="Type of Accommodation - Other"
          :rules="[required]"
          dense
          outlined
          required
        />
      </v-col>
    </v-row>

    <template v-if="travelSegmentsAttributes.length > 3">
      <div
        v-for="(_, index) in travelSegmentsAttributes.slice(0, -3)"
        :key="index"
      >
        <v-divider class="my-4" />
        <h4 class="d-flex justify-space-between align-center">
          Leg {{ index + 3 }}

          <v-btn
            title="Remove leg"
            icon
            color="error"
            class="my-0"
            @click="removeTravelSegmentAttribute(index + 2)"
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
              v-model="travelSegmentsAttributes[index + 2].departureLocationId"
              label="From"
              :in-territory="allTravelWithinTerritory"
              :rules="[required]"
              dense
              outlined
              persistent-hint
              required
              @input="updateTravelSegmentAttributeByIndex(index + 1, 'arrivalLocationId', $event)"
            />
          </v-col>
          <v-col
            cols="12"
            md="3"
          >
            <LocationsAutocomplete
              v-model="travelSegmentsAttributes[index + 2].arrivalLocationId"
              label="To"
              :in-territory="allTravelWithinTerritory"
              :rules="[required]"
              dense
              outlined
              persistent-hint
              required
              @input="updateTravelSegmentAttributeByIndex(index + 3, 'departureLocationId', $event)"
            />
          </v-col>
          <v-col
            cols="12"
            md="3"
          >
            <DatePicker
              v-model="travelSegmentsAttributes[index + 2].departureOn"
              label="Date"
              :min="travelSegmentsAttributes[index + 1].departureOn"
              :rules="[
                required,
                greaterThanOrEqualToDate(travelSegmentsAttributes[index + 1].departureOn, {
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
              v-model="travelSegmentsAttributes[index + 2].departureTime"
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
              v-model="travelSegmentsAttributes[index + 2].modeOfTransport"
              :rules="[required]"
              dense
              persistent-hint
              required
              outlined
            />
          </v-col>
          <v-col
            v-if="travelSegmentsAttributes[index + 2].modeOfTransport === TRAVEL_METHODS.OTHER"
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="travelSegmentsAttributes[index + 2].modeOfTransportOther"
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
              v-model="travelSegmentsAttributes[index + 2].accommodationType"
              v-bind="finalAccommodationTypeSelectDefaults(index + 2)"
              dense
              outlined
            />
          </v-col>
          <v-col
            v-if="
              travelSegmentsAttributes[index + 2].accommodationType === ACCOMMODATION_TYPES.OTHER
            "
            cols="12"
            md="6"
          >
            <v-text-field
              v-model="travelSegmentsAttributes[index + 2].accommodationTypeOther"
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

const firstTravelSegmentAttributes = computed(() => first(travelSegmentsAttributes.value))
const secondTravelSegmentAttributes = computed(() => last(travelSegmentsAttributes.value))

function updateTravelSegmentAttributeByIndex(index, attribute, value) {
  const travelSegment = travelSegmentsAttributes.value[index]
  if (isNil(travelSegment)) return

  travelSegment[attribute] = value
}

function nudgeTravelSegmentDateByIndexIfGreater(index, value) {
  const travelSegment = travelSegmentsAttributes.value[index]
  if (isNil(travelSegment)) return

  if (value > travelSegment.departureOn) {
    travelSegment.departureOn = value
  }
}

function removeTravelSegmentAttribute(index) {
  travelSegmentsAttributes.value.splice(index, 1)
}

function addTravelSegmentAttribute() {
  // TODO: update previous last step accommodation type to be non-null
  travelSegmentsAttributes.value.push({
    travelAuthorizationId: props.travelAuthorizationId,
    isActual: true,
    segmentNumber: travelSegmentsAttributes.value.length + 1,
    departureLocationId: null,
    arrivalLocationId: null,
    departureOn: null,
    departureTime: null,
    modeOfTransport: TRAVEL_METHODS.AIRCRAFT,
    modeOfTransportOther: null,
    accommodationType: null,
    accommodationTypeOther: null,
  })
}

function finalAccommodationTypeSelectDefaults(index) {
  if (index === travelSegmentsAttributes.value.length - 2) {
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
