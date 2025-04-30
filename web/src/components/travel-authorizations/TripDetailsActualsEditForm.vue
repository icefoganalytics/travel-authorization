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
          v-model="travelAuthorization.tripType"
          :row="mdAndUp"
          @input="saveTravelAuthorizationAndRefreshTravelSegments"
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
    />
    <div v-else>Trip type {{ travelAuthorization.tripType }} not implemented!</div>
    <v-row class="mt-6">
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
</template>

<script setup>
import { computed, defineAsyncComponent, nextTick, ref, toRefs, watch } from "vue"
import { findLast, isNil } from "lodash"

import { required, isInteger, greaterThanOrEqualTo, lessThan } from "@/utils/validators"

import useVuetify2 from "@/use/utils/use-vuetify2"
import useSnack from "@/use/use-snack"
import useTravelAuthorization, { TRIP_TYPES } from "@/use/use-travel-authorization"
import useTravelSegments from "@/use/use-travel-segments"

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
const { travelSegments, refresh: refreshTravelSegments } =
  useTravelSegments(travelSegmentActualsQuery)
const firstTravelSegment = computed(() => travelSegments.value[0])
const lastTravelSegment = computed(() => travelSegments.value[travelSegments.value.length - 1])

/** @typedef {import('vuetify/lib/components').VForm} VForm */
/** @type {import('vue').Ref<typeof VForm | null>} */
const form = ref(null)

async function saveTravelAuthorizationAndRefreshTravelSegments() {
  await saveTravelAuthorization()
  await refreshTravelSegments()

  await nextTick()
  form.value?.resetValidation()
}

watch(
  () => firstTravelSegment.value,
  (newFirstTravelSegment) => {
    if (isNil(newFirstTravelSegment)) return

    const { departureOn } = newFirstTravelSegment
    emit("update:departureDate", departureOn)
  }
)

watch(
  () => lastTravelSegment.value,
  (newLastTravelSegment) => {
    if (isNil(newLastTravelSegment)) return

    const { arrivalLocationId } = newLastTravelSegment
    emit("update:finalDestinationLocationId", arrivalLocationId)
  }
)

const lastDepartureDate = computed(() => {
  const lastTravelSegmentWithDepartureDate = findLast(
    travelSegments.value,
    (travelSegment) => !isNil(travelSegment.departureOn)
  )
  return lastTravelSegmentWithDepartureDate?.departureOn
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

const TravelSegmentActualsRoundTripSection = defineAsyncComponent(
  () => import("@/components/travel-segments/TravelSegmentActualsRoundTripSection.vue")
)

const tripTypeComponent = computed(() => {
  switch (travelAuthorization.value.tripType) {
    case TRIP_TYPES.ROUND_TRIP:
      return TravelSegmentActualsRoundTripSection
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

const isSaving = ref(false)
const snack = useSnack()

/** @type {import('vue').Ref<InstanceType<typeof tripTypeComponent.value> | null>} */
const tripTypeComponentRef = ref(null)

async function save() {
  isSaving.value = true
  try {
    await tripTypeComponentRef.value?.save()
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
