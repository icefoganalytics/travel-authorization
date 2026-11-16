<template>
  <v-skeleton-loader
    v-if="isNil(travelAuthorization?.id)"
    type="card"
  />
  <v-form
    v-else
    ref="form"
    validate-on="lazy"
  >
    <v-select
      v-if="isExpenseClaimTravellerChangesRequested"
      :model-value="savedPrimaryDestinationId"
      :items="savedActualArrivalItems"
      :rules="[required]"
      label="Primary destination"
      hint="Confirm an existing arrival without changing the submitted route or expenses."
      persistent-hint
      density="compact"
      variant="outlined"
      @update:model-value="selectSavedPrimaryDestination"
    >
      <template #selection="{ item }">
        {{ item.title }} —
        <LocationChip
          :location-id="item.raw.arrivalLocationId"
          variant="text"
        />
      </template>
      <template #item="{ item, props: itemProps }">
        <v-list-item v-bind="itemProps">
          <template #append>
            <LocationChip
              :location-id="item.raw.arrivalLocationId"
              variant="text"
            />
          </template>
        </v-list-item>
      </template>
    </v-select>
    <template v-else>
      <v-row>
        <v-col cols="12">
          <TripTypeRadioGroup
            v-model="tripType"
            :inline="mdAndUp"
            @update:model-value="resetFormValidation"
          />
        </v-col>
      </v-row>

      <component
        :is="tripTypeComponent"
        v-if="tripTypeComponent"
        class="mt-3"
        :travel-authorization-id="travelAuthorizationId"
        :all-travel-within-territory="travelAuthorization.allTravelWithinTerritory"
        :current-travel-segments="travelSegments"
        :current-trip-type="travelAuthorization.tripTypeActual"
        is-actual
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
          md="4"
          lg="3"
        >
          <v-text-field
            v-model.number="travelAuthorization.daysOffTravelStatusActual"
            label="Days on non-travel status"
            :min="0"
            :max="travelAuthorization.travelDurationActual - 1"
            :rules="[
              isInteger,
              greaterThanOrEqualTo(0),
              lessThanOrEqualTo(travelAuthorization.travelDurationActual, {
                referenceFieldLabel: 'the number of travel days',
              }),
            ]"
            type="number"
            density="compact"
            required
            variant="outlined"
          ></v-text-field>
        </v-col>
        <v-col
          cols="12"
          md="5"
          lg="4"
        >
          <StringDateInput
            v-model="travelAuthorization.dateBackToWorkActual"
            :min="latestDepartureDate"
            :rules="[required]"
            label="Expected Date return to work"
            density="compact"
            required
            @update:model-value="emit('update:returnDate', $event)"
          />
        </v-col>
      </v-row>
    </template>
  </v-form>
</template>

<script setup>
import { computed, defineAsyncComponent, nextTick, ref, toRefs } from "vue"
import { cloneDeep, isEmpty, max, isNil, omit } from "lodash"
import { useDisplay } from "vuetify"

import { required, isInteger, greaterThanOrEqualTo, lessThanOrEqualTo } from "@/utils/validators"
import useRouteQuery from "@/use/utils/use-route-query"

import { TRIP_TYPES, TravelAuthorizationStatuses } from "@/api/travel-authorizations-api"
import travelSegmentsApi from "@/api/travel-segments-api"

import determinePrimaryDestinationSegment from "@/capabilities/travel-itinerary/determine-primary-destination-segment"

import useSnack from "@/use/use-snack"
import useTravelAuthorization from "@/use/use-travel-authorization"
import useTravelSegments from "@/use/use-travel-segments"

import StringDateInput from "@/components/common/StringDateInput.vue"
import LocationChip from "@/components/locations/LocationChip.vue"
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
  "update:primaryDestinationLocationId",
  "update:departureDate",
  "update:returnDate",
])

const { mdAndUp } = useDisplay()

const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization, save } = useTravelAuthorization(travelAuthorizationId)

const defaultTripType = computed(
  () =>
    travelAuthorization.value?.tripTypeActual ||
    travelAuthorization.value?.tripTypeEstimate ||
    TRIP_TYPES.ROUND_TRIP
)
const tripType = useRouteQuery("trip_type", defaultTripType)

