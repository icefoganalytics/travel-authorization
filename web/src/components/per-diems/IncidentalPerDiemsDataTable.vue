<template>
  <v-data-table
    :headers="headers"
    :items="perDiemsAsMatrix"
    :loading="isLoading"
  >
    <template #item.withinCanada="{ item }">
      {{ formatCurrency(item[PER_DIEM_TRAVEL_REGIONS.CANADA], "CAD") }}
    </template>
    <template #item.withinUsa="{ item }">
      {{ formatCurrency(item[PER_DIEM_TRAVEL_REGIONS.US], "USD") }}
    </template>
    <template #item.outsideCanadaAndUsa>
      Refer to
      <a
        href="https://www.njc-cnm.gc.ca/directive/d10/v238/s659/en"
        target="_blank"
        >Canada's National Joint Council travel directive, Appendix C</a
      >.
    </template>
  </v-data-table>
</template>

<script setup>
import { computed } from "vue"
import { groupBy, mapValues } from "lodash"

import formatCurrency from "@/utils/format-currency"
import { MAX_PER_PAGE } from "@/api/base-api"
import usePerDiems, { PER_DIEM_CLAIM_TYPES, PER_DIEM_TRAVEL_REGIONS } from "@/use/use-per-diems"

const headers = [
  {
    title: "Within Canada",
    key: "withinCanada",
  },
  {
    title: "Within USA",
    key: "withinUsa",
  },
  {
    title: "Outside Canada and USA",
    key: "outsideCanadaAndUsa",
  },
]

const perDiemsQuery = computed(() => {
  return {
    where: {
      claimType: PER_DIEM_CLAIM_TYPES.INCIDENTALS,
      travelRegion: [PER_DIEM_TRAVEL_REGIONS.CANADA, PER_DIEM_TRAVEL_REGIONS.US],
    },
    perPage: MAX_PER_PAGE,
  }
})
const { perDiems, isLoading } = usePerDiems(perDiemsQuery)

const perDiemsAsMatrix = computed(() => {
  const perDiemsByClaimType = groupBy(perDiems.value, "claimType")
  const matrix = mapValues(perDiemsByClaimType, (items, claimType) => {
    const row = { claimType }
    items.forEach(({ amount, travelRegion }) => {
      row[travelRegion] = amount
    })
    return row
  })

  return Object.values(matrix)
})
</script>
