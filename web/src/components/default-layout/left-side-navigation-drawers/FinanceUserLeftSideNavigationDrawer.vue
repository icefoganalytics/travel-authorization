<template>
  <v-navigation-drawer
    :model-value="modelValue"
    v-bind="$attrs"
    @update:model-value="emit('update:modelValue', $event)"
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
  modelValue: boolean
}>()

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void
}>()
</script>
