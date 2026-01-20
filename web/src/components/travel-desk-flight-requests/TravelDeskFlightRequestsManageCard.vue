<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between">
      <SectionHeader
        title="1. Flight Requests"
        icon="mdi-airplane"
        tag="h4"
        class="mb-0"
      />
      <TravelDeskFlightRequestCreateDialog
        :attributes="{
          travelRequestId: travelDeskTravelRequestId,
        }"
        :min-date="tripStartDate"
        :max-date="tripEndDate"
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
        :min-date="tripStartDate"
        :max-date="tripEndDate"
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

<script setup lang="ts">
import { ref, toRefs } from "vue"

import useDisplayVuetify2 from "@/use/utils/use-display-vuetify2"

import SectionHeader from "@/components/common/SectionHeader.vue"
import TravelDeskFlightRequestCreateDialog from "@/components/travel-desk-flight-requests/TravelDeskFlightRequestCreateDialog.vue"
import TravelDeskFlightRequestsManageTable from "@/components/travel-desk-flight-requests/TravelDeskFlightRequestsManageTable.vue"
import useTravelTimesSummary from "@/use/travel-desk-travel-requests/use-travel-times-summary"

const props = withDefaults(
  defineProps<{
    travelDeskTravelRequestId: number
    showFlightOptions?: boolean
  }>(),
  {
    showFlightOptions: false,
  }
)

// TODO: switch to `updated: [void]` syntax in Vue 3
const emit = defineEmits<{
  (event: "updated"): void
}>()

const { travelDeskTravelRequestId } = toRefs(props)
const { tripStartDate, tripEndDate } = useTravelTimesSummary(travelDeskTravelRequestId)

const { smAndDown } = useDisplayVuetify2()

const travelDeskFlightRequestsManageTable = ref<InstanceType<
  typeof TravelDeskFlightRequestsManageTable
> | null>(null)

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
