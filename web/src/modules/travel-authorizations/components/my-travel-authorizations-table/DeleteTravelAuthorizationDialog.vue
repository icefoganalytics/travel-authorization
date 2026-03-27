<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
  >
    <v-card>
      <v-card-title class="text-h5">
        Are you sure you want to delete the following travel authorization request?
      </v-card-title>
      <v-card-text>
        <div v-if="hasTravelAuthorization">
          <v-row no-gutters>
            <v-col class="text-center">
              {{ formatPhase(travelAuthorization.phase) }}
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col class="text-center">
              {{ formatLocation(travelAuthorization.finalDestination) }}
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col class="text-center">
              {{ formatDate(travelAuthorization.departingAt) }}
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col class="text-center">
              {{ formatDate(travelAuthorization.returningAt) }}
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col class="text-center">
              {{ formatStatus(travelAuthorization.status) }}
            </v-col>
          </v-row>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="secondary"
          :loading="loading"
          @click="close"
          >Cancel</v-btn
        >
        <v-btn
          color="error"
          :loading="loading"
          @click="deleteAndClose"
          >OK</v-btn
        >
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { isEmpty, isNil } from "lodash"
import { DateTime } from "luxon"

import travelAuthorizations from "@/api/travel-authorizations-api"

import useSnack from "@/use/use-snack"

export default {
  name: "DeleteTravelAuthorizationDialog",
  setup() {
    const snack = useSnack()

    return {
      snack,
    }
  },
  data: () => ({
    travelAuthorization: {},
    showDialog: false,
    loading: false,
  }),
  computed: {
    travelAuthorizationId() {
      return this.travelAuthorization.id
    },
    hasTravelAuthorization() {
      return !isEmpty(this.travelAuthorization)
    },
  },
  watch: {
    showDialog(value) {
      if (value) {
        if (this.$route.query.showDelete === this.travelAuthorization.id.toString()) return

        this.$router.push({ query: { showDelete: this.travelAuthorization.id } })
      } else {
        this.$router.push({ query: { showDelete: undefined } })
      }
    },
  },
  methods: {
    show(travelAuthorization) {
      this.travelAuthorization = travelAuthorization
      this.showDialog = true
    },
    close() {
      this.showDialog = false
    },
    deleteAndClose() {
      this.loading = true
      return travelAuthorizations
        .delete(this.travelAuthorizationId)
        .then(() => {
          this.$emit("deleted")
          this.close()
        })
        .catch((error) => {
          console.error(`Failed to delete travel authorization: ${error}`, { error })
          this.snack.error(`Failed to delete travel authorization: ${error}`)
        })
        .finally(() => {
          this.loading = false
        })
    },
    formatDate(value) {
      if (isNil(value)) return "Unknown"

      const date = DateTime.fromISO(value, { zone: "utc" })
      return date.toFormat("dd-LLL-yyyy")
    },
    formatLocation(value) {
      if (isNil(value) || isNil(value.city)) return "Unknown"

      return value.city
    },
    formatStatus(value) {
      return this.$t(`global.status.${value}`, { $default: "Unknown" })
    },
    formatPhase(value) {
      return this.$t(`global.phase.${value}`, { $default: "Unknown" })
    },
  },
}
</script>
