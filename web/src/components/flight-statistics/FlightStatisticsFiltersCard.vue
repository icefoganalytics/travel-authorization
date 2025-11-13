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
            v-model="selectedLocationCategories"
            :items="locationCategoryOptions"
            label="Locations"
            chips
            clearable
            deletable-chips
            multiple
            outlined
            @input="selectLocationCategories"
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <v-autocomplete
            v-if="selectedLocationCategories.includes(LocationCategory.Yukon)"
            :value="byYukonDestinationCities"
            :items="yukonLocationCategories"
            label="Locations (Yukon)"
            chips
            clearable
            deletable-chips
            multiple
            outlined
            @input="updateYukonDestinations"
          />
          <v-autocomplete
            v-if="selectedLocationCategories.includes(LocationCategory.Canada)"
            :value="byCanadianDestinationProvinces"
            :items="canadianLocationCategories"
            label="Locations (Canada)"
            chips
            clearable
            deletable-chips
            multiple
            outlined
            @input="updateCanadaDestinations"
          />
          <v-autocomplete
            v-if="selectedLocationCategories.includes(LocationCategory.International)"
            :value="byInternationalDestinationProvinces"
            :items="internationalLocationCategories"
            label="Locations (International)"
            chips
            clearable
            deletable-chips
            multiple
            outlined
            @input="updateInternationalDestinations"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-autocomplete
            :value="byDepartments"
            :items="departments"
            label="Departments"
            chips
            clearable
            deletable-chips
            multiple
            outlined
            @input="updateDepartments"
          />
        </v-col>
      </v-row>
    </v-card-text>
  </HeaderActionsCard>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue"
import { cloneDeep, isEmpty, map, uniq } from "lodash"

import { MAX_PER_PAGE } from "@/api/base-api"
import useFlightStatistics, {
  type FlightStatisticFiltersOptions,
} from "@/use/use-flight-statistics"

import HeaderActionsCard from "@/components/common/HeaderActionsCard.vue"

const props = withDefaults(
  defineProps<{
    value: FlightStatisticFiltersOptions
  }>(),
  {
    value: () => ({}),
  }
)

const emit = defineEmits<{
  (event: "input", value: FlightStatisticFiltersOptions): void
}>()

const byYukonDestinationCities = computed(() => props.value.byYukonDestinationCities)
const byCanadianDestinationProvinces = computed(() => props.value.byCanadianDestinationProvinces)
const byInternationalDestinationProvinces = computed(
  () => props.value.byInternationalDestinationProvinces
)
const byDepartments = computed(() => props.value.byDepartments)

const flightStatisticsQuery = computed(() => ({
  perPage: MAX_PER_PAGE, // TODO: push filter generation to back-end
}))
const { flightStatistics, isLoading } = useFlightStatistics(flightStatisticsQuery)

const YUKON_ACRONYM = "YT"
// TODO: consider if Canadian provinces should exclude YT since it's a separate filter?
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
  YUKON_ACRONYM,
  "NT",
  "NU",
])

enum LocationCategory {
  Yukon = "Yukon",
  Canada = "Canada",
  International = "International",
}

const locationCategoryOptions = Object.values(LocationCategory)
const selectedLocationCategories = ref<LocationCategory[]>([])

watchEffect(() => {
  const categories: LocationCategory[] = []
  if (!isEmpty(props.value.byYukonDestinationCities)) {
    categories.push(LocationCategory.Yukon)
  }
  if (!isEmpty(props.value.byCanadianDestinationProvinces)) {
    categories.push(LocationCategory.Canada)
  }
  if (!isEmpty(props.value.byInternationalDestinationProvinces)) {
    categories.push(LocationCategory.International)
  }
  selectedLocationCategories.value = categories
})

// NOTE: departments are currently mailcodes due to bad data.
// I'm not sure how to fix this yet.
const departments = computed<string[]>(() => uniq(map(flightStatistics.value, "department")))

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

function selectLocationCategories(categories: LocationCategory[]) {
  const filters = cloneDeep(props.value)

  if (categories.includes(LocationCategory.Yukon)) {
    filters.byYukonDestinationCities = yukonLocationCategories.value
  } else {
    filters.byYukonDestinationCities = undefined
  }

  if (categories.includes(LocationCategory.Canada)) {
    filters.byCanadianDestinationProvinces = canadianLocationCategories.value
  } else {
    filters.byCanadianDestinationProvinces = undefined
  }

  if (categories.includes(LocationCategory.International)) {
    filters.byInternationalDestinationProvinces = internationalLocationCategories.value
  } else {
    filters.byInternationalDestinationProvinces = undefined
  }

  emit("input", filters)
}

function updateYukonDestinations(destinations: string[]) {
  const filters = cloneDeep(props.value)

  if (!isEmpty(destinations)) {
    filters.byYukonDestinationCities = destinations
  } else {
    filters.byYukonDestinationCities = undefined
  }

  emit("input", filters)
}

function updateCanadaDestinations(destinations: string[]) {
  const filters = cloneDeep(props.value)

  if (!isEmpty(destinations)) {
    filters.byCanadianDestinationProvinces = destinations
  } else {
    filters.byCanadianDestinationProvinces = undefined
  }

  emit("input", filters)
}

function updateInternationalDestinations(destinations: string[]) {
  const filters = cloneDeep(props.value)

  if (!isEmpty(destinations)) {
    filters.byInternationalDestinationProvinces = destinations
  } else {
    filters.byInternationalDestinationProvinces = undefined
  }

  emit("input", filters)
}

function updateDepartments(departments: string[]) {
  const filters = cloneDeep(props.value)

  if (!isEmpty(departments)) {
    filters.byDepartments = departments
  } else {
    filters.byDepartments = undefined
  }

  emit("input", filters)
}

function resetFilters() {
  emit("input", {})
}
</script>

<style scoped></style>
