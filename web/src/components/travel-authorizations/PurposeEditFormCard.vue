<template>
  <v-skeleton-loader
    v-if="isNil(travelAuthorization)"
    type="card"
  />
  <HeaderActionsFormCard
    v-else
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

<script setup lang="ts">
import { computed, ref, toRefs, watch } from "vue"
import { cloneDeep, isNil, isEmpty, pick } from "lodash"

import {
  PERMITTED_ATTRIBUTES_FOR_CLONE,
  TravelSegmentTravelMethods,
  TravelSegment,
} from "@/api/travel-segments-api"

import { required } from "@/utils/validators"
import useTravelAuthorization, {
  TravelAuthorizationTripTypes,
} from "@/use/use-travel-authorization"
import useTravelSegments from "@/use/use-travel-segments"

import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"
import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
import TravelPurposeSelect from "@/components/travel-purposes/TravelPurposeSelect.vue"

const props = defineProps<{
  travelAuthorizationId: number
}>()

const emit = defineEmits<{
  (event: "update:travelPurposeId", travelPurposeId: number): void
  (event: "update:finalDestinationLocationId", finalDestinationLocationId: number | null): void
}>()

const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization, save } = useTravelAuthorization(travelAuthorizationId)
const tripType = computed(() => {
  if (isNil(travelAuthorization.value)) return null

  return travelAuthorization.value.tripTypeEstimate || TravelAuthorizationTripTypes.ROUND_TRIP
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

const finalDestinationLocationId = ref<number | null>(null)

function updateFinalDestinationLocationId(locationId: number | null) {
  finalDestinationLocationId.value = locationId
  emit("update:finalDestinationLocationId", finalDestinationLocationId.value)
}

watch<[TravelAuthorizationTripTypes | null, TravelSegment[]], true>(
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

function determineFinalDestinationLocationId(
  tripType: TravelAuthorizationTripTypes | null,
  newTravelSegments: TravelSegment[]
): number | null {
  if (isNil(tripType)) return null
  if (isNil(newTravelSegments) || isEmpty(newTravelSegments)) return null

  if (tripType === TravelAuthorizationTripTypes.ROUND_TRIP) {
    return newTravelSegments.at(-2)?.arrivalLocationId ?? null
  } else {
    return newTravelSegments.at(-1)?.arrivalLocationId ?? null
  }
}

function locationIdOrNullIfOverlapping(locationId1: number | null, locationId2: number | null) {
  if (locationId1 === locationId2) return null

  return locationId1
}

function buildTravelSegmentEstimatesAttributes(
  staticFinalDestinationLocationId: number | null,
  tripType: TravelAuthorizationTripTypes | null,
  newTravelSegments: TravelSegment[]
) {
  if (isNil(tripType) || isNil(newTravelSegments) || isEmpty(newTravelSegments)) {
    return [
      {
        travelAuthorizationId: props.travelAuthorizationId,
        isActual: false,
        segmentNumber: 1,
        departureLocationId: null,
        arrivalLocationId: staticFinalDestinationLocationId,
        modeOfTransport: TravelSegmentTravelMethods.AIRCRAFT,
      },
      {
        travelAuthorizationId: props.travelAuthorizationId,
        isActual: false,
        segmentNumber: 2,
        departureLocationId: staticFinalDestinationLocationId,
        arrivalLocationId: null,
        modeOfTransport: TravelSegmentTravelMethods.AIRCRAFT,
      },
    ]
  }

  if (tripType === TravelAuthorizationTripTypes.ROUND_TRIP) {
    const firstTravelSegment = newTravelSegments.at(0)
    if (isNil(firstTravelSegment)) {
      throw new Error("First travel segment is missing")
    }

    const lastTravelSegment = newTravelSegments.at(-1)
    if (isNil(lastTravelSegment)) {
      throw new Error("Last travel segment is missing")
    }

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

const headerActionsFormCard = ref<InstanceType<typeof HeaderActionsFormCard> | null>(null)
const isSaving = ref(false)

async function saveWrapper() {
  if (isNil(travelAuthorization.value)) return
  if (isNil(headerActionsFormCard.value)) return
  if (!headerActionsFormCard.value.validate()) return

  const travelSegmentEstimatesAttributes = buildTravelSegmentEstimatesAttributes(
    finalDestinationLocationId.value,
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
