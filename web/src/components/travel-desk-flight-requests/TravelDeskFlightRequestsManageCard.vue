<template>
  <v-card
    class="card--outlined"
    style="--card-title-bg: white"
  >
    <v-card-title>
      <h3>Flight Requests</h3>
    </v-card-title>
    <v-card-text>
      <div class="d-flex justify-end">
        <TravelDeskFlightRequestCreateDialog
          :attributes="{
            travelRequestId: travelDeskTravelRequestId,
          }"
          :min-date="minDate"
          :max-date="maxDate"
          @created="emitUpdatedAndRefresh"
        />
      </div>
      <TravelDeskFlightRequestsManageTable
        ref="travelDeskFlightRequestsManageTable"
        :where="{
          travelRequestId: travelDeskTravelRequestId,
        }"
        route-query-suffix="TravelDeskFlightRequest"
        :min-date="minDate"
        :max-date="maxDate"
        :show-flight-options="showFlightOptions"
        @updated="emit('updated')"
      />
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn
        :to="{
          name: 'TravelDeskFlightSegmentsManagePage',
          params: {
            travelDeskTravelRequestId,
          },
        }"
        color="blue"
      >
        Manage Flight Options - Travelport&trade;
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { computed, ref, toRefs } from "vue"
import { first, last } from "lodash"

import useTravelAuthorization from "@/use/use-travel-authorization"

import TravelDeskFlightRequestCreateDialog from "@/components/travel-desk-flight-requests/TravelDeskFlightRequestCreateDialog.vue"
import TravelDeskFlightRequestsManageTable from "@/components/travel-desk-flight-requests/TravelDeskFlightRequestsManageTable.vue"

const props = defineProps({
  travelDeskTravelRequestId: {
    type: Number,
    required: true,
  },
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
  showFlightOptions: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(["updated"])

const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization } = useTravelAuthorization(travelAuthorizationId)

const firstTravelSegment = computed(() => first(travelAuthorization.value?.travelSegments))
const lastTravelSegment = computed(() => last(travelAuthorization.value?.travelSegments))

const minDate = computed(() => firstTravelSegment.value?.departureOn)
const maxDate = computed(() => lastTravelSegment.value?.departureOn)

/** @type {import("vue").Ref<InstanceType<typeof TravelDeskFlightRequestsManageTable> | null>} */
const travelDeskFlightRequestsManageTable = ref(null)

async function refresh() {
  await travelDeskFlightRequestsManageTable.value?.refresh()
}

async function emitUpdatedAndRefresh() {
  emit("updated")
  await refresh()
}

defineExpose({
  refresh,
})
</script>
