<template>
  <div>
    <div class="d-flex justify-space-between align-baseline">
      <h2>Manage Travel Requests</h2>
      <CreateTravelAuthorizationDialogButton />
    </div>
    <v-row>
      <v-col>
        <PendingApprovalsCard />
      </v-col>
      <v-col>
        <AwaitingChangesCard />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <AwaitingExpenseApprovalCard />
      </v-col>
      <v-col>
        <ApprovedTripsCard />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import useBreadcrumbs from "@/use/use-breadcrumbs"

import ApprovedTripsCard from "@/components/travel-authorizations/manage/ApprovedTripsCard.vue"
import AwaitingChangesCard from "@/components/travel-authorizations/manage/AwaitingChangesCard.vue"
import AwaitingExpenseApprovalCard from "@/components/travel-authorizations/manage/AwaitingExpenseApprovalCard.vue"
import CreateTravelAuthorizationDialogButton from "@/components/travel-authorizations/manage/CreateTravelAuthorizationDialogButton.vue"
import PendingApprovalsCard from "@/components/travel-authorizations/manage/PendingApprovalsCard.vue"

useBreadcrumbs([
  {
    title: "Manage Travel Requests",
    to: {
      name: "ManageTravelRequests",
    },
  },
])
</script>
