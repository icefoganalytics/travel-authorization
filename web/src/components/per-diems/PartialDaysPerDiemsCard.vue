<template>
  <v-card>
    <v-card-title><h3>Partial days on travel status</h3></v-card-title>
    <v-card-text> The amount claimed up to a maximum of: </v-card-text>

    <v-data-table
      :headers="headers"
      :items="perDiemsAsMatrix"
      :loading="isLoading"
    >
      <template #item.claimType="{ value }">
        {{ t(`per_diem.claim_type.${value}`, value) }}
      </template>
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
import { useI18n } from "vue-i18n"
import { groupBy, mapValues } from "lodash"

import { MAX_PER_PAGE } from "@/api/base-api"
import formatCurrency from "@/utils/format-currency"
import usePerDiems, { PER_DIEM_CLAIM_TYPES, PER_DIEM_TRAVEL_REGIONS } from "@/use/use-per-diems"

const { t } = useI18n()

const headers = [
  {
    text: "",
    value: "claimType",
  },
  {
    text: "Yukon/Alaska",
    value: "yukonAndAlaska",
  },
  {
    text: "NWT",
    value: "nwt",
  },
  {
    text: "Nunavut",
    value: "nunavut",
  },
  {
    text: "Rest of Canada",
    value: "restOfCanada",
  },
  {
    text: "Rest of USA",
    value: "restOfUsa",
  },
]

const perDiemsQuery = computed(() => {
  return {
    where: {
      claimType: [
        PER_DIEM_CLAIM_TYPES.BREAKFAST,
        PER_DIEM_CLAIM_TYPES.LUNCH,
        PER_DIEM_CLAIM_TYPES.DINNER,
      ],
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
