<template>
  <div>
    <FullScreenLoadingOverlay :value="isLoading" />

    <h1 class="d-flex justify-space-between">
      My Profile

      <v-btn
        title="Sync profile with external directory"
        color="primary"
        small
        icon
        @click="ygGovernmentDirectorySync"
      >
        <v-icon>mdi-cached</v-icon>
      </v-btn>
    </h1>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          :value="attributes.firstName"
          label="First name"
          dense
          hide-details
          outlined
          readonly
        ></v-text-field>
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          :value="attributes.lastName"
          label="Last name"
          dense
          hide-details
          outlined
          readonly
        ></v-text-field>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          :value="attributes.email"
          label="Email"
          dense
          hide-details
          outlined
          readonly
        ></v-text-field>
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          :value="formatStatus(attributes.status)"
          label="Status"
          dense
          hide-details
          outlined
          readonly
        ></v-text-field>
      </v-col>
    </v-row>

    <v-divider class="my-6"></v-divider>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          :value="attributes.manager"
          label="Manager"
          dense
          hide-details
          outlined
          readonly
        ></v-text-field>
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          :value="attributes.mailcode"
          label="Mail code"
          dense
          hide-details
          outlined
          readonly
        ></v-text-field>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          :value="attributes.department"
          label="Department"
          dense
          hide-details
          outlined
          readonly
        ></v-text-field>
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          :value="attributes.division"
          label="Division"
          dense
          hide-details
          outlined
          readonly
        ></v-text-field>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          :value="attributes.branch"
          label="Branch"
          dense
          hide-details
          outlined
          readonly
        ></v-text-field>
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <v-text-field
          :value="attributes.unit"
          label="Unit"
          dense
          hide-details
          outlined
          readonly
        ></v-text-field>
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <h2>Roles</h2>

        <v-chip
          v-for="(role, index) in attributes.roles"
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

<script>
import { mapGetters, mapActions } from "vuex"

import FullScreenLoadingOverlay from "@/components/FullScreenLoadingOverlay"

export default {
  name: "UserProfilePage",
  components: {
    FullScreenLoadingOverlay,
  },
  data: () => ({}),
  computed: {
    ...mapGetters("current/user", ["attributes", "isLoading"]),
  },
  async mounted() {
    await this.ensure()
  },
  methods: {
    ...mapActions("current/user", ["ensure", "ygGovernmentDirectorySync"]),
    formatRole(value) {
      return this.$t(`role.name.${value}`, { $default: value })
    },
    formatStatus(value) {
      return this.$t(`global.status.${value}`, { $default: value })
    },
  },
}
</script>
