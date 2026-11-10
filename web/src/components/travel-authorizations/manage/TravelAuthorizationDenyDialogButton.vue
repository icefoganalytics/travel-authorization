<template>
  <v-dialog
    v-model="showDialog"
    width="500"
  >
    <template #activator="{ props: activatorProps }">
      <v-btn
        :loading="isLoading"
        :disabled="isDisabled"
        :class="buttonClasses"
        color="error"
        v-bind="activatorProps"
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
                variant="outlined"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            :loading="isLoading"
            variant="outlined"
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

<script setup lang="ts">
import { nextTick, ref, toRefs, useTemplateRef } from "vue"

import { required } from "@/utils/validators"
import useRouteQuery, { booleanTransformer } from "@/use/utils/use-route-query"

import ApiError from "@/api/api-error"

import useSnack from "@/use/use-snack"
import { useTravelAuthorization } from "@/use/use-travel-authorization"

const props = withDefaults(
  defineProps<{
    travelAuthorizationId: number
    isDisabled?: boolean
    buttonClasses?: string | string[] | Record<string, boolean> | null
  }>(),
  {
    isDisabled: false,
    buttonClasses: null,
  }
)

const emit = defineEmits<{
  denied: []
}>()

const snack = useSnack()
const { travelAuthorizationId } = toRefs(props)
const { isLoading, deny } = useTravelAuthorization(travelAuthorizationId)

const form = useTemplateRef("form")
const showDialog = useRouteQuery("showDeny", "false", {
  transform: booleanTransformer,
})
const denialReason = ref<string | null>(null)

function close() {
  showDialog.value = false
  form.value?.resetValidation()
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
    if (!(error instanceof ApiError)) throw error

    console.error(`Failed to deny travel authorization: ${error}`, { error })
    snack.error(`Failed to deny travel authorization: ${error}`)
  }
}
</script>
