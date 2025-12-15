<template>
  <component
    :is="RoleSpecificNavigationDrawerComponent"
    :value="value"
    v-bind="$attrs"
    v-on="$listeners"
    @update="emit('update', $event)"
  />
</template>

<script setup lang="ts">
import { computed } from "vue"

import useCurrentUser from "@/use/use-current-user"

import AdminLeftSideNavigationDrawer from "@/components/default-layout/left-side-navigation-drawers/AdminLeftSideNavigationDrawer.vue"
import FinanceUserLeftSideNavigationDrawer from "@/components/default-layout/left-side-navigation-drawers/FinanceUserLeftSideNavigationDrawer.vue"
import PreApprovedTravelAdminLeftSideNavigationDrawer from "@/components/default-layout/left-side-navigation-drawers/PreApprovedTravelAdminLeftSideNavigationDrawer.vue"
import TravelDeskUserLeftSideNavigationDrawer from "@/components/default-layout/left-side-navigation-drawers/TravelDeskUserLeftSideNavigationDrawer.vue"
import UserLeftSideNavigationDrawer from "@/components/default-layout/left-side-navigation-drawers/UserLeftSideNavigationDrawer.vue"

defineProps<{
  value: boolean
}>()

const emit = defineEmits<{
  (event: "update", value: boolean): void
}>()

const { isAdmin, isDepartmentAdmin, isFinanceUser, isPreApprovedTravelAdmin, isTravelDeskUser } =
  useCurrentUser()

const RoleSpecificNavigationDrawerComponent = computed(() => {
  if (isAdmin.value || isDepartmentAdmin.value) {
    return AdminLeftSideNavigationDrawer
  } else if (isFinanceUser.value) {
    return FinanceUserLeftSideNavigationDrawer
  } else if (isPreApprovedTravelAdmin.value) {
    return PreApprovedTravelAdminLeftSideNavigationDrawer
  } else if (isTravelDeskUser.value) {
    return TravelDeskUserLeftSideNavigationDrawer
  } else {
    return UserLeftSideNavigationDrawer
  }
})
</script>
