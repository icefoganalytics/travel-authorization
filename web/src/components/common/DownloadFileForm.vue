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
    <input
      type="hidden"
      name="query"
      :value="serializedQueryOptions"
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
import { computed, nextTick, ref, useTemplateRef } from "vue"
import { useDisplay } from "vuetify"

import { serializeQuery } from "@/api/base-api"

const props = withDefaults(
  defineProps<{
    text?: string
    downloadUrl: string
    prependIcon?: string
    color?: string
    loading?: boolean
    queryOptions?: Record<string, unknown>
  }>(),
  {
    text: "Download File",
    prependIcon: "mdi-download",
    color: "primary",
    loading: false,
    queryOptions: () => ({}),
  }
)

const emit = defineEmits<{
  (event: "downloaded"): void
}>()

const { getAccessTokenSilently } = useAuth0()

const formRef = useTemplateRef("formRef")
const accessToken = ref<string | null>(null)
const isDownloading = ref(false)
const serializedQueryOptions = computed(() => serializeQuery(props.queryOptions))

async function getAccessTokenAndSubmit() {
  if (props.loading || isDownloading.value) return

  if (isNil(formRef.value)) {
    throw new Error("Form element is not available")
  }

  isDownloading.value = true
  try {
    accessToken.value = await getAccessTokenSilently()
    await nextTick()

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
