<template>
  <TravelDeskFlightRequestsEditDataTableServer
    ref="travelDeskFlightRequestsEditTable"
    v-model:expanded="expanded"
    :show-expand="showFlightOptions"
    expand-on-click
  >
    <!-- TODO: consider having a dedicated page for flight options preference order with drag to order? -->
    <template #expanded-row="{ columns, item }">
      <td
        :colspan="columns.length"
        class="pa-0"
      >
        <TravelDeskFlightOptionsDataIterator
          :where="{
            flightRequestId: item.id,
          }"
        />
      </td>
    </template>
    <template #footer.prepend>
      <slot name="footer.prepend"></slot>
    </template>
  </TravelDeskFlightRequestsEditDataTableServer>
</template>

<script setup lang="ts">
import { computed, useTemplateRef } from "vue"

import useRouteQuery, { integerTransformerLegacy } from "@/use/utils/use-route-query"

import TravelDeskFlightOptionsDataIterator from "@/components/travel-desk-flight-options/TravelDeskFlightOptionsDataIterator.vue"
import TravelDeskFlightRequestsEditDataTableServer from "@/components/travel-desk-flight-requests/TravelDeskFlightRequestsEditDataTableServer.vue"

withDefaults(
  defineProps<{
    showFlightOptions: boolean
  }>(),
  {
    showFlightOptions: false,
  }
)

const expandTravelDeskFlightRequest = useRouteQuery("expandTravelDeskFlightRequest", null, {
  transform: integerTransformerLegacy,
})

const expanded = computed({
  get() {
    if (expandTravelDeskFlightRequest.value) {
      return [expandTravelDeskFlightRequest.value]
    } else {
      return []
    }
  },
  set(newExpanded) {
    const lastItem = newExpanded[newExpanded.length - 1]
    expandTravelDeskFlightRequest.value = lastItem
  },
})

const travelDeskFlightRequestsEditTable = useTemplateRef("travelDeskFlightRequestsEditTable")

async function refresh() {
  await travelDeskFlightRequestsEditTable.value?.refresh()
}

defineExpose({
  refresh,
})
</script>

<style scoped></style>
