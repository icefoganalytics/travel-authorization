<template>
  <v-tooltip bottom>
    <template #activator="{ on, attrs }">
      <div class="d-flex align-start">
        <v-text-field
          :value="formatCurrency(estimatedCost)"
          label="Estimated Cost"
          dense
          disabled
          outlined
          readonly
          v-bind="attrs"
          v-on="on"
        ></v-text-field>
        <v-icon
          class="ml-1"
          small
          v-bind="attrs"
          v-on="on"
        >
          mdi-help-circle-outline
        </v-icon>
      </div>
    </template>
    <span>This is computed with data from the Estimate edit step.</span>
  </v-tooltip>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { sumBy } from "lodash"

import { formatCurrency } from "@/utils/formatters"

import { type Expense } from "@/api/expenses-api"

const props = defineProps<{
  estimates: Expense[]
}>()

const estimatedCost = computed(() => {
  return sumBy(props.estimates, "cost")
})
</script>
