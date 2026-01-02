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
      <TravelDeskListItem />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import DashboardListItem from "@/components/default-layout/list-items/DashboardListItem.vue"
import MyTravelRequestsListItem from "@/components/default-layout/list-items/MyTravelRequestsListItem.vue"
import TravelDeskListItem from "@/components/default-layout/list-items/TravelDeskListItem.vue"

defineProps<{
  value: boolean
}>()

const emit = defineEmits<{
  (event: "update", value: boolean): void
}>()
</script>
