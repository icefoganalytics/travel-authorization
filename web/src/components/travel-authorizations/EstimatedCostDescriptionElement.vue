<template>
  <DescriptionElement
    ref="descriptionElement"
    label="Estimated Cost"
    v-bind="$attrs"
  >
    <span class="d-flex">
      {{ formatCurrency(estimatedCost) }}
      <v-icon
        right
        small
      >
        mdi-help-circle-outline
      </v-icon>
    </span>

    <v-tooltip
      bottom
      :activator="descriptionElement?.$el"
    >
      <span>This is computed with data from expense estimates.</span>
    </v-tooltip>
  </DescriptionElement>
</template>

<script setup>
import { computed, ref } from "vue"
import { sumBy } from "lodash"

import { formatCurrency } from "@/utils/formatters"
import { MAX_PER_PAGE } from "@/api/base-api"
import useExpenses, { TYPES } from "@/use/use-expenses"

import DescriptionElement from "@/components/common/DescriptionElement.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const expensesQuery = computed(() => ({
  where: {
    travelAuthorizationId: props.travelAuthorizationId,
    type: TYPES.ESTIMATE,
  },
  perPage: MAX_PER_PAGE,
}))
const { expenses: estimates } = useExpenses(expensesQuery)

const estimatedCost = computed(() => sumBy(estimates.value, "cost"))

/** @type {import('vue').Ref<InstanceType<typeof DescriptionElement> | null>} */
const descriptionElement = ref(null)
</script>
