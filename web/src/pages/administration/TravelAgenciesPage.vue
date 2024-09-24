<template>
  <v-container class="pa-0 py-md-3 px-md-6">
    <v-card>
      <v-card-title class="d-flex justify-space-between align-center">
        <h2>Travel Agencies</h2>
        <v-btn
          color="primary"
          :to="{ name: 'administration/travel-agencies/TravelAgencyNewPage' }"
          >Add Travel Agency</v-btn
        >
      </v-card-title>
      <v-card-text>
        <v-data-table
          :page.sync="page"
          :items-per-page.sync="perPage"
          :options.sync="options"
          :headers="headers"
          :items="travelDeskTravelAgencies"
          :loading="isLoading"
          :server-items-length="totalCount"
          multi-sort
          class="elevation-1 mt-4"
          @dblclick:row="(_, { item }) => goToEditPage(item.id)"
        >
          <template #item.agencyInfo="{ value }">
            <span class="preserve-whitespace">
              {{ value }}
            </span>
          </template>
          <template #item.edit="{ item }">
            <v-btn
              title="Edit"
              color="info"
              icon
              :to="{
                name: 'administration/travel-agencies/TravelAgencyEditPage',
                params: { travelDeskTravelAgencyId: item.id },
              }"
            >
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn
              title="Delete"
              class="ml-2"
              :loading="isDeleting"
              color="error"
              icon
              @click="deleteTravelAgency(item.id)"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup>
import { computed, ref, watch } from "vue"
import { useRouter } from "vue2-helpers/vue-router"
import { isEmpty, isNil } from "lodash"

import { useSnack } from "@/plugins/snack-plugin"
import travelDeskTravelAgenciesApi from "@/api/travel-desk-travel-agencies-api"
import useTravelDeskTravelAgencies from "@/use/use-travel-desk-travel-agencies"
import useBreadcrumbs from "@/use/use-breadcrumbs"
import useRouteQuery from "@/use/use-route-query"

const headers = ref([
  { text: "Agency Name", value: "agencyName", class: "blue-grey lighten-4" },
  { text: "Contact Name", value: "contactName", class: "blue-grey lighten-4" },
  { text: "Contact Phone Number", value: "contactPhoneNumber", class: "blue-grey lighten-4" },
  { text: "Contact Email", value: "contactEmail", class: "blue-grey lighten-4" },
  { text: "Agency Info", value: "agencyInfo", class: "blue-grey lighten-4", sortable: false },
  {
    text: "",
    value: "edit",
    class: "blue-grey lighten-4",
    width: "8rem",
    cellClass: "px-0 mx-0",
    sortable: false,
  },
])

const page = useRouteQuery("page", "1", { transform: parseInt })
const perPage = useRouteQuery("perPage", "5", { transform: parseInt })
const options = ref(null)

const order = computed(() => {
  if (isNil(options.value) || isNil(options.value.sortBy) || isEmpty(options.value.sortBy)) {
    return undefined
  }

  return options.value.sortBy.map((column, index) => {
    const direction = options.value.sortDesc[index] ? "DESC" : "ASC"
    return [column, direction]
  })
})

watch(order, (newOrder) => {
  console.log("newOrder:", newOrder)
})

const travelDeskTravelAgenciesQuery = computed(() => ({
  page: page.value,
  perPage: perPage.value,
  order: order.value,
}))
const { travelDeskTravelAgencies, totalCount, isLoading, refresh } = useTravelDeskTravelAgencies(
  travelDeskTravelAgenciesQuery
)

const isDeleting = ref(false)
const snack = useSnack()

async function deleteTravelAgency(id) {
  const result = confirm("Are you sure you want to remove this?")
  if (result === false) return

  isDeleting.value = true
  try {
    await travelDeskTravelAgenciesApi.delete(id)
    await refresh()
  } catch (error) {
    console.error(error)
    snack(`Failed to delete travel agency: ${error}`, {
      color: "error",
    })
  } finally {
    isDeleting.value = false
  }
}

const router = useRouter()

function goToEditPage(travelDeskTravelAgencyId) {
  return router.push({
    name: "administration/travel-agencies/TravelAgencyEditPage",
    params: { travelDeskTravelAgencyId },
  })
}

useBreadcrumbs([
  {
    text: "Administration",
    to: { name: "AdministrationPage" },
  },
  {
    text: "Travel Agencies",
    to: { name: "administration/TravelAgenciesPage" },
  },
])
</script>

<style scoped>
.preserve-whitespace {
  white-space: pre-wrap;
}
</style>
