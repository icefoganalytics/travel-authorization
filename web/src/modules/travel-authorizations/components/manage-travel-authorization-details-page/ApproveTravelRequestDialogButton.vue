<template>
  <v-dialog
    v-model="showDialog"
    width="500"
  >
    <template #activator="{ on, attrs }">
      <v-btn
        :loading="isLoading"
        :disabled="isDisabled"
        :class="buttonClasses"
        color="success"
        v-bind="attrs"
        v-on="on"
      >
        Approve
      </v-btn>
    </template>

    <v-form
      ref="form"
      @submit.prevent="approveAndClose"
    >
      <v-card>
        <v-card-title class="text-h5"> Approve Request </v-card-title>

        <v-card-text :loading="isLoading">
          <p>
            Approve travel of {{ requestorDisplayName }} to
            <LocationChip :location-id="travelLocationId" />
            ?
          </p>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            :loading="isLoading"
            color="secondary"
            @click="close"
            >Cancel</v-btn
          >
          <v-btn
            :loading="isLoading"
            color="success"
            type="submit"
            >Approve</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup>
import { ref, nextTick, watch } from "vue"
import { useRoute, useRouter } from "vue2-helpers/vue-router"

import useSnack from "@/use/use-snack"
import useTravelAuthorization from "@/use/use-travel-authorization"

import LocationChip from "@/components/locations/LocationChip.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  requestorDisplayName: {
    type: String,
    required: true,
  },
  travelLocationId: {
    type: Number,
    default: null,
  },
  buttonClasses: {
    type: [String, Array, Object],
    default: null,
  },
})

const emit = defineEmits(["approved"])

const route = useRoute()
const router = useRouter()
const snack = useSnack()
const { isLoading, approve } = useTravelAuthorization(props.travelAuthorizationId)

const form = ref(null)
const showDialog = ref(route.query.showApprove === "true")

function close() {
  showDialog.value = false
  form.value.resetValidation()
}

async function approveAndClose() {
  try {
    await approve()
    close()

    await nextTick()
    emit("approved")
    snack("Travel authorization approved!", { color: "success" })
  } catch (error) {
    snack(error.message, { color: "error" })
  }
}

watch(
  () => showDialog.value,
  (value) => {
    if (value) {
      router.push({ query: { showApprove: "true" } })
    } else {
      router.push({ query: { showApprove: undefined } })
    }
  }
)
</script>
