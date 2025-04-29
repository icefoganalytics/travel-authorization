<template>
  <v-card>
    <v-card-title><h3>Update Trip Details</h3></v-card-title>
    <v-card-subtitle>Update trip details with actual travel times</v-card-subtitle>
    <v-skeleton-loader
      v-if="isNil(travelAuthorization?.id)"
      type="card"
    />
    <v-card-text v-else>
      <v-form
        ref="form"
        lazy-validation
      >
        <v-row>
          <v-col cols="12">
            <TripTypeRadioGroup
              v-model="travelAuthorization.tripType"
              :row="mdAndUp"
            />
          </v-col>
        </v-row>

        <component
          :is="tripTypeComponent"
          v-if="tripTypeComponent && hasEnoughTripSegments"
          :travel-authorization-id="travelAuthorizationId"
          :value="stops"
          :all-travel-within-territory="travelAuthorization.allTravelWithinTerritory"
          class="mt-3"
          @input="replaceStops"
        />
        <div v-else>Trip type {{ travelAuthorization.tripType }} not implemented!</div>
        <v-row>
          <v-col
            cols="12"
            md="2"
          >
            <TravelDurationTextField
              v-model="travelAuthorization.travelDuration"
              :stops="travelAuthorization.stops"
            />
          </v-col>
          <v-col
            cols="12"
            md="3"
          >
            <v-text-field
              v-model.number="travelAuthorization.daysOffTravelStatus"
              label="Days on non-travel status"
              :min="0"
              :max="travelAuthorization.travelDuration - 1"
              :rules="[
                isInteger,
                greaterThanOrEqualTo(0),
                lessThan(travelAuthorization.travelDuration, {
                  referenceFieldLabel: 'the number of travel days',
                }),
              ]"
              type="number"
              dense
              required
              outlined
            ></v-text-field>
          </v-col>
          <v-col
            cols="12"
            md="3"
          >
            <DatePicker
              v-model="travelAuthorization.dateBackToWork"
              :min="lastDepartureDate"
              :rules="[required]"
              label="Expected Date return to work"
              dense
              required
              @input="emit('update:returnDate', $event)"
            />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, nextTick, ref, toRefs, watch } from "vue"
import { findLast, isNil } from "lodash"

import { required, isInteger, greaterThanOrEqualTo, lessThan } from "@/utils/validators"

import useVuetify2 from "@/use/utils/use-vuetify2"
import useSnack from "@/use/use-snack"
import useTravelAuthorization, { TRIP_TYPES } from "@/use/use-travel-authorization"
import useTravelSegments, { ACCOMMODATION_TYPES, TRAVEL_METHODS } from "@/use/use-travel-segments"

import DatePicker from "@/components/common/DatePicker.vue"
import TripTypeRadioGroup from "@/components/travel-authorizations/TripTypeRadioGroup.vue"
import TravelDurationTextField from "@/components/travel-authorizations/details-edit-form-card/TravelDurationTextField.vue"

/**
 * Travel time business rules:
 * - travel start date must be earlier or the same day as end date
 * - travel days are the duration of days lapsed between the start and end date
 * - there must be more travel days than days on non-travel status
 * - the date back to work must be the greater than or equal to the return date
 * - date back to work is independent of non-travel status
 */

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits([
  "update:finalDestinationLocationId",
  "update:departureDate",
  "update:returnDate",
])

const { mdAndUp } = useVuetify2()

const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization, save: saveTravelAuthorization } =
  useTravelAuthorization(travelAuthorizationId)

const travelSegmentActualsQuery = computed(() => ({
  where: {
    travelAuthorizationId: props.travelAuthorizationId,
    isActual: true,
  },
}))
const { travelSegments } = useTravelSegments(travelSegmentActualsQuery)
const firstTravelSegment = computed(() => travelSegments.value[0])
const lastTravelSegment = computed(() => travelSegments.value[travelSegments.value.length - 1])

/** @typedef {import('vuetify/lib/components').VForm} VForm */
/** @type {import('vue').Ref<typeof VForm | null>} */
const form = ref(null)

watch(
  () => travelAuthorization.value.tripType,
  async (newTripType) => {
    if (isNil(newTripType)) return

    await ensureMinimalDefaultTravelSegments(newTripType)

    await nextTick()
    form.value?.resetValidation()
  },
  {
    immediate: true,
  }
)

watch(
  () => firstTravelSegment.value,
  (newFirstTravelSegment) => {
    if (isNil(newFirstTravelSegment)) return

    const { departureDate } = newFirstTravelSegment
    emit("update:departureDate", departureDate)
  }
)

watch(
  () => lastTravelSegment.value,
  (newLastTravelSegment) => {
    if (isNil(newLastTravelSegment)) return

    const { locationId } = newLastTravelSegment
    emit("update:finalDestinationLocationId", locationId)
  }
)

