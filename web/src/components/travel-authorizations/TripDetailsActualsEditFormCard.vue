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
              :value="travelAuthorization.tripType"
              :row="mdAndUp"
              @input="updateTripType"
            />
          </v-col>
        </v-row>

        <component
          :is="tripTypeComponent"
          v-if="tripTypeComponent && hasEnoughStops"
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
import { computed, nextTick, onMounted, ref, toRefs, watch } from "vue"
import { findLast, isNil } from "lodash"

import { required, isInteger, greaterThanOrEqualTo, lessThan } from "@/utils/validators"
import { ACCOMMODATION_TYPES, TRAVEL_METHODS } from "@/api/stops-api"

import useVuetify2 from "@/use/utils/use-vuetify2"
import useTravelAuthorization, { TRIP_TYPES } from "@/use/use-travel-authorization"

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
const { travelAuthorization, stops, firstStop, lastStop, save, newBlankStop, replaceStops } =
  useTravelAuthorization(travelAuthorizationId)

watch(
  () => firstStop.value,
  (newFirstStop) => {
    if (isNil(newFirstStop)) return

    const { departureDate } = newFirstStop
    emit("update:departureDate", departureDate)
  }
)

watch(
  () => lastStop.value,
  (newLastStop) => {
    if (isNil(newLastStop)) return

    const { locationId } = newLastStop
    emit("update:finalDestinationLocationId", locationId)
  }
)

const lastDepartureDate = computed(() => {
  if (travelAuthorization.value.tripType === TRIP_TYPES.ONE_WAY) {
    const lastDepartureStop = firstStop.value
    return lastDepartureStop.departureDate
  } else {
    const lastDepartureStop = findLast(stops.value, (stop) => !isNil(stop.departureDate))
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

const hasEnoughStops = computed(() => {
  switch (travelAuthorization.value.tripType) {
    case TRIP_TYPES.ROUND_TRIP:
      return stops.value.length === 2
    case TRIP_TYPES.ONE_WAY:
      return stops.value.length === 2
    case TRIP_TYPES.MULTI_CITY:
      return stops.value.length >= 3
    default:
      return true
  }
})

/** @typedef {import('vuetify/lib/components').VForm} VForm */
/** @type {import('vue').Ref<typeof VForm | null>} */
const form = ref(null)

onMounted(async () => {
  if (isNil(travelAuthorization.value.tripType)) {
    travelAuthorization.value.tripType = TRIP_TYPES.ROUND_TRIP
  }

  await nextTick()
  form.value?.resetValidation()
})

async function updateTripType(value) {
  travelAuthorization.value.tripType = value

  await ensureMinimalDefaultStops(value)

  await nextTick()
  form.value?.resetValidation()
}

async function ensureMinimalDefaultStops(tripType) {
  if (tripType === TRIP_TYPES.ROUND_TRIP) {
    return ensureMinimalDefaultRoundTripStops()
  } else if (tripType === TRIP_TYPES.ONE_WAY) {
    return ensureMinimalDefaultOneWayStops()
  } else if (tripType === TRIP_TYPES.MULTI_CITY) {
    return ensureMinimalDefaultMultiDestinationStops()
  } else {
    throw new Error("Invalid trip type")
  }
}

async function ensureMinimalDefaultRoundTripStops() {
  const newFirstStop = await newBlankStop({
    transport: TRAVEL_METHODS.AIRCRAFT,
    ...firstStop.value,
    accommodationType: firstStop.value.accommodationType || ACCOMMODATION_TYPES.HOTEL,
  })
  const newLastStop = await newBlankStop({
    ...lastStop.value,
    transport: TRAVEL_METHODS.AIRCRAFT,
    accommodationType: null,
  })
  return replaceStops([newFirstStop, newLastStop])
}

async function ensureMinimalDefaultOneWayStops() {
  const newFirstStop = await newBlankStop({
    ...firstStop.value,
    accommodationType: null,
    transport: TRAVEL_METHODS.AIRCRAFT,
  })
  const newLastStop = await newBlankStop({
    ...lastStop.value,
    transport: null,
    accommodationType: null,
  })
  return replaceStops([newFirstStop, newLastStop])
}

async function ensureMinimalDefaultMultiDestinationStops() {
  const newFirstStop = await newBlankStop({
    transport: TRAVEL_METHODS.AIRCRAFT,
    ...firstStop.value,
    accommodationType: firstStop.value.accommodationType || ACCOMMODATION_TYPES.HOTEL,
  })
  const newSecondStop = await newBlankStop({
    accommodationType: ACCOMMODATION_TYPES.HOTEL,
    transport: TRAVEL_METHODS.AIRCRAFT,
    ...lastStop.value,
  })
  const newThirdStop = await newBlankStop({
    transport: null,
    accommodationType: null,
  })
  return replaceStops([newFirstStop, newSecondStop, newThirdStop])
}

defineExpose({
  save,
  validate: () => form.value?.validate(),
})
</script>
