<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between">
      <SectionHeader
        title="1. Flight Requests"
        icon="mdi-flight-outline"
        tag="h4"
      />
      <TravelDeskFlightRequestCreateDialog
        :attributes="{
          travelRequestId: travelDeskTravelRequestId,
        }"
        :min-date="minDate"
        :max-date="maxDate"
        :activator-props="{
          block: smAndDown,
          class: 'my-md-0',
        }"
        @created="emitUpdatedAndRefresh"
      />
    </v-card-title>
    <v-card-text>
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
      >
        <template #footer.prepend>
          <!-- TODO: make this a first class feature! Maybe with it's own tab? -->
          <v-btn
            class="my-0"
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
        </template>
      </TravelDeskFlightRequestsManageTable>
    </v-card-text>
  </v-card>
</template>

<script setup>
import { computed, ref, toRefs } from "vue"
import { first, last } from "lodash"

import useDisplayVuetify2 from "@/use/utils/use-display-vuetify2"

import useTravelAuthorization from "@/use/use-travel-authorization"

import SectionHeader from "@/components/common/SectionHeader.vue"
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

const { smAndDown } = useDisplayVuetify2()

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
