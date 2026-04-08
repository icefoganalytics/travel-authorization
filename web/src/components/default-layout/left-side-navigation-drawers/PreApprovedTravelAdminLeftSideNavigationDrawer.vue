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
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import DashboardListItem from "@/components/default-layout/list-items/DashboardListItem.vue"
import MyTravelRequestsListItem from "@/components/default-layout/list-items/MyTravelRequestsListItem.vue"
import TravelPreApprovalsListItem from "@/components/default-layout/list-items/TravelPreApprovalsListItem.vue"

defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (event: "update:modelValue", value: boolean): void
}>()
</script>
