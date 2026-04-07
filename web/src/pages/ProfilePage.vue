<template>
  <div>
    <h1 class="d-flex justify-space-between">
      My Profile

      <v-btn
        title="Sync profile with external directory"
        color="primary"
        @click="ygGovernmentDirectorySync"
      >
        <v-icon left>mdi-cached</v-icon> Sync
      </v-btn>
    </h1>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <DescriptionElement
          label="First name"
          :value="currentUser.firstName"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <DescriptionElement
          label="Last name"
          :value="currentUser.lastName"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="6"
        class="d-flex align-center"
      >
        <DescriptionElement
          label="Email"
          :value="currentUser.email"
        />
        <v-btn
          class="ml-2 my-0"
          title="Copy email to clipboard"
          icon
          small
          @click="copyToClipboard(currentUser.email, 'Email copied to clipboard')"
        >
          <v-icon>mdi-content-copy</v-icon>
        </v-btn>
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <DescriptionElement
          label="Status"
          :value="formatStatus(currentUser.status)"
        />
      </v-col>
    </v-row>

    <v-divider class="my-6"></v-divider>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <DescriptionElement
          label="Manager"
          :value="currentUser.manager"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <DescriptionElement
          label="Mail code"
          :value="currentUser.mailcode"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <DescriptionElement
          label="Department"
          :value="currentUser.department"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <DescriptionElement
          label="Division"
          :value="currentUser.division"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <DescriptionElement
          label="Branch"
          :value="currentUser.branch"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <DescriptionElement
          label="Unit"
          :value="currentUser.unit"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <h2>Roles</h2>

        <v-chip
          v-for="(role, index) in currentUser.roles"
          :key="index"
          class="ma-2"
          color="info"
        >
          {{ formatRole(role) }}
        </v-chip>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n"

import usersApi from "@/api/users-api"
import useBreadcrumbs from "@/use/use-breadcrumbs"
import useCurrentUser from "@/use/use-current-user"
import useSnack from "@/use/use-snack"

import DescriptionElement from "@/components/common/DescriptionElement.vue"

const { currentUser, isLoading } = useCurrentUser()

const { t } = useI18n()
const snack = useSnack()

async function ygGovernmentDirectorySync() {
  isLoading.value = true
  try {
    await usersApi.ygGovernmentDirectorySync(currentUser.value.id)
    snack.success("Current user synced with the YG government directory.")
  } catch (error) {
    console.error(`Failed to sync current user with the YG government directory: ${error}`)
    snack.error("Failed to sync current user with the YG government directory.")
  } finally {
    isLoading.value = false
  }
}

function formatRole(value) {
  return t(`role.name.${value}`, value)
}

function formatStatus(value) {
  return t(`global.status.${value}`, value)
}

async function copyToClipboard(text, message = "Copied to clipboard") {
  try {
    await navigator.clipboard.writeText(text)
    snack.success(message)
  } catch (error) {
    console.error(`Failed to copy to clipboard: ${error}`)
    snack.error(`Failed to copy to clipboard: ${error}`)
  }
}

useBreadcrumbs([
  {
    title: "Profile",
    to: {
      name: "ProfilePage",
    },
  },
])
</script>
