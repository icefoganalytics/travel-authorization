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
        color="error"
        v-bind="attrs"
        v-on="on"
      >
        Deny
      </v-btn>
    </template>

    <v-form
      ref="form"
      @submit.prevent="denyAndClose"
    >
      <v-card>
        <v-card-title class="text-h5"> Deny Request </v-card-title>

        <v-card-text :loading="isLoading">
          <p>Please provide a reason for denying this request.</p>
          <v-row>
            <v-col>
              <v-textarea
                v-model="denialReason"
                :rules="[required]"
                label="Denial reason"
                rows="5"
                required
                outlined
              />
            </v-col>
          </v-row>
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
            color="error"
            type="submit"
            >Deny</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup>
import { ref, nextTick, watch } from "vue"
import { useRoute, useRouter } from "vue2-helpers/vue-router"

import { required } from "@/utils/validators"

import useSnack from "@/use/use-snack"
import { useTravelAuthorization } from "@/use/use-travel-authorization"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  buttonClasses: {
    type: [String, Array, Object],
    default: null,
  },
})

const emit = defineEmits(["denied"])

const route = useRoute()
const router = useRouter()
const snack = useSnack()
const { isLoading, deny } = useTravelAuthorization(props.travelAuthorizationId)

const form = ref(null)
const showDialog = ref(route.query.showDeny === "true")
const denialReason = ref(null)

function close() {
  showDialog.value = false
  form.value.resetValidation()
}

async function denyAndClose() {
  try {
    await deny({
      denialReason: denialReason.value,
    })
    close()
    snack("Travel authorization denied.", { color: "success" })
    nextTick(() => {
      emit("denied")
    })
  } catch (error) {
    snack(error.message, { color: "error" })
  }
}

watch(
  () => showDialog.value,
  (newShowDialog) => {
    if (newShowDialog) {
      router.push({ query: { showDeny: newShowDialog } })
    } else {
      router.push({ query: { showDeny: undefined } })
    }
  }
)
</script>
