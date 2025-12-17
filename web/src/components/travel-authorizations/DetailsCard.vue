<template>
  <v-skeleton-loader
    v-if="isNil(travelAuthorization)"
    type="card"
  />
  <HeaderActionsCard
    v-else
    title="Details"
  >
    <template #header-actions><slot name="header-actions"></slot></template>

    <v-row>
      <v-col cols="12">
        <DescriptionElement label="Trip Type">
          <TravelAuthorizationTripTypeChip
            v-if="travelAuthorization.tripTypeEstimate"
            :value="travelAuthorization.tripTypeEstimate"
          />
        </DescriptionElement>
      </v-col>
    </v-row>

    <TravelSegmentsSection
      :travel-authorization-id="travelAuthorizationId"
      class="mb-6"
    />

    <v-row>
      <v-col
        cols="12"
        md="2"
      >
        <DescriptionElement
          :value="travelAuthorization.travelDurationEstimate"
          label="Travel Days"
          vertical
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <DescriptionElement
          :value="travelAuthorization.daysOffTravelStatusEstimate || '0'"
          label="Days on non-travel status"
          vertical
        />
      </v-col>
      <v-col
        cols="12"
        md="4"
      >
        <DescriptionElement
          :value="travelAuthorization.dateBackToWorkEstimate"
          label="Expected Date return to work"
          vertical
        />
      </v-col>
    </v-row>
  </HeaderActionsCard>
</template>

<script setup lang="ts">
import { toRefs } from "vue"
import { isNil } from "lodash"

import useTravelAuthorization from "@/use/use-travel-authorization"

import DescriptionElement from "@/components/common/DescriptionElement.vue"
import HeaderActionsCard from "@/components/common/HeaderActionsCard.vue"
import TravelAuthorizationTripTypeChip from "@/components/travel-authorizations/TravelAuthorizationTripTypeChip.vue"
import TravelSegmentsSection from "@/components/travel-segments/TravelSegmentsSection.vue"

const props = defineProps<{
  travelAuthorizationId: number
}>()

const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization } = useTravelAuthorization(travelAuthorizationId)
</script>
