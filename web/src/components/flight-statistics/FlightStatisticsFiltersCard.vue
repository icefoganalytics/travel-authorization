<template>
  <v-card class="borderless-card">
    <v-card>
      <v-card-title> Location </v-card-title>
      <v-card-text>
        <v-row>
          <v-col
            v-for="(locationCategory, categoryIndex) in locationCategories"
            :key="categoryIndex"
            cols="12"
            md="4"
          >
            <v-checkbox
              :input-value="selectedLocationCategories"
              multiple
              dense
              :value="locationCategory"
              :label="locationCategory"
              @change="selectLocationCategory"
            />

            <template v-if="selectedLocationCategories.includes(locationCategory)">
              <v-col
                v-for="(locationSubCategory, index) in locations[locationCategory]"
                :key="index"
              >
                <v-checkbox
                  :input-value="selectedLocationSubCategories[locationCategory]"
                  multiple
                  dense
                  :value="locationSubCategory"
                  :label="locationSubCategory"
                  @change="selectLocationSubCategory(locationCategory, $event)"
                />
              </v-col>
            </template>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card class="mt-5">
      <v-card-title> Department </v-card-title>
      <v-skeleton-loader
        v-if="isLoading"
        type="card"
      />
      <v-card-text v-else>
        <v-row
          v-for="rowIndex of range(numberOfDepartmentRows)"
          :key="rowIndex"
          class="mx-3 my-0"
        >
          <v-col
            v-for="(department, departmentIndex) in departments.slice(
              rowIndex * 4,
              rowIndex * 4 + 4
            )"
            :key="departmentIndex"
            style="margin: 0; padding: 0"
            cols="3"
          >
            <v-checkbox
              :input-value="selectedDepartments"
              multiple
              style="font-size: 12px"
              dense
              :value="department"
              :label="department"
              @change="emitFilterUpdate"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-card>
</template>

<script lang="ts">
export type LocationsByRegion = Record<"Yukon" | "Canada" | "International", string[]>
export type LocationCategory = keyof LocationsByRegion
</script>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from "vue"
import { map, range, uniq } from "lodash"

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

// NOTE: departments are currently mailcodes do to bad data.
// I'm not sure how to fix this yet.
const departments = computed<string[]>(() => uniq(map(flightStatistics.value, "department")))
const selectedDepartments = ref<string[]>([])
const numberOfDepartmentRows = computed<number>(() => Math.ceil(departments.value.length / 4))

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
