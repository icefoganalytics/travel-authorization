<template>
  <v-card class="borderless-card">
    <v-card>
      <v-card-title> Location </v-card-title>
      <v-card-text>
        <v-row class="mx-0">
          <v-col
            v-for="(locationCategory, categoryIndex) in location.categories"
            :key="categoryIndex"
          >
            <v-checkbox
              :input-value="selectedCategories"
              multiple
              dense
              :value="locationCategory"
              :label="locationCategory"
              @change="selectCategory($event, locationCategory)"
            />

            <div
              v-if="selectedCategories.includes(locationCategory)"
              class="ml-5"
            >
              <v-checkbox
                v-for="(locationSubCategory, index) in location.subCategories[locationCategory]"
                :key="index"
                :input-value="selectedSubCategories[locationCategory]"
                multiple
                dense
                :value="locationSubCategory"
                :label="locationSubCategory"
                @change="updateFilters"
              />
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-card class="mt-5">
      <v-card-title> Department </v-card-title>
      <v-card-text>
        <v-row
          v-for="rowIndex of [...Array(numberOfDeptRows).keys()]"
          :key="rowIndex"
          style=""
          class="mx-3 my-0"
        >
          <v-col
            v-for="(department, departmentIndex) in departmentList.slice(rowIndex * 4, rowIndex * 4 + 4)"
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
              @change="updateFilters"
            />
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-card>
</template>

<script lang="ts">
export type LocationCategory = "Yukon" | "Canada" | "International"

export type LocationsByRegion = Record<LocationCategory, string[]>
</script>

<script setup lang="ts">
import { nextTick, onMounted, ref } from "vue"

import { type FlightStatisticAsIndex } from "@/api/flight-statistics-api"

const props = defineProps<{
  flightReport: FlightStatisticAsIndex[]
}>()

const emit = defineEmits<{
  (event: "updateFilters", departments: string[], subCategories: LocationsByRegion): void
}>()

const location = ref<{
  categories: LocationCategory[]
  subCategories: Record<LocationCategory, string[]>
}>({
  categories: ["Yukon", "Canada", "International"],
  subCategories: {
    Yukon: [],
    Canada: [],
    International: [],
  },
})

const selectedCategories = ref<LocationCategory[]>([])
const selectedSubCategories = ref<Record<LocationCategory, string[]>>({
  Yukon: [],
  Canada: [],
  International: [],
})

const departmentList = ref<string[]>([])
const selectedDepartments = ref<string[]>([])
const numberOfDeptRows = ref(0)

onMounted(() => {
  initDepartments()
  initLocations()
  initFilters()
})

async function initFilters() {
  selectedCategories.value = []
  selectedSubCategories.value = {
    Yukon: [],
    Canada: [],
    International: [],
  }
  selectedDepartments.value = []
  updateFilters()
}

async function updateFilters() {
  await nextTick()
  emit("updateFilters", selectedDepartments.value, selectedSubCategories.value)
}

async function initDepartments() {
  const existingDepartments = props.flightReport.map((flight) => flight.department)
  departmentList.value = [...new Set(existingDepartments)]
  numberOfDeptRows.value = Math.ceil(departmentList.value.length / 4)
}

async function initLocations() {
  const canadianProvinces = [
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
  ]
  const existingProvinces = props.flightReport.map((flight) => flight.destinationProvince)
  const provinces = [...new Set(existingProvinces)]

  const yukonFlights = props.flightReport.filter((flight) => flight.destinationProvince == "YT")
  const existingYukonCities = yukonFlights.map((flight) => flight.destinationCity)

  location.value.subCategories.Yukon = [...new Set(existingYukonCities)]
  location.value.subCategories.Canada = provinces.filter((province) => canadianProvinces.includes(province))
  location.value.subCategories.International = provinces.filter(
    (province) => !canadianProvinces.includes(province)
  )
}

async function selectCategory(selectedCategories: string[], locationCategory: LocationCategory) {
  if (!selectedCategories.includes(locationCategory)) {
    selectedSubCategories.value[locationCategory] = []
  }
  updateFilters()
}
</script>

<style scoped>
.v-card.borderless-card {
  border: none !important;
  box-shadow: none !important;
}
</style>
