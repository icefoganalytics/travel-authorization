<template>
  <v-card>
    <v-card-title><h3>Full days on travel status</h3></v-card-title>
    <v-card-text> The amount claimed up to a maximum of: </v-card-text>
    <v-data-table
      :headers="headers"
      :items="perDiemsAsSumMatrix"
      :loading="isLoading"
    >
      <template #item.yukonAndAlaska="{ item }">
        <template
          v-if="item[PER_DIEM_TRAVEL_REGIONS.YUKON] === item[PER_DIEM_TRAVEL_REGIONS.ALASKA]"
        >
          {{ formatCurrency(item[PER_DIEM_TRAVEL_REGIONS.YUKON], "CAD") }}
        </template>
        <template v-else>
          {{
            [
              formatCurrency(item[PER_DIEM_TRAVEL_REGIONS.YUKON], "CAD"),
              formatCurrency(item[PER_DIEM_TRAVEL_REGIONS.ALASKA], "USD"),
            ].join(" / ")
          }}
        </template>
      </template>
      <template #item.nwt="{ item }">
        {{ formatCurrency(item[PER_DIEM_TRAVEL_REGIONS.NWT], "CAD") }}
      </template>
      <template #item.nunavut="{ item }">
        {{ formatCurrency(item[PER_DIEM_TRAVEL_REGIONS.NUNAVUT], "CAD") }}
      </template>
      <template #item.restOfCanada="{ item }">
        {{ formatCurrency(item[PER_DIEM_TRAVEL_REGIONS.CANADA], "CAD") }}
      </template>
      <template #item.restOfUsa="{ item }">
        {{ formatCurrency(item[PER_DIEM_TRAVEL_REGIONS.US], "USD") }}
      </template>
    </v-data-table>
    <v-card-text
      >For travel outside Canada and USA, refer to
      <a
        href="https://www.njc-cnm.gc.ca/directive/d10/v238/s659/en"
        target="_blank"
        >Canada's National Joint Council travel directive, Appendix C</a
      >.</v-card-text
    >
  </v-card>
</template>

<script setup>
import { computed } from "vue"
import { groupBy, mapValues, sumBy } from "lodash"

import { MAX_PER_PAGE } from "@/api/base-api"
import formatCurrency from "@/utils/format-currency"
import usePerDiems, { PER_DIEM_TRAVEL_REGIONS } from "@/use/use-per-diems"

const headers = [
  {
    title: "Yukon/Alaska",
    key: "yukonAndAlaska",
  },
  {
    title: "NWT",
    key: "nwt",
  },
  {
    title: "Nunavut",
    key: "nunavut",
  },
  {
    title: "Rest of Canada",
    key: "restOfCanada",
  },
  {
    title: "Rest of USA",
    key: "restOfUsa",
  },
]

const perDiemsQuery = computed(() => {
  return {
    perPage: MAX_PER_PAGE,
  }
})
const { perDiems, isLoading } = usePerDiems(perDiemsQuery)

const perDiemsAsSumMatrix = computed(() => {
  const perDiemsByTravelRegion = groupBy(perDiems.value, "travelRegion")
  const matrix = mapValues(perDiemsByTravelRegion, (items) => sumBy(items, "amount"))
  return [matrix]
})
</script>
