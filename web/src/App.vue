<template>
  <v-app>
    <router-view v-if="isUnauthenticatedRoute" />
    <!--
      NOTE: current user will always be defined when the authenticated router view loads.
    -->
    <router-view v-else-if="isReady || isErrored" />
    <PageLoader
      v-else-if="isReadyAuth0 && isLoadingCurrentUser"
      message="Fetching and syncing user"
    />
    <PageLoader
      v-else-if="isLoadingAuth0"
      message="Checking authentication status ..."
    />
    <PageLoader
      v-else
      message="Initializing app ..."
    />
    <AppSnackbar />
  </v-app>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useRoute, useRouter } from "vue2-helpers/vue-router"

import { useAuth0 } from "@/plugins/auth0-plugin"
import useCurrentUser from "@/use/use-current-user"
import PageLoader from "@/components/PageLoader.vue"
import AppSnackbar from "@/components/AppSnackbar.vue"

const route = useRoute()
const isUnauthenticatedRoute = computed(() => route.meta?.requiresAuth === false)

const { isAuthenticated, isLoading: isLoadingAuth0 } = useAuth0()
const isReadyAuth0 = computed(() => !isLoadingAuth0.value && isAuthenticated.value)

const { fetch, isReady: isReadyCurrentUser, isLoading: isLoadingCurrentUser } = useCurrentUser()

const isReady = computed(() => isReadyAuth0.value && isReadyCurrentUser.value)

const isErrored = ref(false)
const router = useRouter()

watch(
  () => isReadyAuth0.value,
  async (newIsReadyAuth0) => {
    // Don't bother attempting to load current user for unathenticated routes
    if (isUnauthenticatedRoute.value) return

    if (newIsReadyAuth0 === true) {
      try {
        await router.isReady()
        await fetch()
        isErrored.value = false
      } catch (error) {
        console.error(`Error fetching current user: ${error}`, { error })
        isErrored.value = true
        await router.isReady()
        await router.push({ name: "UnauthorizedPage" })
      }
    }
  },
  { immediate: true }
)
</script>
