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
        Generate Estimate
      </v-btn>
    </template>
    <v-form @submit.prevent="createAndClose">
      <v-card :loading="loading">
        <v-card-title class="text-h5"> Generate Estimate? </v-card-title>

        <v-card-text>
          <p>
            By proceeding, the travel request will be saved, and initial cost estimates will be
            pre-populated. You'll have the opportunity to review and modify the estimates afterward.
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
            Save & Generate
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup>
import { ref, watch } from "vue"
import { useRoute, useRouter } from "vue2-helpers/vue-router"

import useSnack from "@/use/use-snack"
import generateApi from "@/api/travel-authorizations/estimates/generate-api"
import useTravelAuthorization from "@/use/use-travel-authorization"

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

const route = useRoute()
const router = useRouter()
const snack = useSnack()
const { travelAuthorization, saveSilently } = useTravelAuthorization(props.travelAuthorizationId)

const showDialog = ref(route.query.showGenerate === "true")
const loading = ref(false)

watch(
  () => showDialog.value,
  (newValue) => {
    if (newValue) {
      router.push({ query: { showGenerate: newValue } })
    } else {
      router.push({ query: { showGenerate: undefined } })
    }
  }
)

function close() {
  showDialog.value = false
}

async function createAndClose() {
  loading.value = true
  try {
    await saveSilently()
    const { estimates } = await generateApi.create(props.travelAuthorizationId)
    travelAuthorization.value.expenses = estimates
    emit("created")
    close()
  } catch (error) {
    snack(error.message, { color: "error" })
  } finally {
    loading.value = false
  }
}
</script>
