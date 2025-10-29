<template>
  <div>
    <h1>
      User Editor:
      <small
        >{{ user.firstName }}
        {{ user.lastName }}

        <small>({{ user.status }})</small>
      </small>
    </h1>

    <v-row>
      <v-col
        cols="12"
        md="12"
      >
        <v-alert
          v-if="alertMsg"
          :color="alertType + ' accent-4'"
          dense
          dark
          dismissible
          >{{ alertMsg }}</v-alert
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
                <v-col cols="12">
                  <v-text-field
                    v-model="user.email"
                    label="Email"
                    dense
                    outlined
                    background-color="white"
                    required
                    hide-details
                  ></v-text-field>
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
                    @change="alertMsg = ''"
                  ></v-select>
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
                  @click="saveUser"
                >
                  Save user
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { pick } from "lodash"

import { useI18n } from "@/plugins/vue-i18n-plugin"
import { required } from "@/utils/validators"

import { USERS_URL } from "@/urls"
import http from "@/api/http-client"
import { USER_ROLES } from "@/api/users-api"

import useSnack from "@/use/use-snack"
import useBreadcrumbs from "@/use/use-breadcrumbs"
import useCurrentUser from "@/use/use-current-user"

import DepartmentAutocomplete from "@/components/yg-employee-groups/DepartmentAutocomplete.vue"

export default {
  name: "UserEditPage",
  components: {
    DepartmentAutocomplete,
  },
  props: {
    userId: {
      type: [String, Number],
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n()
    const roles = Object.values(USER_ROLES).map((role) => ({
      value: role,
      text: t(`role.name.${role}`, { $default: role }),
    }))

    useBreadcrumbs([
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
          params: { userId: props.userId },
        },
      },
    ])

    const { currentUser, refresh: refreshCurrentUser } = useCurrentUser()

    const snack = useSnack()

    return {
      currentUser,
      roles,
      snack,
      refreshCurrentUser,
    }
  },
  data: () => ({
    user: {
      firstName: "",
      lastName: "",
      email: "",
      roles: [],
    },
    alertMsg: "",
    alertType: "",
    isLoading: true,
    required,
  }),
  async mounted() {
    try {
      await this.loadUser(this.userId)
    } finally {
      this.isLoading = false
    }
  },

  methods: {
    async saveUser() {
      this.alertMsg = ""
      this.alertType = "red"
      const userAttributes = pick(this.user, ["firstName", "lastName", "department", "roles"])
      await http
        .put(`${USERS_URL}/${this.userId}/permissions`, userAttributes)
        .then(() => {
          this.alertMsg = "User Saved Successfully."
          this.alertType = "teal"
        })
        .catch((e) => (this.alertMsg = e.response.data))

      if (this.userId.toString() === this.currentUser.id.toString()) {
        await this.refreshCurrentUser()
        this.snack("Page refreshed because current user was edited.", {
          color: "info",
        })
      }
    },
    async loadUser(id) {
      await http.get(`${USERS_URL}/${id}`).then((resp) => {
        this.user = resp.data
      })
    },
  },
}
</script>
