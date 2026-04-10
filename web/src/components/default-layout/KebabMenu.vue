<template>
  <v-menu
    bottom
    left
    class="ml-0"
  >
    <template #activator="{ props: activatorProps }">
      <v-btn
        title="System Options"
        icon="mdi-dots-vertical"
        variant="text"
        color="primary"
        v-bind="activatorProps"
      />
    </template>

    <v-list
      density="compact"
      style="min-width: 200px"
    >
      <v-list-item
        :to="{
          name: 'ProfilePage',
        }"
        prepend-icon="mdi-account"
      >
        <v-list-item-title>My profile</v-list-item-title>
      </v-list-item>
      <v-list-item
        v-if="isAdmin"
        :to="{
          name: 'AdministrationPage',
        }"
        prepend-icon="mdi-cogs"
      >
        <v-list-item-title>Administration</v-list-item-title>
      </v-list-item>

      <v-divider />
      <v-list-item
        :to="{
          name: 'HealthCheck',
        }"
        prepend-icon="mdi-clock"
      >
        <v-list-item-title>{{ RELEASE_TAG || "development" }}</v-list-item-title>
      </v-list-item>
      <v-list-item
        prepend-icon="mdi-exit-run"
        @click="signOut"
      >
        <v-list-item-title>Sign out</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup lang="ts">
import { useAuth0 } from "@auth0/auth0-vue"

import { RELEASE_TAG } from "@/config"
import useCurrentUser from "@/use/use-current-user"

const { isAdmin, reset: resetCurrentUser } = useCurrentUser()
const { logout } = useAuth0()

function signOut() {
  resetCurrentUser()

  const returnTo = encodeURI(window.location.origin + "/sign-in")
  return logout({
    logoutParams: {
      returnTo,
    },
  })
}
</script>
