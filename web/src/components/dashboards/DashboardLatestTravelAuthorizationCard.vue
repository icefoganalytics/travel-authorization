<template>
  <v-card class="mt-5 default">
    <v-card-title>Latest Travel Authorization</v-card-title>
    <v-skeleton-loader
      v-if="isLoading"
      type="card"
    />
    <v-card-text
      v-else-if="
        !isNil(recentTravelAuthorizationId) &&
        !isNil(recentTravelAuthorizationAsIndex) &&
        !isNil(recentTravelAuthorizationAsShow)
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
                    :value="recentTravelAuthorizationAsShow.eventName || 'Not specified'"
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
                    :value="recentTravelAuthorizationAsShow.daysOffTravelStatusEstimate ?? '0'"
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
                travelAuthorizationId: recentTravelAuthorizationId,
                stepName: recentTravelAuthorizationAsShow.wizardStepName,
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
            v-if="recentTravelAuthorizationId"
            :where="recentTripExpensesWhere"
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

const latestTravelAuthorizationQuery = computed<TravelAuthorizationQueryOptions>(() => ({
  order: [["createdAt", "desc"]],
  perPage: 1,
}))

const { travelAuthorizations, isLoading: isLoadingLatestTravelAuthorization } =
  useTravelAuthorizations(latestTravelAuthorizationQuery)

const recentTravelAuthorizationId = computed(() => travelAuthorizations.value[0]?.id)
const recentTravelAuthorizationAsIndex = computed(() => travelAuthorizations.value[0])

const {
  travelAuthorization: recentTravelAuthorizationAsShow,
  isLoading: isLoadingRecentTravelAuthorizationAsShow,
} = useTravelAuthorization(recentTravelAuthorizationId)

const isLoading = computed(
  () => isLoadingLatestTravelAuthorization.value || isLoadingRecentTravelAuthorizationAsShow.value
)

const { finalDestinationLocationId } = useTravelAuthorizationSummary(recentTravelAuthorizationId)

const formattedDepartingAt = computed(() =>
  formatDateTime(recentTravelAuthorizationAsIndex.value?.departingAt, "MMM d yyyy, h:mm\u00A0a")
)
const formattedReturningAt = computed(() =>
  formatDateTime(recentTravelAuthorizationAsIndex.value?.returningAt, "MMM d yyyy, h:mm\u00A0a")
)

const recentTripExpensesWhere = computed(() => ({
  travelAuthorizationId: recentTravelAuthorizationId.value,
}))
</script>
