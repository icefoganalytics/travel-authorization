<template>
  <div>
    <div class="d-flex justify-space-between align-baseline">
      <h2>Expense Processing</h2>
    </div>
    <v-row>
      <v-col>
        TODO: build expense processing page
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import useBreadcrumbs from "@/use/use-breadcrumbs"

useBreadcrumbs([
  {
    text: "Expense Processing",
    to: {
      name: "ExpenseProcessingPage",
    },
  },
])
</script>
