<template>
  <div>
    <h1>User Management</h1>
    <div class="mt-2">
      <v-card class="default px-3 py-3">
        <v-card-text>
          <v-row>
            <v-col
              cols="8"
              class="d-flex"
            >
              <v-text-field
                v-model="search"
                prepend-inner-icon="mdi-magnify"
                background-color="white"
                variant="outlined"
                density="compact"
                label="Search"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col
              cols="4"
              class="d-flex"
            >
              <v-select
                v-model="selectedStatuses"
                chips
                multiple
                :items="statusFilterOptions"
                label="Status filter"
                density="compact"
                variant="outlined"
                background-color="white"
                hide-details
              ></v-select>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="auto"> </v-col>
          </v-row>

          <v-data-table
            :items="filteredUsers"
            :headers="headers"
            :loading="loading"
            :search="search"
            :footer-props="{
              'items-per-page-options': [10, 30, 100],
            }"
            class="clickable-row"
            @click:row="goToUserEditPage"
          >
          </v-data-table
        ></v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { useRouter } from "vue-router"

import { type User } from "@/api/users-api"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useUsers from "@/use/use-users"

const search = ref("")
const headers = [
  {
    title: "Email",
    key: "email",
  },
  {
    title: "First Name",
    key: "firstName",
  },
  {
    title: "Last Name",
    key: "lastName",
  },
  {
    title: "Status",
    key: "isActive",
  },
]
const selectedStatuses = ref(["Active"])
const statusFilterOptions = ["Active", "Expired", "Inactive"]

const { users, isLoading: loading } = useUsers()
const filteredUsers = computed(() => {
  if (selectedStatuses.value.length === 0) {
    return users.value
  }

  // TODO: Move search and status filtering to backend query filters if this page
  // is revisited for product work beyond the Vue 3 migration scope.
  const data: User[] = []
  for (const user of users.value) {
    if (selectedStatuses.value.indexOf("Active") >= 0) {
      if (user.status === "active") {
        data.push(user)
      }
    }
  }

  return data
})

const router = useRouter()

type UserTableRow = {
  item: User
}

function goToUserEditPage(_event: unknown, { item: user }: UserTableRow) {
  router.push({
    name: "administration/users/UserEditPage",
    params: {
      userId: user.id.toString(),
    },
  })
}

const breadcrumbs = computed(() => [
  {
    title: "Administration",
    to: {
      name: "AdministrationPage",
    },
  },
  {
    title: "User Management",
    to: {
      name: "administration/UsersPage",
    },
  },
])

useBreadcrumbs(breadcrumbs)
</script>

<style scoped>
.hoverclicklink:hover {
  color: #0097a9;
  text-decoration: underline;
  cursor: pointer;
}
</style>
