<template>
  <v-menu
    bottom
    left
    class="ml-0"
  >
    <template #activator="{ on, attrs }">
      <v-btn
        title="System Options"
        icon
        color="primary"
        v-bind="attrs"
        v-on="on"
      >
        <v-icon>mdi-dots-vertical</v-icon>
      </v-btn>
    </template>

    <v-list
      dense
      style="min-width: 200px"
    >
      <v-list-item to="/profile">
        <v-list-item-icon>
          <v-icon>mdi-account</v-icon>
        </v-list-item-icon>
        <v-list-item-title>My profile</v-list-item-title>
      </v-list-item>
      <v-list-item :to="{ name: 'AdministrationPage' }">
        <v-list-item-icon>
          <v-icon>mdi-cogs</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Administration</v-list-item-title>
      </v-list-item>

      <v-divider />
      <v-list-item :to="{ name: 'HealthCheck' }">
        <v-list-item-icon>
          <v-icon>mdi-clock</v-icon>
        </v-list-item-icon>
        <v-list-item-title>{{ RELEASE_TAG || "development" }}</v-list-item-title>
      </v-list-item>
      <v-list-item @click="signOut">
        <v-list-item-icon>
          <v-icon>mdi-exit-run</v-icon>
        </v-list-item-icon>
        <v-list-item-title>Sign out</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup>
import { RELEASE_TAG } from "@/config"
import { auth0 } from "@/plugins/auth0-plugin"
import useCurrentUser from "@/use/use-current-user"

const { unset: unsetCurrentUser } = useCurrentUser()

function signOut() {
  unsetCurrentUser()

  const returnTo = encodeURI(window.location.origin + "/sign-in")
  return auth0.logout({
    logoutParams: {
      returnTo,
    },
  })
}
</script>
