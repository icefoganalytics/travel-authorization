<template>
  <HeaderActionsCard title="Approvals">
    <template #header-actions><slot name="header-actions"></slot></template>

    <v-row>
      <v-col
        cols="12"
        md="3"
      >
        <!-- TODO: add tooltip with link to estimate tab explaining where this data comes from -->
        <EstimatedCostDescriptionElement
          label="Estimated Cost"
          :travel-authorization-id="travelAuthorizationId"
          vertical
        />
      </v-col>
      <v-col
        cols="12"
        md="3"
      >
        <DescriptionElement
          label="Travel Advance"
          :value="formattedTravelAdvanceInDollars"
          vertical
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <DescriptionElement
          label="Pre-approved travel for (if applicable)"
          vertical
        >
          <v-progress-circular
            v-if="isLoading"
            size="20"
            width="2"
            indeterminate
          />
          <TravelAuthorizationPreApprovalProfileChip
            v-else-if="travelAuthorizationPreApprovalProfileId"
            :travel-authorization-pre-approval-profile-id="travelAuthorizationPreApprovalProfileId"
          />
          <span v-else>None supplied</span>
        </DescriptionElement>
      </v-col>
    </v-row>
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <DescriptionElement
          label="Submitted to"
          :value="travelAuthorization.supervisorEmail"
          vertical
        />
      </v-col>
    </v-row>
  </HeaderActionsCard>
</template>

<script setup>
import { computed, toRefs } from "vue"

import { formatCurrency } from "@/utils/formatters"

import useTravelAuthorization from "@/use/use-travel-authorization"

import DescriptionElement from "@/components/common/DescriptionElement.vue"
import HeaderActionsCard from "@/components/common/HeaderActionsCard.vue"
import EstimatedCostDescriptionElement from "@/components/travel-authorizations/EstimatedCostDescriptionElement.vue"
import TravelAuthorizationPreApprovalProfileChip from "@/components/travel-authorization-pre-approval-profiles/TravelAuthorizationPreApprovalProfileChip.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization, isLoading } = useTravelAuthorization(travelAuthorizationId)

const travelAuthorizationPreApprovalProfileId = computed(() => {
  return travelAuthorization.value?.preApprovalProfileId
})

const travelAdvanceInDollars = computed(() =>
  Math.ceil(travelAuthorization.value.travelAdvanceInCents / 100.0)
)
const formattedTravelAdvanceInDollars = computed(() => formatCurrency(travelAdvanceInDollars.value))
</script>
