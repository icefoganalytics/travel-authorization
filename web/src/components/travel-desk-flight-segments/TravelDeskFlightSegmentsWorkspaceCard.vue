<template>
  <div>
    <v-card
      class="mt-5"
      large-title
    >
      <v-card-title class="d-flex flex-column flex-md-row justify-space-between align-center">
        <h4>Segments</h4>
        <v-btn
          class="my-0"
          color="primary"
          @click="addFlightSegmentAttributes"
          >Add Flight Segment
        </v-btn>
      </v-card-title>
      <v-card-text class="px-0 px-md-4">
        <v-data-iterator
          v-model="selectedSegments"
          :items="travelDeskFlightSegmentsAttributesWithId"
          :items-per-page="-1"
          show-select
        >
          <template #default="{ items, isSelected, select }">
            <div class="d-flex justify-center justify-md-start">
              <v-checkbox
                label="Select All"
                :model-value="selectAllValue"
                :indeterminate="selectAllValue === null"
                @update:model-value="selectAll"
              />
            </div>
            <div
              v-for="(item, index) in items"
              :key="item.id"
              class="d-flex flex-column flex-md-row align-center"
            >
              <v-checkbox
                :model-value="isSelected(item)"
                color="primary"
                @update:model-value="($event) => select(item, $event)"
              />
              <TravelDeskFlightSegmentEditCard
                :flight-segment="item"
                @update:flight-segment="updateFlightSegment($event, index)"
              />
              <v-btn
                class="ml-2"
                color="error"
                title="Delete"
                icon
                @click="deleteFlightSegment(index)"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </div>
          </template>
        </v-data-iterator>
      </v-card-text>
      <v-card-actions class="d-flex flex-column flex-md-row justify-space-between">
        <v-btn
          :disabled="selectedSegments.length == 0"
          color="red"
          @click="deleteSelectedFlightSegments"
          >Delete Selected
        </v-btn>
        <!-- Consider making a wrapper component that generates the flight option? -->
        <TravelDeskFlightOptionCreateDialog
          :travel-desk-travel-request-id="travelDeskTravelRequestId"
          :attributes="travelDeskFlightOptionAttributes"
          @created="emitCreatedFlightOptionAndRemoveSelected"
        >
          <template #activator="{ props: activatorProps }">
            <v-btn
              :disabled="selectedSegments.length == 0"
              color="primary"
              v-bind="activatorProps"
            >
              Group Selected
            </v-btn>
          </template>
        </TravelDeskFlightOptionCreateDialog>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue"
import { cloneDeep, isEmpty, isEqual } from "lodash"

import useSessionStorage from "@/use/utils/use-session-storage"

import TravelDeskFlightSegmentEditCard from "@/components/travel-desk-flight-segments/TravelDeskFlightSegmentEditCard.vue"
import TravelDeskFlightOptionCreateDialog from "@/components/travel-desk-flight-options/TravelDeskFlightOptionCreateDialog.vue"

const travelDeskFlightSegmentsAttributes = defineModel({
  type: Array,
  default: () => [],
})

