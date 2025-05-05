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
      ref="tripTypeComponentRef"
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
          v-model="travelAuthorization.travelDurationActual"
          :travel-segments="travelSegmentsAttributes"
        />
      </v-col>
      <v-col
        cols="12"
        md="3"
      >
        <v-text-field
          v-model.number="travelAuthorization.daysOffTravelStatusActual"
          label="Days on non-travel status"
          :min="0"
          :max="travelAuthorization.travelDurationActual - 1"
          :rules="[
            isInteger,
            greaterThanOrEqualTo(0),
            lessThan(travelAuthorization.travelDurationActual, {
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
          v-model="travelAuthorization.dateBackToWorkActual"
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
import useVuetify2 from "@/use/utils/use-vuetify2"
import useSnack from "@/use/use-snack"
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

const { mdAndUp } = useVuetify2()

const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization, save: saveTravelAuthorization } =
  useTravelAuthorization(travelAuthorizationId)

const defaultTripType = computed(
  () => travelAuthorization.value.tripTypeActual || travelAuthorization.value.tripTypeEstimate
)
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

  updateTravelAuthorizationAndEmitTripMetadataUpdate(newTravelSegmentsAttributes)
}

function updateTravelAuthorizationAndEmitTripMetadataUpdate(newTravelSegmentsAttributes) {
  const departureDate = newTravelSegmentsAttributes.at(0)?.departureOn
  if (!isNil(departureDate)) {
    emit("update:departureDate", departureDate)
  }

  const finalDestinationLocationId = newTravelSegmentsAttributes.at(-1)?.arrivalLocationId
  if (!isNil(finalDestinationLocationId)) {
    emit("update:finalDestinationLocationId", finalDestinationLocationId)
  }

  const newLatestDepartureDate = max(
    newTravelSegmentsAttributes.map(
      (travelSegmentAttributes) => travelSegmentAttributes.departureOn
    )
  )
  if (!isNil(newLatestDepartureDate)) {
    latestDepartureDate.value = newLatestDepartureDate

    const currentReturnDate = travelAuthorization.value?.dateBackToWorkActual
    if (isNil(currentReturnDate) || newLatestDepartureDate > currentReturnDate) {
      travelAuthorization.value.dateBackToWorkActual = newLatestDepartureDate
      emit("update:returnDate", newLatestDepartureDate)
    }
  }
}

/** @typedef {import('vuetify/lib/components').VForm} VForm */
/** @type {import('vue').Ref<typeof VForm | null>} */
const form = ref(null)

async function resetFormValidation() {
  await nextTick()
  form.value?.resetValidation()
}

const TravelSegmentActualsRoundTripSection = defineAsyncComponent(
  () => import("@/components/travel-segments/TravelSegmentsCreateActualsRoundTripSection.vue")
)
const TravelSegmentActualsOneWayTripSection = defineAsyncComponent(
  () => import("@/components/travel-segments/TravelSegmentsCreateActualsOneWayTripSection.vue")
)
const TravelSegmentActualsMultiCityTripSection = defineAsyncComponent(
  () => import("@/components/travel-segments/TravelSegmentsCreateActualsMultiCityTripSection.vue")
)

const tripTypeComponent = computed(() => {
  switch (tripType.value) {
    case TRIP_TYPES.ROUND_TRIP:
      return TravelSegmentActualsRoundTripSection
    case TRIP_TYPES.ONE_WAY:
      return TravelSegmentActualsOneWayTripSection
    case TRIP_TYPES.MULTI_CITY:
      return TravelSegmentActualsMultiCityTripSection
    default:
      return null
  }
})

const isSaving = ref(false)
const snack = useSnack()

/** @type {import('vue').Ref<InstanceType<typeof tripTypeComponent.value> | null>} */
const tripTypeComponentRef = ref(null)

async function save() {
  isSaving.value = true
  try {
    await tripTypeComponentRef.value?.save()
    await saveTravelAuthorization({
      tripTypeActual: tripType.value,
      travelDurationActual: travelAuthorization.value.travelDurationActual,
      daysOffTravelStatusActual: travelAuthorization.value.daysOffTravelStatusActual,
      dateBackToWorkActual: travelAuthorization.value.dateBackToWorkActual,
    })
  } catch (error) {
    console.error(`Failed to save travel authorization: ${error}`, { error })
    snack.error(`Failed to save travel authorization: ${error}`)
    // TODO: Consider deleting any created actuals?
    throw error
  } finally {
    isSaving.value = false
  }
}

defineExpose({
  save,
  validate: () => form.value?.validate(),
})
</script>
