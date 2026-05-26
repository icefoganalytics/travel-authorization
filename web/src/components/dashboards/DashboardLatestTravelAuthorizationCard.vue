<template>
  <v-card>
    <v-card-title>Most Recent Trip</v-card-title>
    <v-skeleton-loader
      v-if="isLoading"
      type="card"
    />
    <v-card-text
      v-else-if="
        !isNil(travelAuthorizationId) &&
        !isNil(travelAuthorizationAsIndex) &&
        !isNil(travelAuthorizationAsShow)
      "
    >
      <v-row>
        <v-col
          cols="12"
          md="4"
        >
          <v-card>
            <v-card-text>
              <v-row>
                <v-col>
                  <DescriptionElement
                    label="Purpose of Travel"
                    :value="travelAuthorizationAsShow.eventName || 'Not specified'"
                    vertical
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <LocationDescriptionElement
                    v-if="finalDestinationLocationId"
                    label="Destination"
                    :location-id="finalDestinationLocationId"
                  />
                  <DescriptionElement
                    v-else
                    label="Destination"
                    value="Not specified"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <DescriptionElement
                    label="Depart"
                    :value="formattedDepartingAt || 'Not specified'"
                    vertical
                  />
                </v-col>
                <v-col>
                  <DescriptionElement
                    label="Return"
                    :value="formattedReturningAt || 'Not specified'"
                    vertical
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col>
                  <DescriptionElement
                    label="Days on non-travel status"
                    :value="travelAuthorizationAsShow.daysOffTravelStatusEstimate ?? '0'"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
          <v-btn
            class="mt-6"
            :to="{
              name: 'my-travel-requests/MyTravelRequestWizardPage',
              params: {
                travelAuthorizationId: travelAuthorizationId,
                stepName: travelAuthorizationAsShow.wizardStepName,
              },
            }"
            color="primary"
            variant="outlined"
            block
          >
            Go to Travel Authorization
          </v-btn>
        </v-col>
        <v-col
          cols="12"
          md="8"
        >
          <DashboardExpensesDataTable
            :where="travelAuthorizationExpensesWhere"
            route-query-suffix="DashboardRecentTripExpenses"
          />
        </v-col>
      </v-row>
    </v-card-text>
    <v-empty-state
      v-else
      icon="mdi-airplane"
      text="No travel authorizations found"
      title="Get Started"
    >
      <template #actions>
        <v-btn
          color="primary"
          variant="elevated"
          :to="{
            name: 'my-travel-requests/MyTravelRequestsPage',
          }"
        >
          Create Travel Authorization
        </v-btn>
      </template>
    </v-empty-state>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { isNil } from "lodash"

import useTravelAuthorizations, {
  type TravelAuthorizationQueryOptions,
} from "@/use/use-travel-authorizations"
import useTravelAuthorization from "@/use/use-travel-authorization"
import useTravelAuthorizationSummary from "@/use/travel-authorizations/use-travel-authorization-summary"
import { formatDateTime } from "@/utils/formatters"

import DescriptionElement from "@/components/common/DescriptionElement.vue"
import LocationDescriptionElement from "@/components/locations/LocationDescriptionElement.vue"
import DashboardExpensesDataTable from "@/components/dashboards/DashboardExpensesDataTable.vue"

const activeTravelAuthorizationQuery = computed<TravelAuthorizationQueryOptions>(() => ({
  filters: {
    isActiveTrip: true,
  },
  order: [["createdAt", "desc"]],
  perPage: 1,
}))

const fallbackTravelAuthorizationQuery = computed<TravelAuthorizationQueryOptions>(() => ({
  order: [["createdAt", "desc"]],
  perPage: 1,
}))

const {
  travelAuthorizations: activeTravelAuthorizations,
  isLoading: isLoadingActiveTravelAuthorizations,
} = useTravelAuthorizations(activeTravelAuthorizationQuery)

const {
  travelAuthorizations: fallbackTravelAuthorizations,
  isLoading: isLoadingFallbackTravelAuthorizations,
} = useTravelAuthorizations(fallbackTravelAuthorizationQuery)

const activeOrFallbackTravelAuthorizations = computed(() => {
  if (activeTravelAuthorizations.value.length > 0) {
    return activeTravelAuthorizations.value
  }
  return fallbackTravelAuthorizations.value
})

const travelAuthorizationId = computed(() => activeOrFallbackTravelAuthorizations.value[0]?.id)
const travelAuthorizationAsIndex = computed(() => activeOrFallbackTravelAuthorizations.value[0])

const {
  travelAuthorization: travelAuthorizationAsShow,
  isLoading: isLoadingTravelAuthorizationAsShow,
} = useTravelAuthorization(travelAuthorizationId)

const isLoading = computed(
  () =>
    isLoadingActiveTravelAuthorizations.value ||
    isLoadingFallbackTravelAuthorizations.value ||
    isLoadingTravelAuthorizationAsShow.value
)

const { finalDestinationLocationId } = useTravelAuthorizationSummary(travelAuthorizationId)

const formattedDepartingAt = computed(() =>
  formatDateTime(travelAuthorizationAsIndex.value?.departingAt, "MMM d yyyy, h:mm\u00A0a")
)
const formattedReturningAt = computed(() =>
  formatDateTime(travelAuthorizationAsIndex.value?.returningAt, "MMM d yyyy, h:mm\u00A0a")
)

const travelAuthorizationExpensesWhere = computed(() => ({
  travelAuthorizationId: travelAuthorizationId.value,
}))
</script>
