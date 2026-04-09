<template>
  <v-container v-if="!isNil(user)">
    <h2>
      User Editor:
      <small
        >{{ user.firstName }}
        {{ user.lastName }}

        <small>({{ user.status }})</small>
      </small>
    </h2>

    <v-row>
      <v-col
        cols="12"
        md="12"
      >
        <v-card
          class="default"
          :loading="isLoading"
        >
          <v-card-title>User Details</v-card-title>
          <v-card-text>
            <v-form>
              <v-row>
                <v-col
                  cols="12"
                  sm="6"
                >
                  <v-text-field
                    v-model="user.firstName"
                    label="First name"
                    class="bg-white"
                    density="compact"
                    variant="outlined"
                    required
                    hide-details
                  ></v-text-field>
                </v-col>
                <v-col
                  cols="12"
                  sm="6"
                >
                  <v-text-field
                    v-model="user.lastName"
                    label="Last name"
                    class="bg-white"
                    density="compact"
                    variant="outlined"
                    required
                    hide-details
                  ></v-text-field>
                </v-col>
                <v-col
                  cols="12"
                  md="8"
                >
                  <v-text-field
                    v-model="user.email"
                    label="Email"
                    class="bg-white"
                    density="compact"
                    variant="outlined"
                    required
                    hide-details
                  />
                </v-col>
                <v-col
                  cols="12"
                  md="4"
                >
                  <v-text-field
                    v-model="user.mailcode"
                    label="Mailcode"
                    class="bg-white"
                    density="compact"
                    variant="outlined"
                    required
                    hide-details
                  />
                </v-col>
                <v-col cols="12">
                  <DepartmentAutocomplete
                    v-model="user.department"
                    label="Department *"
                    :rules="[required]"
                    class="bg-white"
                    variant="outlined"
                    density="compact"
                    chips
                    :clearable="false"
                  />
                </v-col>
                <v-col cols="12">
                  <v-select
                    v-model="user.roles"
                    label="Roles"
                    :items="roles"
                    class="bg-white"
                    variant="outlined"
                    density="compact"
                    multiple
                    chips
                    clearable
                    hide-details
                  />
                </v-col>
              </v-row>
            </v-form>
            <v-row class="mt-5">
              <v-col
                cols="12"
                class="d-flex py-0"
              >
                <v-spacer></v-spacer>
                <v-btn
                  color="primary"
                  class="mr-5 mt-0"
                  @click="saveWrapper"
                >
                  Save user
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
  <PageLoader v-else />
</template>

<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { isNil } from "lodash"

import { required } from "@/utils/validators"

import { UserRoles } from "@/api/users-api"

import useSnack from "@/use/use-snack"
import useBreadcrumbs from "@/use/use-breadcrumbs"
import useCurrentUser from "@/use/use-current-user"
import useUser from "@/use/use-user"

import PageLoader from "@/components/PageLoader.vue"
import DepartmentAutocomplete from "@/components/yg-employee-groups/DepartmentAutocomplete.vue"

const props = defineProps<{
  userId: string
}>()

const userIdAsNumber = computed(() => Number(props.userId))
const { user, isLoading, save } = useUser(userIdAsNumber)

const { t } = useI18n()
const roles = Object.values(UserRoles).map((role) => ({
  value: role,
  title: t(`role.name.${role}`, role),
}))

const { currentUser, refresh: refreshCurrentUser } = useCurrentUser<true>()
const snack = useSnack()

async function saveWrapper() {
  try {
    await save()
    snack.success("User saved successfully!")

    if (props.userId === currentUser.value.id.toString()) {
      await refreshCurrentUser()
      snack.info("Page refreshed because current user was edited.")
    }
  } catch (error) {
    console.error(`Failed to save user: ${error}`, { error })
    snack.error(`Failed to save user: ${error}`)
  }
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
  {
    title: "User Editor",
    to: {
      name: "administration/users/UserEditPage",
      params: {
        userId: props.userId,
      },
    },
  },
])
useBreadcrumbs(breadcrumbs)
</script>
