<template>
  <v-navigation-drawer
    :value="value"
    v-bind="$attrs"
    v-on="$listeners"
    @input="emit('update', $event)"
  >
    <v-list>
      <DashboardListItem />
      <MyTravelRequestsListItem />
      <ExpenseProcessingListItem />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import DashboardListItem from "@/components/default-layout/list-items/DashboardListItem.vue"
import ExpenseProcessingListItem from "@/components/default-layout/list-items/ExpenseProcessingListItem.vue"
import MyTravelRequestsListItem from "@/components/default-layout/list-items/MyTravelRequestsListItem.vue"

defineProps<{
  value: boolean
}>()

const emit = defineEmits<{
  (event: "update", value: boolean): void
}>()
</script>
