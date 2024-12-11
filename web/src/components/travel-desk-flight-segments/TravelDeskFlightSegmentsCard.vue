<template>
  <v-skeleton-loader
    v-if="isLoading"
    type="card"
  />
  <v-card v-else>
    <v-card-text class="d-flex flex-column gap-4">
      <dl>
        <DescriptionElement
          label="Cost"
          :value="formatCurrency(cost)"
          horizontal
        />
      </dl>
      <div
        v-for="travelDeskFlightSegment in travelDeskFlightSegments"
        :key="travelDeskFlightSegment.id"
        class="text-body-1 text--primary"
      >
        <v-row no-gutters>
          <v-col>
            {{ travelDeskFlightSegment.flightNumber }}
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col
            cols="12"
            md="2"
          >
            Departure:
          </v-col>
          <v-col
            cols="12"
            md="3"
          >
            {{ formatDate(travelDeskFlightSegment.departAt, "HH:mm dd MMM yyyy") }}
          </v-col>
          <v-col
            cols="12"
            md="7"
          >
            <span class="ml-2"></span>{{ travelDeskFlightSegment.departLocation }}
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col
            cols="12"
            md="2"
          >
            Arrival:
          </v-col>
          <v-col
            cols="12"
            md="3"
          >
            {{ formatDate(travelDeskFlightSegment.arriveAt, "HH:mm dd MMM yyyy") }}
          </v-col>
          <v-col
            cols="12"
            md="7"
          >
            <span class="ml-2"></span>{{ travelDeskFlightSegment.arriveLocation }}
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-col
            cols="12"
            md="2"
          >
            Duration:
          </v-col>
          <v-col
            cols="12"
            md="8"
          >
            {{ travelDeskFlightSegment.duration }}
          </v-col>
        </v-row>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed } from "vue"

import formatCurrency from "@/utils/format-currency"
import useTravelDeskFlightSegments from "@/use/use-travel-desk-flight-segments"

import DescriptionElement from "@/components/common/DescriptionElement.vue"
import formatDate from "@/utils/format-date"

const props = defineProps({
  travelDeskFlightOptionId: {
    type: Number,
    required: true,
  },
  cost: {
    type: [String, Number],
    required: true,
  },
})

const travelDeskFlightSegmentsQuery = computed(() => ({
  where: {
    flightOptionId: props.travelDeskFlightOptionId,
  },
}))

const { travelDeskFlightSegments, isLoading } = useTravelDeskFlightSegments(
  travelDeskFlightSegmentsQuery
)
</script>

<style scoped>
.gap-4 {
  gap: 1rem; /* 16px */
}
</style>
