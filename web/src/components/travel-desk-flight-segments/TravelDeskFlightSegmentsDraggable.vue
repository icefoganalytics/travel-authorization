<template>
  <!--
   NOTE: use the same group for all flight options if you want to be able to
   drag and drop flight segments between flight options.
   Currently, you cannot drag and drop between flight options.
  -->
  <Draggable
    v-model="travelDeskFlightSegments"
    handle=".handle"
    :group="`travel-desk-flight-option-${travelDeskFlightOptionId}-flight-segments`"
    :disabled="isLoading || isReOrdering"
    @update:model-value="reOrderFlightSegments"
  >
    <transition-group tag="span">
      <v-row
        v-for="(segment, flightSegmentIndex) in travelDeskFlightSegments"
        :key="'group-' + segment.id + '-' + flightSegmentIndex"
        class="mb-mb-5"
      >
        <v-col class="pa-2">
          <div class="d-flex justify-center flex-column flex-md-row">
            <div
              class="handle flex-grow-1 d-flex justify-center justify-md-end align-center"
              style="cursor: move"
            >
              <v-progress-circular
                v-if="isReOrdering"
                indeterminate
                class="mr-md-4 mt-4 mt-md-0 mb-2 mb-md-0"
              />
              <v-icon
                v-else
                size="large"
                class="mr-md-4 mt-4 mt-md-0 mb-2 mb-md-0"
                >mdi-reorder-horizontal</v-icon
              >
            </div>
            <v-divider
              vertical
              class="d-none d-md-block mr-md-4"
            />
            <TravelDeskFlightSegmentCard
              class="flex-grow-1 mr-md-4 mb-md-2"
              :travel-desk-flight-segment-id="segment.id"
            />
          </div>
        </v-col>
      </v-row>
    </transition-group>
  </Draggable>
</template>

<script setup>
import { VueDraggableNext as Draggable } from "vue-draggable-next"

import { computed, ref } from "vue"

import reOrderFlightSegmentsApi from "@/api/travel-desk-flight-options/re-order-flight-segments-api"

import useSnack from "@/use/use-snack"
import useTravelDeskFlightSegments from "@/use/use-travel-desk-flight-segments"

import TravelDeskFlightSegmentCard from "@/components/travel-desk-flight-segments/TravelDeskFlightSegmentCard.vue"

/** @typedef {import('@/api/travel-desk-flight-segments-api.js').TravelDeskFlightSegment} TravelDeskFlightSegment */
/** @typedef {import('@/api/travel-desk-flight-segments-api.js').TravelDeskFlightSegmentWhereOptions} TravelDeskFlightSegmentWhereOptions */

/**
 * @type {{
 *   where: TravelDeskFlightSegmentWhereOptions
 * }}
 */
const props = defineProps({
  travelDeskFlightOptionId: {
    type: Number,
    required: true,
  },
})

const travelDeskFlightSegmentsQuery = computed(() => ({
  where: {
    flightOptionId: props.travelDeskFlightOptionId,
  },
}))
const { travelDeskFlightSegments, isLoading, refresh } = useTravelDeskFlightSegments(
  travelDeskFlightSegmentsQuery
)

const isReOrdering = ref(false)
const snack = useSnack()

/**
 * @param {TravelDeskFlightSegment[]} reOrderedFlightSegments
 */
async function reOrderFlightSegments(reOrderedFlightSegments) {
  const flightSegmentOrderAttributes = reOrderedFlightSegments.map((segment, index) => {
    return {
      travelDeskFlightSegmentId: segment.id,
      oldSortOrder: segment.sortOrder,
      newSortOrder: index + 1,
    }
  })

  isReOrdering.value = true
  try {
    await reOrderFlightSegmentsApi.create(
      props.travelDeskFlightOptionId,
      flightSegmentOrderAttributes
    )
    await refresh()
  } catch (error) {
    console.error(error)
    snack.error(`Failed to re-order flight segments: ${error}`)
  } finally {
    isReOrdering.value = false
  }
}
</script>
