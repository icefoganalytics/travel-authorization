<template>
  <v-skeleton-loader
    v-if="isLoading"
    type="card"
  />
  <v-card v-else>
    <v-card-title>Filters</v-card-title>
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
              :items="locations[locationCategory]"
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
  </v-card>
</template>

<script lang="ts">
export type LocationsByRegion = Record<"Yukon" | "Canada" | "International", string[]>
export type LocationCategory = keyof LocationsByRegion
</script>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue"
import { map, uniq } from "lodash"

import { MAX_PER_PAGE } from "@/api/base-api"
import useFlightStatistics from "@/use/use-flight-statistics"

// TODO: switch to v-model for filters.
const emit = defineEmits<{
  (event: "updateFilters", departments: string[], subCategories: LocationsByRegion): void
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

const selectedLocationCategories = ref<LocationCategory[]>([])
const selectedLocationSubCategories = ref<Record<LocationCategory, string[]>>({
  Yukon: [],
  Canada: [],
  International: [],
})

// NOTE: departments are currently mailcodes due to bad data.
// I'm not sure how to fix this yet.
const departments = computed<string[]>(() => uniq(map(flightStatistics.value, "department")))
const selectedDepartments = ref<string[]>([])

const yukonFlights = computed(() =>
  uniq(
    flightStatistics.value
      .filter((flight) => flight.destinationProvince === YUKON_ACRONYM)
      .map((flight) => flight.destinationCity)
  )
)
const canadianFlights = computed(() =>
  uniq(
    flightStatistics.value
      .filter((flight) => CANADIAN_PROVINCE_ACRONYMS.includes(flight.destinationProvince))
      .map((flight) => flight.destinationProvince)
  )
)
const internationalFlights = computed(() =>
  uniq(
    flightStatistics.value
      .filter((flight) => !CANADIAN_PROVINCE_ACRONYMS.includes(flight.destinationProvince))
      .map((flightStatistic) => flightStatistic.destinationProvince)
  )
)
const locations = computed<LocationsByRegion>(() => ({
  Yukon: yukonFlights.value,
  Canada: canadianFlights.value,
  International: internationalFlights.value,
}))
const locationCategories = computed<LocationCategory[]>(
  () => Object.keys(locations.value) as (keyof LocationsByRegion)[]
)

async function emitFilterUpdate() {
  await nextTick()
  emit("updateFilters", selectedDepartments.value, selectedLocationSubCategories.value)
}

async function selectLocationCategory(newLocationCategories: LocationCategory[]) {
  selectedLocationCategories.value = newLocationCategories

  locationCategories.value.forEach((category) => {
    if (!selectedLocationCategories.value.includes(category)) {
      selectedLocationSubCategories.value[category] = []
    }
  })

  emitFilterUpdate()
}

async function selectLocationSubCategory(
  locationCategory: LocationCategory,
  newLocationSubCategories: string[]
) {
  selectedLocationSubCategories.value[locationCategory] = newLocationSubCategories

  emitFilterUpdate()
}

async function selectDepartment(newDepartments: string[]) {
  selectedDepartments.value = newDepartments

  emitFilterUpdate()
}

onMounted(() => {
  resetFilters()
})

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
</script>

<style scoped>
.v-card.borderless-card {
  border: none !important;
  box-shadow: none !important;
}
</style>
