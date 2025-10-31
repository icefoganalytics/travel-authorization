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
                outlined
                dense
                label="Search"
                hide-details
              ></v-text-field>
            </v-col>
            <v-col
              cols="4"
              class="d-flex"
            >
              <v-select
                v-model="selectedFilter"
                small-chips
                multiple
                :items="filterOptions"
                label="Status filter"
                dense
                outlined
                background-color="white"
                hide-details
              ></v-select>
            </v-col>
            <v-spacer></v-spacer>
            <v-col cols="auto"> </v-col>
          </v-row>

          <v-data-table
            :items="filteredData"
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

<script>
import { mapActions } from "vuex"

import http from "@/api/http-client"
import { USERS_URL } from "@/urls"
import useBreadcrumbs from "@/use/use-breadcrumbs"

export default {
  name: "UsersPage",
  components: {},
  setup() {
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
    ])

    return {}
  },
  data: () => ({
    loading: false,
    users: [],
    search: "",
    options: {},
    totalLength: 0,
    headers: [
      {
        text: "Email",
        value: "email",
      },
      {
        text: "First Name",
        value: "firstName",
      },
      {
        text: "Last Name",
        value: "lastName",
      },
      {
        text: "Status",
        value: "isActive",
      },
      //      { text: "Actions", value: "actions"}
    ],
    page: 1,
    pageCount: 0,
    iteamsPerPage: 10,
    selectedFilter: ["Active"],
    filterOptions: ["Active", "Expired", "Inactive"],
  }),
  computed: {
    filteredData() {
      if (this.selectedFilter.length == 0) return this.users

      let data = []
      for (let usr of this.users) {
        if (this.selectedFilter.indexOf("Active") >= 0) {
          if (usr.status == "active") data.push(usr)
        }
      }
      return data
    },
  },
  async mounted() {
    try {
      this.laodUsers()
    } finally {
      this.loading = false
    }
  },
  methods: {
    ...mapActions("users", ["loadUsers"]),

    goToUserEditPage(user) {
      this.$router.push({
        name: "administration/users/UserEditPage",
        params: {
          userId: user.id.toString(),
        },
      })
    },
    laodUsers() {
      http.get(USERS_URL).then((resp) => {
        this.users = resp.data
      })
    },
  },
}
</script>

<style scoped>
.hoverclicklink:hover {
  color: #0097a9;
  text-decoration: underline;
  cursor: pointer;
}
</style>
