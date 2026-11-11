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
        color="success"
        v-bind="activatorProps"
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
            <LocationChip
              v-if="!isNil(travelLocationId)"
              :location-id="travelLocationId"
            />
            <template v-if="travelAuthorization?.eventName">
              for {{ travelAuthorization.eventName }}
            </template>
            ?
          </p>
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
            color="success"
            type="submit"
            >Approve</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup lang="ts">
import { nextTick, toRefs, useTemplateRef } from "vue"
import { isNil } from "lodash"

import useRouteQuery, { booleanTransformer } from "@/use/utils/use-route-query"

import ApiError from "@/api/api-error"

import useSnack from "@/use/use-snack"
import useTravelAuthorization from "@/use/use-travel-authorization"

import LocationChip from "@/components/locations/LocationChip.vue"

const props = withDefaults(
  defineProps<{
    travelAuthorizationId: number
    requestorDisplayName: string
    isDisabled?: boolean
    travelLocationId?: number | null
    buttonClasses?: string | string[] | Record<string, boolean> | null
  }>(),
  {
    isDisabled: false,
    travelLocationId: null,
    buttonClasses: null,
  }
)

const emit = defineEmits<{
  approved: []
}>()

const snack = useSnack()
const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization, isLoading, approve } = useTravelAuthorization(travelAuthorizationId)

const form = useTemplateRef("form")
const showDialog = useRouteQuery("showApprove", "false", {
  transform: booleanTransformer,
})

function close() {
  showDialog.value = false
  form.value?.resetValidation()
}

async function approveAndClose() {
  try {
    await approve()
    close()

    await nextTick()
    emit("approved")
    snack("Travel authorization approved!", { color: "success" })
  } catch (error) {
    if (!(error instanceof ApiError)) throw error

    console.error(`Failed to approve travel authorization: ${error}`, { error })
    snack.error(`Failed to approve travel authorization: ${error}`)
  }
}
</script>
