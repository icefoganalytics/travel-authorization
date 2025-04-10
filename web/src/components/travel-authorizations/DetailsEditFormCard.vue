<template>
  <v-card>
    <v-card-title><h3>Details</h3></v-card-title>
    <v-card-text>
      <v-form
        ref="form"
        lazy-validation
      >
        <v-row>
          <v-col cols="12">
            <v-radio-group
              :value="travelAuthorization.tripType"
              :row="mdAndUp"
              @change="updateTripType"
            >
              <v-radio
                label="Round trip"
                :value="TRIP_TYPES.ROUND_TRIP"
              ></v-radio>
              <v-radio
                label="One way"
                :value="TRIP_TYPES.ONE_WAY"
              ></v-radio>
              <v-radio
                label="Multi-city"
                :value="TRIP_TYPES.MULTI_CITY"
              ></v-radio>
            </v-radio-group>
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
              v-model="travelAuthorization.daysOffTravelStatus"
              :rules="[isInteger]"
              label="Days on non-travel status"
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

import { required, isInteger } from "@/utils/validators"
import { ACCOMMODATION_TYPES, TRAVEL_METHODS } from "@/api/stops-api"

import useVuetify2 from "@/use/utils/use-vuetify2"
import useTravelAuthorization, { TRIP_TYPES } from "@/use/use-travel-authorization"

import DatePicker from "@/components/common/DatePicker.vue"
import TravelDurationTextField from "@/components/travel-authorizations/details-edit-form-card/TravelDurationTextField.vue"

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
