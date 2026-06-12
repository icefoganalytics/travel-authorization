<template>
  <v-card
    class="mt-5"
    color="#fff2d5"
  >
    <v-card-title class="d-flex align-center">
      <h3 class="d-flex align-top">
        Awaiting Changes

        <v-icon
          class="ml-1"
          size="x-small"
        >
          mdi-help-circle-outline
        </v-icon>
        <v-tooltip
          activator="parent"
          text="Travel requests where the supervisor has sent back a pre-trip request for changes. Not yet implemented."
        />
      </h3>
    </v-card-title>
    <v-card-text>
      <v-empty-state
        icon="mdi-clock-outline"
        title="Coming Soon"
        text="Supervisor change requests on pre-trip travel authorizations are not yet implemented."
      />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts"></script>
