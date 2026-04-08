<template>
  <v-navigation-drawer
    :model-value="modelValue"
    v-bind="$attrs"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <v-list>
      <DashboardListItem />
      <MyTravelRequestsListItem />
      <TravelPreApprovalsListItem />
      <TravelDeskListItem />
      <TravelRequestsListItem />
      <FlightExpensesListItem />
      <ReportsListItem />
      <ManageTravelRequestsListItem />
      <ExpenseProcessingListItem />
      <QaScenariosListItem />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import DashboardListItem from "@/components/default-layout/list-items/DashboardListItem.vue"
import ExpenseProcessingListItem from "@/components/default-layout/list-items/ExpenseProcessingListItem.vue"
import FlightExpensesListItem from "@/components/default-layout/list-items/FlightExpensesListItem.vue"
import ManageTravelRequestsListItem from "@/components/default-layout/list-items/ManageTravelRequestsListItem.vue"
import MyTravelRequestsListItem from "@/components/default-layout/list-items/MyTravelRequestsListItem.vue"
import QaScenariosListItem from "@/components/default-layout/list-items/QaScenariosListItem.vue"
import ReportsListItem from "@/components/default-layout/list-items/ReportsListItem.vue"
import TravelDeskListItem from "@/components/default-layout/list-items/TravelDeskListItem.vue"
import TravelPreApprovalsListItem from "@/components/default-layout/list-items/TravelPreApprovalsListItem.vue"
import TravelRequestsListItem from "@/components/default-layout/list-items/TravelRequestsListItem.vue"

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void
}>()
</script>
