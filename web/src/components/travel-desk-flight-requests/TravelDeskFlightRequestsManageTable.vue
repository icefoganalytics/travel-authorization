<template>
  <TravelDeskFlightRequestsEditTable
    ref="travelDeskFlightRequestsEditTable"
    :expanded.sync="expanded"
    :show-expand="showFlightOptions"
    single-expand
    v-bind="$attrs"
    v-on="$listeners"
    @click:row="(_, { item }) => expandItem(item.id)"
  >
    <!-- TODO: consider having a dedicated page for flight options preference order with drag to order? -->
    <template #expanded-item="{ headers: expandedItemHeaders, item }">
      <td
        :colspan="expandedItemHeaders.length"
        class="pa-0"
      >
        <TravelDeskFlightOptionsDataIterator
          :where="{
            flightRequestId: item.id,
          }"
        />
      </td>
    </template>
    <template
      v-for="(_, slotName) in $scopedSlots"
      #[slotName]="slotData"
    >
      <slot
        :name="slotName"
        v-bind="slotData"
      ></slot>
    </template>
  </TravelDeskFlightRequestsEditTable>
</template>

<script setup>
import { computed, ref } from "vue"

import useRouteQuery, { integerTransformerLegacy } from "@/use/utils/use-route-query"

import TravelDeskFlightOptionsDataIterator from "@/components/travel-desk-flight-options/TravelDeskFlightOptionsDataIterator.vue"
import TravelDeskFlightRequestsEditTable from "@/components/travel-desk-flight-requests/TravelDeskFlightRequestsEditTable.vue"

const props = defineProps({
  showFlightOptions: {
    type: Boolean,
    default: false,
  },
})

const expandTravelDeskFlightRequest = useRouteQuery("expandTravelDeskFlightRequest", undefined, {
  transform: integerTransformerLegacy,
})

function expandItem(travelDeskFlightRequestId) {
  if (props.showFlightOptions !== true) return

  if (travelDeskFlightRequestId === expandTravelDeskFlightRequest.value) {
    expandTravelDeskFlightRequest.value = undefined
  } else {
    expandTravelDeskFlightRequest.value = travelDeskFlightRequestId
  }
}

const expanded = computed({
  get() {
    if (expandTravelDeskFlightRequest.value) {
      return [{ id: expandTravelDeskFlightRequest.value }]
    } else {
      return []
    }
  },
  set(newExpanded) {
    if (newExpanded.length > 0) {
      expandTravelDeskFlightRequest.value = newExpanded[0].id
    } else {
      expandTravelDeskFlightRequest.value = undefined
    }
  },
})

/** @type {import("vue").Ref<InstanceType<typeof TravelDeskFlightRequestsEditTable> | null>} */
const travelDeskFlightRequestsEditTable = ref(null)

async function refresh() {
  await travelDeskFlightRequestsEditTable.value?.refresh()
}

defineExpose({
  refresh,
})
</script>

<style scoped></style>
