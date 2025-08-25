<template>
  <v-skeleton-loader
    v-if="isNil(travelAuthorization?.id)"
    type="card"
  />
  <v-form
    v-else
    ref="form"
    lazy-validation
  >
    <v-row>
      <v-col cols="12">
        <TripTypeRadioGroup
          v-model="tripType"
          :row="mdAndUp"
          @input="resetFormValidation"
        />
      </v-col>
    </v-row>

    <component
      :is="tripTypeComponent"
      v-if="tripTypeComponent"
      class="mt-3"
      :travel-authorization-id="travelAuthorizationId"
      :all-travel-within-territory="travelAuthorization.allTravelWithinTerritory"
      :current-travel-segment-estimates="travelSegments"
      @updated="updateTravelSegmentsAttributes"
    />
    <div v-else>Trip type {{ tripType }} not implemented!</div>
    <v-row class="mt-6">
      <v-col
        cols="12"
        md="2"
      >
        <TravelDurationFromTravelSegmentsTextField
          v-model="travelAuthorization.travelDurationEstimate"
          :travel-segments="travelSegmentsAttributes"
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
        lg="3"
      >
        <v-text-field
          v-model.number="travelAuthorization.daysOffTravelStatusEstimate"
          label="Days on non-travel status"
          :min="0"
          :max="travelAuthorization.travelDurationEstimate - 1"
          :rules="[
            isInteger,
            greaterThanOrEqualTo(0),
            lessThan(travelAuthorization.travelDurationEstimate, {
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
        md="5"
        lg="4"
      >
        <DatePicker
          v-model="travelAuthorization.dateBackToWorkEstimate"
          :min="latestDepartureDate"
          :rules="[required]"
          label="Expected Date return to work"
          dense
          required
          @input="emit('update:returnDate', $event)"
        />
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
import { computed, defineAsyncComponent, nextTick, ref, toRefs } from "vue"
import { max, isNil } from "lodash"

import { required, isInteger, greaterThanOrEqualTo, lessThan } from "@/utils/validators"

import useRouteQuery from "@/use/utils/use-route-query"
import useDisplayVuetify2 from "@/use/utils/use-display-vuetify2"
import useTravelAuthorization, { TRIP_TYPES } from "@/use/use-travel-authorization"
import useTravelSegments from "@/use/use-travel-segments"

import DatePicker from "@/components/common/DatePicker.vue"
import TripTypeRadioGroup from "@/components/travel-authorizations/TripTypeRadioGroup.vue"
import TravelDurationFromTravelSegmentsTextField from "@/components/travel-authorizations/TravelDurationFromTravelSegmentsTextField.vue"

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

const { mdAndUp } = useDisplayVuetify2()

const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization, save } = useTravelAuthorization(travelAuthorizationId)

const defaultTripType = computed(() => travelAuthorization.value.tripTypeEstimate)
const tripType = useRouteQuery("trip_type", defaultTripType)

const travelSegmentEstimatesQuery = computed(() => ({
  where: {
    travelAuthorizationId: props.travelAuthorizationId,
    isActual: false,
  },
}))
const { travelSegments } = useTravelSegments(travelSegmentEstimatesQuery)

const latestDepartureDate = ref(null)
const travelSegmentsAttributes = ref([])

function updateTravelSegmentsAttributes(newTravelSegmentsAttributes) {
  travelSegmentsAttributes.value = newTravelSegmentsAttributes

  updateDepartureDate(newTravelSegmentsAttributes)
  updateFinalDestinationLocationId(newTravelSegmentsAttributes)
  updateDateBackToWorkAndReturnDate(newTravelSegmentsAttributes)
}

function updateDepartureDate(newTravelSegmentsAttributes) {
  const departureDate = newTravelSegmentsAttributes.at(0)?.departureOn
  if (!isNil(departureDate)) {
    emit("update:departureDate", departureDate)
  }
}

function updateFinalDestinationLocationId(newTravelSegmentsAttributes) {
  let finalDestinationLocationId = null
  if (tripType.value === TRIP_TYPES.ROUND_TRIP) {
    finalDestinationLocationId = newTravelSegmentsAttributes.at(-2)?.arrivalLocationId
  } else {
    finalDestinationLocationId = newTravelSegmentsAttributes.at(-1)?.arrivalLocationId
  }

  if (!isNil(finalDestinationLocationId)) {
    emit("update:finalDestinationLocationId", finalDestinationLocationId)
  }
}

function updateDateBackToWorkAndReturnDate(newTravelSegmentsAttributes) {
  const newLatestDepartureDate = max(
    newTravelSegmentsAttributes.map(
      (travelSegmentAttributes) => travelSegmentAttributes.departureOn
    )
  )
  if (!isNil(newLatestDepartureDate)) {
    latestDepartureDate.value = newLatestDepartureDate

    const currentReturnDate = travelAuthorization.value?.dateBackToWorkEstimate
    if (isNil(currentReturnDate) || newLatestDepartureDate > currentReturnDate) {
      travelAuthorization.value.dateBackToWorkEstimate = newLatestDepartureDate
      emit("update:returnDate", newLatestDepartureDate)
    }
  }
}

const TravelSegmentsAttributesRoundTripSection = defineAsyncComponent(
  () => import("@/components/travel-segments/TravelSegmentsAttributesRoundTripSection.vue")
)
const TravelSegmentsAttributesOneWayTripSection = defineAsyncComponent(
  () => import("@/components/travel-segments/TravelSegmentsAttributesOneWayTripSection.vue")
)
const TravelSegmentsAttributesMultiCityTripSection = defineAsyncComponent(
  () => import("@/components/travel-segments/TravelSegmentsAttributesMultiCityTripSection.vue")
)

const tripTypeComponent = computed(() => {
  switch (tripType.value) {
    case TRIP_TYPES.ROUND_TRIP:
      return TravelSegmentsAttributesRoundTripSection
    case TRIP_TYPES.ONE_WAY:
      return TravelSegmentsAttributesOneWayTripSection
    case TRIP_TYPES.MULTI_CITY:
      return TravelSegmentsAttributesMultiCityTripSection
    default:
      return null
  }
})

/** @typedef {import('vuetify/lib/components').VForm} VForm */
/** @type {import('vue').Ref<typeof VForm | null>} */
const form = ref(null)
const isSaving = ref(false)

async function resetFormValidation() {
  await nextTick()
  form.value?.resetValidation()
}

async function saveWrapper() {
  if (isNil(form.value)) return
  if (!form.value.validate()) return

  isSaving.value = true
  try {
    await save({
      tripTypeEstimate: tripType.value,
      travelDurationEstimate: travelAuthorization.value.travelDurationEstimate,
      daysOffTravelStatusEstimate: travelAuthorization.value.daysOffTravelStatusEstimate,
      dateBackToWorkEstimate: travelAuthorization.value.dateBackToWorkEstimate,
      travelSegmentEstimatesAttributes: travelSegmentsAttributes.value,
    })
  } catch (error) {
    console.error(`Failed to save travel authorization: ${error}`, { error })
    throw error
  } finally {
    isSaving.value = false
  }
}

defineExpose({
  save: saveWrapper,
  validate: () => form.value?.validate(),
})
</script>
