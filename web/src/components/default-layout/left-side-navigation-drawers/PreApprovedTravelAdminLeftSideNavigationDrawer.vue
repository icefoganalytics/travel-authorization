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
      <TravelPreApprovalsListItem />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import DashboardListItem from "@/components/default-layout/list-items/DashboardListItem.vue"
import MyTravelRequestsListItem from "@/components/default-layout/list-items/MyTravelRequestsListItem.vue"
import TravelPreApprovalsListItem from "@/components/default-layout/list-items/TravelPreApprovalsListItem.vue"

defineProps<{
  value: boolean
}>()

const emit = defineEmits<{
  (event: "update", value: boolean): void
}>()
</script>
