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
        @click="show"
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

<script setup>
import { ref } from "vue"

import generateApi from "@/api/travel-authorizations/estimates/generate-api"
import useRouteQuery, { booleanTransformer } from "@/use/utils/use-route-query"
import useSnack from "@/use/use-snack"

const props = defineProps({
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
})

const emit = defineEmits(["created"])

const showDialog = useRouteQuery("showEstimateGenerate", false, {
  transform: booleanTransformer,
})

const loading = ref(false)

function show() {
  showDialog.value = true
}

function close() {
  showDialog.value = false
}

const snack = useSnack()

async function createAndClose() {
  loading.value = true
  try {
    await generateApi.create(props.travelAuthorizationId)
    emit("created")
    close()
  } catch (error) {
    console.error(error)
    snack.error(error.message)
  } finally {
    loading.value = false
  }
}

defineExpose({
  show,
  close,
  createAndClose,
})
</script>