const lastDepartureDate = computed(() => {
  if (travelAuthorization.value.tripType === TRIP_TYPES.ONE_WAY) {
    const lastDepartureStop = firstTravelSegment.value
    return lastDepartureStop.departureDate
  } else {
    const lastDepartureStop = findLast(travelSegments.value, (stop) => !isNil(stop.departureDate))
    return lastDepartureStop?.departureDate
  }
})

watch(
  () => lastDepartureDate.value,
  (newLastDepartureDate) => {
    if (isNil(newLastDepartureDate)) return
    if (
      !isNil(travelAuthorization.value.dateBackToWork) &&
      newLastDepartureDate < travelAuthorization.value.dateBackToWork
    ) {
      return
    }

    travelAuthorization.value.dateBackToWork = newLastDepartureDate
    emit("update:returnDate", newLastDepartureDate)
  }
)

const tripTypeComponent = computed(() => {
  switch (travelAuthorization.value.tripType) {
    case TRIP_TYPES.ROUND_TRIP:
      return () =>
        import(
          "@/components/travel-authorizations/details-edit-form-card/RoundTripStopsSection.vue"
        )
    case TRIP_TYPES.ONE_WAY:
      return () =>
        import("@/components/travel-authorizations/details-edit-form-card/OneWayStopsSection.vue")
    case TRIP_TYPES.MULTI_CITY:
      return () =>
        import(
          "@/components/travel-authorizations/details-edit-form-card/MultiDestinationStopsSection.vue"
        )
    default:
      return null
  }
})

const hasEnoughTripSegments = computed(() => {
  switch (travelAuthorization.value.tripType) {
    case TRIP_TYPES.ROUND_TRIP:
      return travelSegments.value.length === 2
    case TRIP_TYPES.ONE_WAY:
      return travelSegments.value.length === 1
    case TRIP_TYPES.MULTI_CITY:
      return travelSegments.value.length >= 2
    default:
      return false
  }
})

async function ensureMinimalDefaultTravelSegments(tripType) {
  if (tripType === TRIP_TYPES.ROUND_TRIP) {
    return ensureMinimalDefaultRoundTripTravelSegments()
  } else if (tripType === TRIP_TYPES.ONE_WAY) {
    return ensureMinimalDefaultOneWayTravelSegments()
  } else if (tripType === TRIP_TYPES.MULTI_CITY) {
    return ensureMinimalDefaultMultiDestinationTravelSegments()
  } else {
    throw new Error("Invalid trip type")
  }
}

// TODO: implement as update or create.
async function newBlankTravelSegment(attributes) {
  return {
    ...attributes,
    travelAuthorizationId: props.travelAuthorizationId,
    isActual: true,
  }
}

// TODO: implement as update or create, or maybe just push to the lower component layer
async function replaceStops(stops) {
  // TODO
  console.log("TODO: replaceStops", stops)
}

async function ensureMinimalDefaultRoundTripTravelSegments() {
  const newFirstTravelSegment = await newBlankTravelSegment({
    transport: TRAVEL_METHODS.AIRCRAFT,
    ...firstTravelSegment.value,
    accommodationType: firstTravelSegment.value.accommodationType || ACCOMMODATION_TYPES.HOTEL,
  })
  const newLastTravelSegment = await newBlankTravelSegment({
    ...lastTravelSegment.value,
    transport: TRAVEL_METHODS.AIRCRAFT,
    accommodationType: null,
  })
  return replaceStops([newFirstTravelSegment, newLastTravelSegment])
}

async function ensureMinimalDefaultOneWayTravelSegments() {
  const newFirstTravelSegment = await newBlankTravelSegment({
    ...firstTravelSegment.value,
    accommodationType: null,
    transport: TRAVEL_METHODS.AIRCRAFT,
  })
  const newLastTravelSegment = await newBlankTravelSegment({
    ...lastTravelSegment.value,
    transport: null,
    accommodationType: null,
  })
  return replaceStops([newFirstTravelSegment, newLastTravelSegment])
}

async function ensureMinimalDefaultMultiDestinationTravelSegments() {
  const newFirstTravelSegment = await newBlankTravelSegment({
    transport: TRAVEL_METHODS.AIRCRAFT,
    ...firstTravelSegment.value,
    accommodationType: firstTravelSegment.value.accommodationType || ACCOMMODATION_TYPES.HOTEL,
  })
  const newSecondStop = await newBlankTravelSegment({
    accommodationType: ACCOMMODATION_TYPES.HOTEL,
    transport: TRAVEL_METHODS.AIRCRAFT,
    ...lastTravelSegment.value,
  })
  const newThirdStop = await newBlankTravelSegment({
    transport: null,
    accommodationType: null,
  })
  return replaceStops([newFirstTravelSegment, newSecondStop, newThirdStop])
}

const isSaving = ref(false)
const snack = useSnack()

async function save() {
  isSaving.value = true
  try {
    await saveTravelAuthorization()
  } catch (error) {
    console.error(`Failed to save travel authorization: ${error}`, { error })
    snack.error(`Failed to save travel authorization: ${error}`)
  } finally {
    isSaving.value = false
  }
}

defineExpose({
  save,
  validate: () => form.value?.validate(),
})
</script>
