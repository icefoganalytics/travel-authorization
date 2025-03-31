<template>
  <form
    ref="form"
    :action="downloadUrl"
    method="post"
    target="_blank"
    @submit.prevent="getAccessTokenAndSubmit"
  >
    <input
      type="hidden"
      name="FORM_API_BEARER_TOKEN"
      :value="accessToken"
    />
    <v-btn
      :loading="isDownloading"
      v-bind="buttonPropsWithDefaults"
      type="submit"
    >
      <slot>{{ buttonText }}</slot>
      <v-icon right>mdi-download</v-icon>
    </v-btn>
  </form>
</template>

<script setup>
import { computed, ref, nextTick } from "vue"
import { isNil, merge } from "lodash"

import { useAuth0 } from "@/plugins/auth0-plugin"

import { API_BASE_URL } from "@/config"

const props = defineProps({
  travelAuthorizationPreApprovalDocumentId: {
    type: Number,
    required: true,
  },
  buttonText: {
    type: String,
    default: "Download",
  },
  buttonProps: {
    type: Object,
    default: () => ({}),
  },
})

const buttonPropsWithDefaults = computed(() =>
  merge(
    {},
    {
      outlined: true,
      xLarge: true,
      color: "info",
    },
    props.buttonProps
  )
)

const { getAccessTokenSilently } = useAuth0()

/** @type {import('vue').Ref<HTMLFormElement | null>} */
const form = ref(null)
const accessToken = ref(null)

const downloadUrl = computed(() => {
  return `${API_BASE_URL}/api/downloads/travel-authorization-pre-approval-documents/${props.travelAuthorizationPreApprovalDocumentId}`
})

const isDownloading = ref(false)

async function getAccessTokenAndSubmit() {
  if (isNil(form.value)) {
    throw new Error("Form element is not available")
  }

  isDownloading.value = true
  try {
    accessToken.value = await getAccessTokenSilently()
    await nextTick() // Wait for accessToken to be updated in the DOM

    form.value.submit()
  } catch (error) {
    console.error("Error fetching new access token:", error)
    throw error
  } finally {
    isDownloading.value = false
  }
}
</script>