const props = defineProps({
  travelDeskTravelRequestId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(["update:modelValue", "createdFlightOption"])

const travelDeskFlightSegmentsAttributesWithId = computed(() =>
  travelDeskFlightSegmentsAttributes.value.map((segment, index) => ({
    id: index,
    ...segment,
  }))
)

const selectedSegments = useSessionStorage(
  `travel-desk-travel-request-${props.travelDeskTravelRequestId}-travel-desk-flight-segments-selected`,
  []
)
const travelDeskFlightOptionAttributes = ref({})

const selectAllValue = computed(() => {
  if (
    !isEmpty(selectedSegments.value) &&
    selectedSegments.value.length === travelDeskFlightSegmentsAttributesWithId.value.length
  ) {
    return true
  } else if (isEmpty(selectedSegments.value)) {
    return false
  } else {
    return null
  }
})

function selectAll(value) {
  if (value === true && !isEmpty(selectedSegments.value)) {
    selectedSegments.value = []
  } else if (value === false) {
    selectedSegments.value = []
  } else {
    selectedSegments.value = cloneDeep(travelDeskFlightSegmentsAttributesWithId.value)
  }
}

function addFlightSegmentAttributes() {
  const flightSegmentAttributes = {
    flightNumber: "",
    departAt: "",
    departDay: "",
    departTime: "",
    departLocation: "",
    arriveAt: "",
    arriveDay: "",
    arriveTime: "",
    arriveLocation: "",
    duration: "",
    status: "",
    class: "",
    sortOrder: travelDeskFlightSegmentsAttributes.value.length + 1,
  }
  emit("update:modelValue", [flightSegmentAttributes, ...travelDeskFlightSegmentsAttributes.value])
}

function updateFlightSegment(newFlightSegment, index) {
  const newFlightSegments = cloneDeep(travelDeskFlightSegmentsAttributes.value)
  const { id, ...newFlightSegmentWithoutId } = newFlightSegment
  newFlightSegments[index] = newFlightSegmentWithoutId
  emit("update:modelValue", newFlightSegments)
}

function deleteFlightSegment(index) {
  const newFlightSegments = cloneDeep(travelDeskFlightSegmentsAttributes.value)
  newFlightSegments.splice(index, 1)
  emit("update:modelValue", newFlightSegments)
}

// Using a watcher rather than a computed property because reactivity breaks
// when the computed property is this large
watch(
  () => selectedSegments.value,
  (newSelectedSegments) => {
    let durationHours = 0
    let durationMinutes = 0
    let sortOrder = 1
    const cleanFlightSegmentAttributes = []
    for (const { id, ...flightSegmentAttributesWithoutId } of newSelectedSegments) {
      flightSegmentAttributesWithoutId.sortOrder = sortOrder
      sortOrder += 1
      const duration = extractDuration(flightSegmentAttributesWithoutId.duration)
      durationHours += Number(duration.hours)
      durationMinutes += Number(duration.minutes)

      cleanFlightSegmentAttributes.push(flightSegmentAttributesWithoutId)
    }

    const flightOptionAttributes = {
      cost: 0,
      flightRequestId: null,
      flightPreferenceOrder: null,
      // TODO: consider making duration a value in seconds?
      duration: durationHours + " Hour(s) " + durationMinutes + " Minute(s)",
      flightSegmentsAttributes: cleanFlightSegmentAttributes,
    }
    travelDeskFlightOptionAttributes.value = flightOptionAttributes
  },
  {
    immediate: true,
    deep: true,
  }
)

function extractDuration(duration) {
  let hours = 0
  let minutes = 0
  const time = duration.match(/\d+/g)
  if (time?.length == 2) {
    hours = time[0]
    minutes = time[1]
  } else if (time?.length == 1) {
    minutes = duration.includes("m") || duration.includes("M") ? time[0] : 0
    hours = duration.includes("h") || duration.includes("H") ? time[0] : 0
  }

  return { hours: hours, minutes: minutes }
}

function deleteSelectedFlightSegments() {
  const newFlightSegments = cloneDeep(travelDeskFlightSegmentsAttributes.value)
  for (const { id, ...selectedSegmentWithoutId } of selectedSegments.value) {
    const indexOfItemToRemove = newFlightSegments.findIndex((segment) =>
      isEqual(segment, selectedSegmentWithoutId)
    )
    if (indexOfItemToRemove >= 0) {
      newFlightSegments.splice(indexOfItemToRemove, 1)
    }
  }

  emit("update:modelValue", newFlightSegments)
  selectedSegments.value = []
}

function emitCreatedFlightOptionAndRemoveSelected(flightOptionId) {
  deleteSelectedFlightSegments()
  emit("createdFlightOption", flightOptionId)
}
</script>

<style scoped></style>
