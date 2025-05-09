<template>
  <HeaderActionsFormCard
    ref="headerActionsFormCard"
    title="Purpose"
    lazy-validation
  >
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <TravelPurposeSelect
          v-model="travelAuthorization.purposeId"
          :rules="[required]"
          dense
          item-text="purpose"
          item-value="id"
          label="Purpose *"
          outlined
          required
          validate-on-blur
          @input="emit('update:travelPurposeId', $event)"
        />
      </v-col>
      <v-col
        cols="12"
        xl="6"
      >
        <v-text-field
          v-model="travelAuthorization.eventName"
          :rules="[required]"
          dense
          label="Name of meeting/conference, mission, trade fair or course *"
          outlined
          required
          validate-on-blur
        />
      </v-col>
      <v-col
        cols="12"
        md="3"
        xl="2"
      >
        <!-- Depending on in territory flag we will load a different list of destinations -->
        <v-checkbox
          v-model="travelAuthorization.allTravelWithinTerritory"
          label="In Territory?"
          dense
        />
      </v-col>
      <v-col
        cols="12"
        md="9"
        lg="6"
        xl="4"
      >
        <LocationsAutocomplete
          :value="finalDestinationLocationId"
          :in-territory="travelAuthorization.allTravelWithinTerritory"
          :rules="[required]"
          clearable
          dense
          label="Final Destination *"
          outlined
          persistent-hint
          required
          validate-on-blur
          @input="updateFinalDestinationLocationId"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <h3>Objectives</h3>
        <ul>
          <li>Purpose of attendance</li>
          <li>Relevance and anticipated benefits to branch and Government of Yukon</li>
        </ul>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-textarea
          v-model="travelAuthorization.benefits"
          :rules="[required]"
          auto-grow
          dense
          label="Objectives *"
          outlined
          required
          rows="10"
          validate-on-blur
        />
      </v-col>
    </v-row>

    <template #actions><slot name="actions"></slot></template>
  </HeaderActionsFormCard>
</template>

<script setup>
import { computed, ref, toRefs, watch } from "vue"
import { cloneDeep, isNil, isEmpty, pick } from "lodash"

import { PERMITTED_ATTRIBUTES_FOR_CLONE, TRAVEL_METHODS } from "@/api/travel-segments-api"

import { required } from "@/utils/validators"
import useTravelAuthorization, { TRIP_TYPES } from "@/use/use-travel-authorization"
import useTravelSegments from "@/use/use-travel-segments"

import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"
import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
import TravelPurposeSelect from "@/components/travel-purposes/TravelPurposeSelect.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(["update:travelPurposeId", "update:finalDestinationLocationId"])

const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization, save } = useTravelAuthorization(travelAuthorizationId)
const tripType = computed(() => {
  if (isNil(travelAuthorization.value)) return null

  return travelAuthorization.value.tripTypeEstimate || TRIP_TYPES.ROUND_TRIP
})

const travelSegmentsQuery = computed(() => {
  return {
    where: {
      travelAuthorizationId: props.travelAuthorizationId,
      isActual: false,
    },
  }
})
const { travelSegments } = useTravelSegments(travelSegmentsQuery)

const finalDestinationLocationId = ref(null)

function updateFinalDestinationLocationId(locationId) {
  finalDestinationLocationId.value = locationId
  emit("update:finalDestinationLocationId", finalDestinationLocationId.value)
}

watch(
  () => [tripType.value, cloneDeep(travelSegments.value)],
  ([tripType, newTravelSegments]) => {
    if (!isNil(finalDestinationLocationId.value)) return

    const newFinalDestinationLocationId = determineFinalDestinationLocationId(
      tripType,
      newTravelSegments
    )
    updateFinalDestinationLocationId(newFinalDestinationLocationId)
  },
  {
    deep: true,
    immediate: true,
  }
)

function determineFinalDestinationLocationId(tripType, newTravelSegments) {
  if (isNil(tripType)) return null
  if (isNil(newTravelSegments) || isEmpty(newTravelSegments)) return null

  if (tripType === TRIP_TYPES.ROUND_TRIP) {
    return newTravelSegments.at(-2)?.arrivalLocationId
  } else {
    return newTravelSegments.at(-1)?.arrivalLocationId
  }
}

