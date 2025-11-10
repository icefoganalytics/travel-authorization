<template>
  <v-skeleton-loader
    v-if="isLoading"
    type="card"
  />
  <HeaderActionsCard
    v-else
    title="Filters"
  >
    <template #header-actions>
      <v-btn
        class="my-0"
        color="warning"
        outlined
        @click="resetFilters"
      >
        Clear Filters
      </v-btn>
    </template>
    <v-card-text>
      <v-row>
        <v-col
          cols="12"
          md="6"
        >
          <v-autocomplete
            :value="selectedLocationCategories"
            :items="locationCategories"
            label="Locations"
            chips
            clearable
            deletable-chips
            multiple
            outlined
            @input="selectLocationCategory"
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <div
            v-for="(locationCategory, categoryIndex) in locationCategories"
            :key="categoryIndex"
          >
            <v-autocomplete
              v-if="selectedLocationCategories.includes(locationCategory)"
              :value="selectedLocationSubCategories[locationCategory]"
              :items="locationSubCategories[locationCategory]"
              :label="`Locations (${locationCategory})`"
              chips
              clearable
              deletable-chips
              multiple
              outlined
              @input="selectLocationSubCategory(locationCategory, $event)"
            />
          </div>
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-autocomplete
            :value="selectedDepartments"
            :items="departments"
            label="Departments"
            chips
            clearable
            deletable-chips
            multiple
            outlined
            @input="selectDepartment"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </HeaderActionsCard>
</template>

<script lang="ts">
export type LocationsByRegion = Record<"Yukon" | "Canada" | "International", string[]>
export type LocationCategory = keyof LocationsByRegion

export type FlightStatisticFilters = {
  departments: string[]
  locationCategories: LocationCategory[]
  locationSubCategories: Record<LocationCategory, string[]>
}
</script>

<script setup lang="ts">
import { computed, nextTick, ref } from "vue"
import { map, uniq } from "lodash"

import { MAX_PER_PAGE } from "@/api/base-api"
import useFlightStatistics from "@/use/use-flight-statistics"

import HeaderActionsCard from "@/components/common/HeaderActionsCard.vue"

const props = defineProps<{
  value: FlightStatisticFilters
}>()

const emit = defineEmits<{
  (event: "input", value: FlightStatisticFilters): void
}>()

const flightStatisticsQuery = computed(() => ({
  perPage: MAX_PER_PAGE, // TODO: push filter generation to back-end
}))
const { flightStatistics, isLoading } = useFlightStatistics(flightStatisticsQuery)

const YUKON_ACRONYM = "YT"
const CANADIAN_PROVINCE_ACRONYMS = Object.freeze([
  "BC",
  "ON",
  "QC",
  "AB",
  "SK",
  "MB",
  "NL",
  "PE",
  "NS",
  "NB",
  "YT",
  "NT",
  "NU",
])

const selectedLocationCategories = ref<LocationCategory[]>(props.value.locationCategories)
const selectedLocationSubCategories = ref<Record<LocationCategory, string[]>>(
  props.value.locationSubCategories
)

// NOTE: departments are currently mailcodes due to bad data.
// I'm not sure how to fix this yet.
const departments = computed<string[]>(() => uniq(map(flightStatistics.value, "department")))
const selectedDepartments = ref<string[]>(props.value.departments)

const yukonLocationCategories = computed(() =>
  uniq(
    flightStatistics.value
      .filter((flight) => flight.destinationProvince === YUKON_ACRONYM)
      .map((flight) => flight.destinationCity)
  )
)
const canadianLocationCategories = computed(() =>
  uniq(
    flightStatistics.value
      .filter((flight) => CANADIAN_PROVINCE_ACRONYMS.includes(flight.destinationProvince))
      .map((flight) => flight.destinationProvince)
  )
)
const internationalLocationCategories = computed(() =>
  uniq(
    flightStatistics.value
      .filter((flight) => !CANADIAN_PROVINCE_ACRONYMS.includes(flight.destinationProvince))
      .map((flightStatistic) => flightStatistic.destinationProvince)
  )
)
const locationSubCategories = computed<LocationsByRegion>(() => ({
  Yukon: yukonLocationCategories.value,
  Canada: canadianLocationCategories.value,
  International: internationalLocationCategories.value,
}))
const locationCategories = computed<LocationCategory[]>(
  () => Object.keys(locationSubCategories.value) as (keyof LocationsByRegion)[]
)

async function selectLocationCategory(newLocationCategories: LocationCategory[]) {
  selectedLocationCategories.value = newLocationCategories

  locationCategories.value.forEach((category) => {
    if (!selectedLocationCategories.value.includes(category)) {
      selectedLocationSubCategories.value[category] = []
    } else {
      selectedLocationSubCategories.value[category] = locationSubCategories.value[category]
    }
  })

  emitFilterUpdate()
}

async function selectLocationSubCategory(
  locationCategory: LocationCategory,
  newLocationSubCategories: string[]
) {
  selectedLocationSubCategories.value[locationCategory] = newLocationSubCategories

  if (newLocationSubCategories.length === 0) {
    selectedLocationCategories.value = selectedLocationCategories.value.filter(
      (category) => category !== locationCategory
    )
  }

  emitFilterUpdate()
}

async function selectDepartment(newDepartments: string[]) {
  selectedDepartments.value = newDepartments

  emitFilterUpdate()
}

async function resetFilters() {
  selectedLocationCategories.value = []
  selectedLocationSubCategories.value = {
    Yukon: [],
    Canada: [],
    International: [],
  }
  selectedDepartments.value = []

  emitFilterUpdate()
}

async function emitFilterUpdate() {
  await nextTick()
  emit("input", {
    departments: selectedDepartments.value,
    locationCategories: selectedLocationCategories.value,
    locationSubCategories: selectedLocationSubCategories.value,
  })
}
</script>

<style scoped>
.v-card.borderless-card {
  border: none !important;
  box-shadow: none !important;
}
</style>
