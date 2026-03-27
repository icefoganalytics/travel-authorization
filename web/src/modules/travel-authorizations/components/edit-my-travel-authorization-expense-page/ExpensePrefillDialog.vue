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
      <v-card :loading="isLoading">
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
            :loading="isLoading"
            color="error"
            @click="close"
          >
            Cancel
          </v-btn>
          <v-btn
            :loading="isLoading"
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

<script setup lang="ts">
import { ref } from "vue"

import prefillApi from "@/api/travel-authorizations/expenses/prefill-api"

import useSnack from "@/use/use-snack"
import useRouteQuery, { booleanTransformer } from "@/use/utils/use-route-query"

const emit = defineEmits<{
  (event: "created"): void
}>()

const props = withDefaults(
  defineProps<{
    travelAuthorizationId: number
    buttonClasses?: string | string[] | Record<string, boolean>
    buttonColor?: string
  }>(),
  {
    buttonClasses: "mb-2",
    buttonColor: "primary",
  }
)

const showDialog = useRouteQuery("showPrefill", "false", {
  transform: booleanTransformer,
})
const isLoading = ref(false)

const snack = useSnack()

async function createAndClose() {
  isLoading.value = true
  try {
    await prefillApi.create(props.travelAuthorizationId)
    emit("created")
    close()
  } catch (error) {
    console.error(`Failed to prefill expenses: ${error}`, { error })
    snack.error(`Failed to prefill expenses: ${error}`)
  } finally {
    isLoading.value = false
  }
}

function close() {
  showDialog.value = false
}
</script>
