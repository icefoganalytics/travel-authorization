<template>
  <HeaderActionsCard
    title="Travel Pre-Approvals"
    header-tag="h2"
    header-class="text-h4 mb-0"
  >
    <v-tabs active-class="primary--text teal lighten-5">
      <v-tab
        :to="{
          name: 'travel-pre-approvals/TravelPreApprovalRequestsPage',
        }"
      >
        Requests
      </v-tab>
      <v-tab
        :to="{
          name: 'travel-pre-approvals/TravelPreApprovalSubmissionsPage',
        }"
      >
        Submissions
      </v-tab>
    </v-tabs>

    <router-view />
  </HeaderActionsCard>
</template>

<script setup>
import useBreadcrumbs from "@/use/use-breadcrumbs"

import HeaderActionsCard from "@/components/common/HeaderActionsCard.vue"

useBreadcrumbs([
  {
    text: "Travel Pre-Approvals",
    to: {
      name: "travel-pre-approvals/TravelPreApprovalRequestsPage",
    },
  },
])
</script>
