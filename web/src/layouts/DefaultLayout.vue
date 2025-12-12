<template>
  <v-app>
    <LeftSidebarNavigationDrawer
      v-model="showLeftSidebarNav"
      style="margin-top: 70px"
      app
    />

    <v-app-bar
      app
      color="#fff"
      flat
      height="70"
      style="left: 0; border-bottom: 3px #f3b228 solid"
    >
      <v-app-bar-nav-icon
        title="Show Navigation"
        @click="toggleDrawer"
      ></v-app-bar-nav-icon>
      <v-btn
        :to="{ name: 'DashboardPage' }"
        class="pa-0 no-change-on-hover"
        height="44"
        style="margin-top: -8px"
        text
      >
        <img
          src="/yukon.svg"
          height="44"
        />
      </v-btn>
      <v-toolbar-title class="ml-16 d-none d-md-block">
        <h1 class="text-h6 font-weight-bold mb-0">{{ APPLICATION_NAME }}</h1>
      </v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn
        icon
        color="primary"
        class="mr-2"
        title="Recently visited"
        @click="showHistory"
      >
        <v-icon>mdi-history</v-icon>
      </v-btn>

      <v-btn
        text
        :to="{
          name: 'ProfilePage',
        }"
      >
        {{ fullName }}
      </v-btn>

      <KebabMenu />
    </v-app-bar>

    <v-main>
      <!-- Provides the application the proper gutter -->
      <v-container
        fluid
        class="h-full"
      >
        <UnsetDepartmentAlert />
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { APPLICATION_NAME } from "@/config"

import useSessionStorage from "@/use/utils/use-session-storage"
import useDisplayVuetify2 from "@/use/utils/use-display-vuetify2"
import useCurrentUser from "@/use/use-current-user"

import KebabMenu from "@/components/default-layout/KebabMenu.vue"
import UnsetDepartmentAlert from "@/components/default-layout/UnsetDepartmentAlert.vue"
import LeftSidebarNavigationDrawer from "@/components/default-layout/LeftSidebarNavigationDrawer.vue"

const { fullName } = useCurrentUser()

const { lgAndUp } = useDisplayVuetify2()

const showLeftSidebarNav = useSessionStorage("showLeftSidebarNav", lgAndUp.value)

function toggleDrawer() {
  showLeftSidebarNav.value = !showLeftSidebarNav.value
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
