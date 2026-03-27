<template>
  <v-btn
    class="ma-0"
    color="secondary"
    @click.stop="addExpense"
  >
    Add Expense
  </v-btn>
</template>

<script setup lang="ts">
const props = defineProps<{
  travelAuthorizationId: number
}>()

function addExpense() {
  alert(`TODO: add expense for travel authorization ${props.travelAuthorizationId}`)
}
</script>
