<template>
  <v-card>
    <v-card-title>
      <h2>Pre-Approved Travel</h2>
    </v-card-title>
    <v-card-text>
      <v-tabs active-class="primary--text teal lighten-5">
        <v-tab
          :to="{
            name: 'pre-approved-travel/PreApprovedTravelRequestsPage',
          }"
        >
          Requests
        </v-tab>
        <v-tab
          :to="{
            name: 'pre-approved-travel/PreApprovedTravelSubmissionsPage',
          }"
        >
          Submissions
        </v-tab>
      </v-tabs>

      <router-view />
    </v-card-text>
  </v-card>
</template>

<script setup></script>
