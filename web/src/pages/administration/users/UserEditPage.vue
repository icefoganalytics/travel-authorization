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
                    dense
                    outlined
                    background-color="white"
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
                    dense
                    outlined
                    background-color="white"
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
                    dense
                    outlined
                    background-color="white"
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
                    dense
                    outlined
                    background-color="white"
                    required
                    hide-details
                  />
                </v-col>
                <v-col cols="12">
                  <DepartmentAutocomplete
                    v-model="user.department"
                    label="Department *"
                    :rules="[required]"
                    outlined
                    dense
                    small-chips
                    :clearable="false"
                    background-color="white"
                  />
                </v-col>
                <v-col cols="12">
                  <v-select
                    v-model="user.roles"
                    label="Roles"
                    :items="roles"
                    outlined
                    dense
                    multiple
                    small-chips
                    background-color="white"
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
import { isNil } from "lodash"

import { useI18n } from "@/plugins/vue-i18n-plugin"
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
  text: t(`role.name.${role}`, { $default: role }),
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
    text: "Administration",
    to: {
      name: "AdministrationPage",
    },
  },
  {
    text: "User Management",
    to: {
      name: "administration/UsersPage",
    },
  },
  {
    text: "User Editor",
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
