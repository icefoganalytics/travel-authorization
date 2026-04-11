<template>
  <v-layout>
    <DefaultLayoutAppBar @toggle-drawer="toggleDrawer" />

    <LeftSidebarNavigationDrawer ref="leftSidebarNavigationDrawerRef" />

    <v-main class="grey lighten-4">
      <!-- Provides the application the proper gutter -->
      <v-container
        fluid
        class="h-full"
      >
        <UnsetDepartmentAlert />
        <router-view />
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue"

import DefaultLayoutAppBar from "@/components/default-layout/DefaultLayoutAppBar.vue"
import UnsetDepartmentAlert from "@/components/default-layout/UnsetDepartmentAlert.vue"
import LeftSidebarNavigationDrawer from "@/components/default-layout/LeftSidebarNavigationDrawer.vue"

const leftSidebarNavigationDrawerRef = useTemplateRef("leftSidebarNavigationDrawerRef")

function toggleDrawer() {
  leftSidebarNavigationDrawerRef.value?.toggle()
}
</script>
