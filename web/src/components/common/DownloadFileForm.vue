<template>
  <v-form
    ref="formRef"
    :action="downloadUrl"
    method="post"
    target="_blank"
    @submit.prevent="getAccessTokenAndSubmit"
  >
    <input
      type="hidden"
      name="HOISTABLE_AUTHORIZATION_TOKEN"
      :value="accessToken"
    />
    <v-btn
      :block="smAndDown"
      :color="color"
      :prepend-icon="prependIcon"
      :loading="loading"
      type="submit"
    >
      <template #default>
        {{ text }}
      </template>
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { isNil } from "lodash"
import { ref, nextTick } from "vue"

import { type VForm } from "vuetify/lib/components"

import { useAuth0 } from "@/plugins/auth0-plugin"

import useDisplayVuetify2 from "@/use/utils/use-display-vuetify2"

withDefaults(
  defineProps<{
    text?: string
    downloadUrl: string
    prependIcon?: string
    color?: string
    loading?: boolean
  }>(),
  {
    text: "Download File",
    prependIcon: "mdi-download",
    color: "primary",
    loading: false,
  }
)

const emit = defineEmits<{
  (event: "downloaded"): void
}>()

const { getAccessTokenSilently } = useAuth0()

const formRef = ref<InstanceType<typeof VForm> | null>(null)
const accessToken = ref<string | null>(null)
const isDownloading = ref(false)

async function getAccessTokenAndSubmit() {
  if (isNil(formRef.value)) {
    throw new Error("Form element is not available")
  }

  isDownloading.value = true
  try {
    accessToken.value = await getAccessTokenSilently()
    await nextTick() // Wait for accessToken to be updated in the DOM

    // TODO: update to formRef.value.submit() when using Vuetify 3
    formRef.value.$el.submit()

    await nextTick()
    emit("downloaded")
  } catch (error) {
    console.error(`Error fetching new access token: ${error}`, { error })
    throw error
  } finally {
    isDownloading.value = false
  }
}

const { smAndDown } = useDisplayVuetify2()
</script>