function locationIdOrNullIfOverlapping(location1, location2) {
  if (location1 === location2) return null

  return location1
}

function buildTravelSegmentEstimatesAttributes(tripType, newTravelSegments) {
  const staticFinalDestinationLocationId = determineFinalDestinationLocationId(
    tripType,
    newTravelSegments
  )

  if (isNil(tripType) || isNil(newTravelSegments) || isEmpty(newTravelSegments)) {
    return [
      {
        travelAuthorizationId: props.travelAuthorizationId,
        isActual: false,
        segmentNumber: 1,
        departureLocationId: null,
        arrivalLocationId: staticFinalDestinationLocationId,
        modeOfTransport: TRAVEL_METHODS.AIRCRAFT,
      },
      {
        travelAuthorizationId: props.travelAuthorizationId,
        isActual: false,
        segmentNumber: 2,
        departureLocationId: staticFinalDestinationLocationId,
        arrivalLocationId: null,
        modeOfTransport: TRAVEL_METHODS.AIRCRAFT,
      },
    ]
  }

  if (tripType === TRIP_TYPES.ROUND_TRIP) {
    const firstTravelSegment = newTravelSegments.at(0)
    const lastTravelSegment = newTravelSegments.at(-1)
    const destinationLocationId = staticFinalDestinationLocationId
    const initialOriginLocationId =
      firstTravelSegment.departureLocationId || lastTravelSegment.arrivalLocationId
    const originLocationId = locationIdOrNullIfOverlapping(
      initialOriginLocationId,
      destinationLocationId
    )
    return [
      {
        ...pick(firstTravelSegment, PERMITTED_ATTRIBUTES_FOR_CLONE),
        travelAuthorizationId: props.travelAuthorizationId,
        isActual: false,
        segmentNumber: 1,
        departureLocationId: originLocationId,
        arrivalLocationId: destinationLocationId,
      },
      {
        ...pick(lastTravelSegment, PERMITTED_ATTRIBUTES_FOR_CLONE),
        travelAuthorizationId: props.travelAuthorizationId,
        isActual: false,
        segmentNumber: 2,
        departureLocationId: destinationLocationId,
        arrivalLocationId: originLocationId,
      },
    ]
  }

  // NOTE: one way and multi-city trip types are handled the same way
  return newTravelSegments.map((travelSegment, index) => {
    const newTravelSegmentAttributes = {
      ...pick(travelSegment, PERMITTED_ATTRIBUTES_FOR_CLONE),
      travelAuthorizationId: props.travelAuthorizationId,
      isActual: false,
      segmentNumber: index + 1,
    }

    const numberOfSegments = newTravelSegments.length
    const isLastSegment = index === numberOfSegments - 1
    if (isLastSegment) {
      const arrivalLocationId = staticFinalDestinationLocationId
      const departureLocationId = locationIdOrNullIfOverlapping(
        newTravelSegmentAttributes.departureLocationId,
        arrivalLocationId
      )
      return {
        ...newTravelSegmentAttributes,
        departureLocationId,
        arrivalLocationId,
      }
    } else {
      return newTravelSegmentAttributes
    }
  })
}

/** @type {import('vue').Ref<InstanceType<typeof HeaderActionsFormCard> | null>} */
const headerActionsFormCard = ref(null)
const isSaving = ref(false)

async function saveWrapper() {
  if (isNil(headerActionsFormCard.value)) return
  if (!headerActionsFormCard.value.validate()) return

  const travelSegmentEstimatesAttributes = buildTravelSegmentEstimatesAttributes(
    tripType.value,
    travelSegments.value
  )

  isSaving.value = true
  try {
    await save({
      purposeId: travelAuthorization.value.purposeId,
      eventName: travelAuthorization.value.eventName,
      allTravelWithinTerritory: travelAuthorization.value.allTravelWithinTerritory,
      benefits: travelAuthorization.value.benefits,
      tripTypeEstimate: tripType.value,
      travelSegmentEstimatesAttributes,
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
  validate: () => headerActionsFormCard.value?.validate(),
})
</script>
