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
        Prefill Expenses
      </v-btn>
    </template>
    <v-form @submit.prevent="createAndClose">
      <v-card :loading="loading">
        <v-card-title class="text-h5"> Prefill Expenses? </v-card-title>

        <v-card-text>
          <p>
            By proceeding, initial expenses will be pre-populated from estimates. You'll have the
            opportunity to review and modify them afterward.
            <br />
            Note: Flight estimates will be excluded, as will meals and incidentals.
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
            Prefill
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script>
import { required } from "@/utils/validators"

import prefillApi from "@/api/travel-authorizations/expenses/prefill-api"

import useSnack from "@/use/use-snack"

export default {
  name: "ExpensePrefillDialog",
  components: {},
  setup() {
    const snack = useSnack()

    return {
      snack,
    }
  },
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
      showDialog: this.$route.query.showPrefill === "true",
      loading: false,
    }
  },
  watch: {
    showDialog(value) {
      if (value) {
        this.$router.push({ query: { showPrefill: value } })
      } else {
        this.$router.push({ query: { showPrefill: undefined } })
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
      return prefillApi
        .create(this.travelAuthorizationId)
        .then(() => {
          this.$emit("created")
          this.close()
        })
        .catch((error) => {
          console.error(`Failed to prefill expenses: ${error}`, { error })
          this.snack.error(`Failed to prefill expenses: ${error}`)
        })
        .finally(() => {
          this.loading = false
        })
    },
  },
}
</script>
