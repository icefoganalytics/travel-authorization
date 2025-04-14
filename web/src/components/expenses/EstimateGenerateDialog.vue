<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
  >
    <template #activator="{ on, attrs }">
      <v-btn
        dark
        :class="buttonClasses"
        :color="buttonColor"
        v-bind="attrs"
        v-on="on"
      >
        Generate Estimates
      </v-btn>
    </template>
    <v-form @submit.prevent="createAndClose">
      <v-card :loading="loading">
        <v-card-title class="text-h5"> Generate Estimates? </v-card-title>

        <v-card-text>
          <p>
            By proceeding, initial cost estimates will be pre-populated for this travel request.
            You'll have the opportunity to review and modify them afterward.
          </p>
          <p>
            <em>This might take a some time...</em>
          </p>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            :loading="loading"
            color="error"
            @click="close"
          >
            Cancel
          </v-btn>
          <v-btn
            :loading="loading"
            color="primary"
            type="submit"
          >
            Generate
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import { required } from "@/utils/validators"

import generateApi from "@/api/travel-authorizations/estimates/generate-api"

export default {
  name: "EstimateGenerateDialog",
  components: {},
  props: {
    travelAuthorizationId: {
      type: Number,
      required: true,
    },
    buttonClasses: {
      type: [String, Array, Object],
      default: () => "mb-2",
    },
    buttonColor: {
      type: String,
      default: "primary",
    },
  },
  data() {
    return {
      showDialog: this.$route.query.showGenerate === "true",
      loading: false,
    }
  },
  watch: {
    showDialog(value) {
      if (value) {
        this.$router.push({ query: { showGenerate: value } })
      } else {
        this.$router.push({ query: { showGenerate: undefined } })
      }
    },
  },
  methods: {
    required,
    close() {
      this.showDialog = false
    },
    createAndClose() {
      this.loading = true
      return generateApi
        .create(this.travelAuthorizationId)
        .then(() => {
          this.$emit("created")
          this.close()
        })
        .catch((error) => {
          this.$snack(error.message, { color: "error" })
        })
        .finally(() => {
          this.loading = false
        })
    },
  },
}
</script>
