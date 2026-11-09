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
            <LocationChip :location-id="travelLocationId ?? undefined" />
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
import { nextTick, ref, toRefs, useTemplateRef, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import { type VForm } from "vuetify/components"

import useSnack from "@/use/use-snack"
import useTravelAuthorization from "@/use/use-travel-authorization"

import LocationChip from "@/components/locations/LocationChip.vue"

const props = withDefaults(
  defineProps<{
    travelAuthorizationId: number
    isDisabled?: boolean
    requestorDisplayName: string
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

const route = useRoute()
const router = useRouter()
const snack = useSnack()
const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization, isLoading, approve } = useTravelAuthorization(travelAuthorizationId)

const form = useTemplateRef<InstanceType<typeof VForm>>("form")
const showDialog = ref(route.query.showApprove === "true")

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
    console.error(error)
    snack.error(error instanceof Error ? error.message : String(error))
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
