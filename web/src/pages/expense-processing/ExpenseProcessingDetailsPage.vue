<template>
  <div>
    <v-row>
      <v-col>
        <PurposeCard :travel-authorization-id="travelAuthorizationIdAsNumber" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <DetailsCard :travel-authorization-id="travelAuthorizationIdAsNumber" />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <ApprovalsCard :travel-authorization-id="travelAuthorizationIdAsNumber" />
      </v-col>
    </v-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"

import useBreadcrumbs from "@/use/use-breadcrumbs"

import PurposeCard from "@/components/travel-authorizations/PurposeCard.vue"
import DetailsCard from "@/components/travel-authorizations/DetailsCard.vue"
import ApprovalsCard from "@/components/travel-authorizations/ApprovalsCard.vue"

const props = defineProps<{
  travelAuthorizationId: string
}>()

const travelAuthorizationIdAsNumber = computed(() => parseInt(props.travelAuthorizationId))

useBreadcrumbs([
  {
    title: "Expense Processing",
    to: {
      name: "ExpenseProcessingPage",
    },
  },
  {
    title: "Details",
  },
])
</script>
