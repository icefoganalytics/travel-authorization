<template>
  <v-layout>
    <LeftSidebarNavigationDrawer ref="leftSidebarNavigationDrawerRef" />

    <v-app-bar
      app
      color="#fff"
      elevation="0"
      height="70"
      style="border-bottom: 3px #f3b228 solid"
    >
      <v-app-bar-nav-icon
        title="Show Navigation"
        @click="toggleDrawer"
      />
      <v-btn
        :to="{ name: 'DashboardPage' }"
        class="pa-0 no-change-on-hover"
        height="44"
        style="margin-top: -8px"
        variant="text"
      >
        <img
          src="/yukon.svg"
          height="44"
        />
      </v-btn>
      <v-toolbar-title class="ml-16 d-none d-md-block">
        <h1 class="text-h6 font-weight-bold mb-0">{{ APPLICATION_NAME }}</h1>
      </v-toolbar-title>

      <v-spacer />

      <v-btn
        icon="mdi-history"
        variant="text"
        color="primary"
        class="mr-2"
        title="Recently visited"
        @click="showHistory"
      />

      <v-btn
        variant="text"
        :to="{
          name: 'ProfilePage',
        }"
      >
        {{ fullName }}
      </v-btn>

      <KebabMenu />
    </v-app-bar>

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
import { useDisplay } from "vuetify"

import { APPLICATION_NAME } from "@/config"

import useCurrentUser from "@/use/use-current-user"

import KebabMenu from "@/components/default-layout/KebabMenu.vue"
import UnsetDepartmentAlert from "@/components/default-layout/UnsetDepartmentAlert.vue"
import LeftSidebarNavigationDrawer from "@/components/default-layout/LeftSidebarNavigationDrawer.vue"

const { fullName } = useCurrentUser()

useDisplay()

const leftSidebarNavigationDrawerRef = useTemplateRef("leftSidebarNavigationDrawerRef")

function toggleDrawer() {
  leftSidebarNavigationDrawerRef.value?.toggle()
}

function showHistory() {
  alert("TODO: implement history")
}
</script>

<style scoped>
.h-full {
  height: 100%;
}

.no-change-on-hover {
  background-color: transparent !important;
  color: white !important;
}

.no-change-on-hover:hover {
  background-color: transparent !important;
  color: white !important;
}
</style>
