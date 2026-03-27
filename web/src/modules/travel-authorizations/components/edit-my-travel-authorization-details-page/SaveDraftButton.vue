<template>
  <v-btn
    :loading="isLoading"
    color="green"
    @click="saveWrapper"
    >Save Draft
  </v-btn>
</template>

<script setup lang="ts">
import { computed } from "vue"

import useSnack from "@/use/use-snack"
import useTravelAuthorization from "@/use/use-travel-authorization"

const props = defineProps<{
  travelAuthorizationId: number
  validateForm: () => boolean
}>()

const travelAuthorizationId = computed(() => props.travelAuthorizationId)
const { isLoading, save } = useTravelAuthorization(travelAuthorizationId)

const snack = useSnack()

async function saveWrapper() {
  if (!props.validateForm()) {
    snack.error("Form submission can't be sent until the form is complete.")
    return
  }

  try {
    await save()
    snack.success("Form saved as a draft")
  } catch (error) {
    console.error(`Failed to save draft: ${error}`, { error })
    snack.error(`Failed to save draft: ${error}`)
  }
}
</script>
