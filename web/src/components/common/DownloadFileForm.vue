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
      :loading="loading || isDownloading"
      type="submit"
    >
      <template #default>
        <slot>{{ text }}</slot>
      </template>
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { useAuth0 } from "@auth0/auth0-vue"
import { isNil } from "lodash"
import { nextTick, ref, useTemplateRef } from "vue"
import { useDisplay } from "vuetify"

const props = withDefaults(
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

const formRef = useTemplateRef("formRef")
const accessToken = ref<string | null>(null)
const isDownloading = ref(false)

async function getAccessTokenAndSubmit() {
  if (props.loading || isDownloading.value) return

  if (isNil(formRef.value)) {
    throw new Error("Form element is not available")
  }

  isDownloading.value = true
  try {
    accessToken.value = await getAccessTokenSilently()
    await nextTick() // Wait for accessToken to be updated in the DOM

    formRef.value.submit()

    await nextTick()
    emit("downloaded")
  } catch (error) {
    console.error(`Error fetching new access token: ${error}`, { error })
    throw error
  } finally {
    isDownloading.value = false
  }
}

const { smAndDown } = useDisplay()
</script>
