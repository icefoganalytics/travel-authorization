<template>
  <v-btn
    :loading="isLoading"
    color="green"
    @click="saveWrapper"
    >Save Draft
  </v-btn>
</template>

<script setup>
import useSnack from "@/use/use-snack"
import { useTravelAuthorization } from "@/use/use-travel-authorization"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
  validate: {
    type: Function,
    required: true,
  },
})

const snack = useSnack()
const { isLoading, save } = useTravelAuthorization(props.travelAuthorizationId)

async function saveWrapper() {
  if (!props.validate()) {
    snack("Form submission can't be sent until the form is complete.", { color: "error" })
    return
  }

  try {
    await save()
    snack("Form saved as a draft", { color: "success" })
  } catch (error) {
    snack(error.message, { color: "error" })
  }
}
</script>