const travelSegmentsQuery = computed(() => ({
  where: {
    travelAuthorizationId: props.travelAuthorizationId,
  },
  perPage: -1,
}))
const { travelSegments: savedTravelSegments } = useTravelSegments(travelSegmentsQuery)
const travelSegments = computed(() => {
  const actualSegments = savedTravelSegments.value.filter((segment) => segment.isActual)
  if (!isEmpty(actualSegments)) return actualSegments

  return savedTravelSegments.value
    .filter((segment) => !segment.isActual)
    .map((segment) => {
      const clonedSegment = cloneDeep(segment)
      const actualSegmentAttributes = omit(clonedSegment, "id")
      return {
        ...actualSegmentAttributes,
        isActual: true,
        isPrimaryDestination: false,
      }
    })
})

const isExpenseClaimTravellerChangesRequested = computed(
  () =>
    travelAuthorization.value?.status ===
    TravelAuthorizationStatuses.EXPENSE_CLAIM_TRAVELLER_CHANGES_REQUESTED
)
const savedActualArrivalItems = computed(() => {
  return travelSegments.value
    .filter((segment) => segment.isActual && !isNil(segment.id))
    .map((segment) => {
      return {
        title: `Leg ${segment.segmentNumber} arrival`,
        value: segment.id,
        arrivalLocationId: segment.arrivalLocationId,
        props: {
          disabled: isNil(segment.arrivalLocationId),
        },
      }
    })
})
const savedPrimaryDestinationId = computed(() => {
  const selectedSegment = travelSegments.value.find((segment) => segment.isPrimaryDestination)
  return selectedSegment?.id ?? null
})

function selectSavedPrimaryDestination(segmentId) {
  const actualSegments = savedTravelSegments.value.filter((segment) => segment.isActual)
  actualSegments.forEach((segment) => {
    segment.isPrimaryDestination = segment.id === segmentId && !isNil(segment.arrivalLocationId)
  })
  const selectedSegment = actualSegments.find((segment) => segment.isPrimaryDestination)
  emit("update:primaryDestinationLocationId", selectedSegment?.arrivalLocationId ?? null)
}

const latestDepartureDate = ref(null)
const travelSegmentsAttributes = ref([])
const primaryDestinationSegment = computed(() =>
  determinePrimaryDestinationSegment(tripType.value, travelSegmentsAttributes.value)
)
const primaryDestinationLocationId = computed(
  () => primaryDestinationSegment.value?.arrivalLocationId ?? null
)

function updateTravelSegmentsAttributes(newTravelSegmentsAttributes) {
  travelSegmentsAttributes.value = newTravelSegmentsAttributes

  updateDepartureDate(newTravelSegmentsAttributes)
  emit("update:primaryDestinationLocationId", primaryDestinationLocationId.value)
  updateDateBackToWorkAndReturnDate(newTravelSegmentsAttributes)
}

function updateDepartureDate(newTravelSegmentsAttributes) {
  const departureDate = newTravelSegmentsAttributes.at(0)?.departureOn
  if (!isNil(departureDate)) {
    emit("update:departureDate", departureDate)
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

    const currentReturnDate = travelAuthorization.value?.dateBackToWorkActual
    if (isNil(currentReturnDate) || newLatestDepartureDate > currentReturnDate) {
      travelAuthorization.value.dateBackToWorkActual = newLatestDepartureDate
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

/** @typedef {import('vuetify/components').VForm} VForm */
/** @type {import('vue').Ref<typeof VForm | null>} */
const form = ref(null)
const isSaving = ref(false)
const snack = useSnack()

async function resetFormValidation() {
  await nextTick()
  form.value?.resetValidation()
}

async function saveWrapper() {
  if (isNil(form.value)) return

  const { valid } = await form.value.validate()
  if (!valid) {
    snack.warning("Please fill in all required fields.")
    return
  }

  isSaving.value = true
  try {
    if (isExpenseClaimTravellerChangesRequested.value) {
      const selectedSegmentId = savedPrimaryDestinationId.value
      if (isNil(selectedSegmentId)) return

      await travelSegmentsApi.update(selectedSegmentId, {
        isPrimaryDestination: true,
      })
      return
    }

    await save({
      tripTypeActual: tripType.value,
      travelDurationActual: travelAuthorization.value.travelDurationActual,
      daysOffTravelStatusActual: travelAuthorization.value.daysOffTravelStatusActual,
      dateBackToWorkActual: travelAuthorization.value.dateBackToWorkActual,
      travelSegmentActualsAttributes: travelSegmentsAttributes.value,
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
  validate: async () => form.value?.validate(),
})
</script>
