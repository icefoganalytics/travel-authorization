<template>
  <v-card>
    <v-card-title>
      <h2>Travel Pre-Approvals</h2>
    </v-card-title>
    <v-card-text>
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
    </v-card-text>
  </v-card>
</template>

<script setup>
import useBreadcrumbs from "@/use/use-breadcrumbs"

useBreadcrumbs([
  {
    text: "Travel Pre-Approvals",
    to: {
      name: "travel-pre-approvals/TravelPreApprovalRequestsPage",
    },
  },
])
</script>
