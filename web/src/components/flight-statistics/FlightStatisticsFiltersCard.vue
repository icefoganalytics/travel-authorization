<template>
  <v-card class="borderless-card">
    <v-card>
      <v-card-title> Location </v-card-title>
      <v-card-text>
        <v-row class="mx-0">
          <v-col
            v-for="(locationCategory, categoryInx) in location.categories"
            :key="categoryInx"
          >
            <v-checkbox
              v-model="selectedCategories"
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
                v-for="(locationSubCategory, inx) in location.subCategories[locationCategory]"
                :key="inx"
                v-model="selectedSubCategories[locationCategory]"
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
          v-for="rowInx of [...Array(numberOfDeptRows).keys()]"
          :key="rowInx"
          style=""
          class="mx-3 my-0"
        >
          <v-col
            v-for="(dept, deptInx) in departmentList.slice(rowInx * 4, rowInx * 4 + 4)"
            :key="deptInx"
            style="margin: 0; padding: 0"
            cols="3"
          >
            <v-checkbox
              v-model="selectedDepartments"
              multiple
              style="font-size: 12px"
              dense
              :value="dept"
              :label="dept"
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
  const CanadianProvinces = [
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
  location.value.subCategories.Canada = provinces.filter((prv) => CanadianProvinces.includes(prv))
  location.value.subCategories.International = provinces.filter(
    (prv) => !CanadianProvinces.includes(prv)
  )
}

async function selectCategory($event: string[], locationCategory: LocationCategory) {
  if (!$event.includes(locationCategory)) {
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
