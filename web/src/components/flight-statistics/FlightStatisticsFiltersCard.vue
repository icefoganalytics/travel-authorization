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
        variant="outlined"
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
            :model-value="selectedLocationCategories"
            :items="locationCategoryOptions"
            label="Locations"
            chips
            clearable
            closable-chips
            multiple
            variant="outlined"
            @update:model-value="selectLocationCategories"
          />
        </v-col>
        <v-col
          cols="12"
          md="6"
        >
          <v-autocomplete
            v-show="selectedLocationCategories.includes(LocationCategory.Yukon)"
            :model-value="byYukonDestinationCities"
            :items="yukonLocationCategories"
            label="Locations (Yukon)"
            chips
            clearable
            closable-chips
            multiple
            variant="outlined"
            @update:model-value="updateYukonDestinations"
          />
          <v-autocomplete
            v-show="selectedLocationCategories.includes(LocationCategory.Canada)"
            :model-value="byCanadianDestinationProvinces"
            :items="canadianLocationCategories"
            label="Locations (Canada)"
            chips
            clearable
            closable-chips
            multiple
            variant="outlined"
            @update:model-value="updateCanadaDestinations"
          />
          <v-autocomplete
            v-show="selectedLocationCategories.includes(LocationCategory.International)"
            :model-value="byInternationalDestinationProvinces"
            :items="internationalLocationCategories"
            label="Locations (International)"
            chips
            clearable
            closable-chips
            multiple
            variant="outlined"
            @update:model-value="updateInternationalDestinations"
          />
        </v-col>
      </v-row>
      <v-row>
        <v-col>
          <v-autocomplete
            :model-value="byDepartmentMailcodes"
            :items="departmentMailcodes"
            label="Department Mailcodes"
            chips
            clearable
            closable-chips
            multiple
            variant="outlined"
            @update:model-value="updateDepartmentMailcodes"
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
    modelValue: FlightStatisticFiltersOptions
  }>(),
  {
    modelValue: () => ({}),
  }
)

const emit = defineEmits<{
  (event: "update:modelValue", value: FlightStatisticFiltersOptions): void
}>()

const byYukonDestinationCities = computed(
  () => props.modelValue.byLocations?.byYukonDestinationCities
)
const byCanadianDestinationProvinces = computed(
  () => props.modelValue.byLocations?.byCanadianDestinationProvinces
)
const byInternationalDestinationProvinces = computed(
  () => props.modelValue.byLocations?.byInternationalDestinationProvinces
)
const byDepartmentMailcodes = computed(() => props.modelValue.byDepartmentMailcodes)

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
  if (!isEmpty(byYukonDestinationCities.value)) {
    categories.push(LocationCategory.Yukon)
  }
  if (!isEmpty(byCanadianDestinationProvinces.value)) {
    categories.push(LocationCategory.Canada)
  }
  if (!isEmpty(byInternationalDestinationProvinces.value)) {
    categories.push(LocationCategory.International)
  }
  selectedLocationCategories.value = categories
})

// NOTE: department field contains mail codes, not department names.
// Multiple mail codes may map to the same department.
const departmentMailcodes = computed<string[]>(() =>
  uniq(map(flightStatistics.value, "departmentMailcode"))
)

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
  const filters = cloneDeep(props.modelValue)
  filters.byLocations ??= {}

  if (
    categories.includes(LocationCategory.Yukon) &&
    !selectedLocationCategories.value.includes(LocationCategory.Yukon)
  ) {
    filters.byLocations.byYukonDestinationCities = yukonLocationCategories.value
  } else if (
    !categories.includes(LocationCategory.Yukon) &&
    selectedLocationCategories.value.includes(LocationCategory.Yukon)
  ) {
    delete filters.byLocations.byYukonDestinationCities
  }

  if (
    categories.includes(LocationCategory.Canada) &&
    !selectedLocationCategories.value.includes(LocationCategory.Canada)
  ) {
    filters.byLocations.byCanadianDestinationProvinces = canadianLocationCategories.value
  } else if (
    !categories.includes(LocationCategory.Canada) &&
    selectedLocationCategories.value.includes(LocationCategory.Canada)
  ) {
    delete filters.byLocations.byCanadianDestinationProvinces
  }

  if (
    categories.includes(LocationCategory.International) &&
    !selectedLocationCategories.value.includes(LocationCategory.International)
  ) {
    filters.byLocations.byInternationalDestinationProvinces = internationalLocationCategories.value
  } else if (
    !categories.includes(LocationCategory.International) &&
    selectedLocationCategories.value.includes(LocationCategory.International)
  ) {
    delete filters.byLocations.byInternationalDestinationProvinces
  }

  if (isEmpty(filters.byLocations)) {
    delete filters.byLocations
  }

  emit("update:modelValue", filters)
}

function updateYukonDestinations(destinations: string[]) {
  const filters = cloneDeep(props.modelValue)

  if (!isEmpty(destinations)) {
    filters.byLocations ??= {}
    filters.byLocations.byYukonDestinationCities = destinations
  } else if (filters.byLocations) {
    delete filters.byLocations.byYukonDestinationCities
    if (isEmpty(filters.byLocations)) {
      delete filters.byLocations
    }
  }

  emit("update:modelValue", filters)
}

function updateCanadaDestinations(destinations: string[]) {
  const filters = cloneDeep(props.modelValue)

  if (!isEmpty(destinations)) {
    filters.byLocations ??= {}
    filters.byLocations.byCanadianDestinationProvinces = destinations
  } else if (filters.byLocations) {
    delete filters.byLocations.byCanadianDestinationProvinces
    if (isEmpty(filters.byLocations)) {
      delete filters.byLocations
    }
  }

  emit("update:modelValue", filters)
}

function updateInternationalDestinations(destinations: string[]) {
  const filters = cloneDeep(props.modelValue)

  if (!isEmpty(destinations)) {
    filters.byLocations ??= {}
    filters.byLocations.byInternationalDestinationProvinces = destinations
  } else if (filters.byLocations) {
    delete filters.byLocations.byInternationalDestinationProvinces
    if (isEmpty(filters.byLocations)) {
      delete filters.byLocations
    }
  }

  emit("update:modelValue", filters)
}

function updateDepartmentMailcodes(departmentMailcodes: string[]) {
  const filters = cloneDeep(props.modelValue)

  if (!isEmpty(departmentMailcodes)) {
    filters.byDepartmentMailcodes = departmentMailcodes
  } else {
    filters.byDepartmentMailcodes = undefined
  }

  emit("update:modelValue", filters)
}

function resetFilters() {
  emit("update:modelValue", {})
}
</script>

<style scoped></style>
