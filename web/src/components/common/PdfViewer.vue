<template>
  <v-sheet>
    <iframe
      v-if="supportsPDFs"
      ref="fullscreenDivRef"
      title="Receipt PDF"
      :src="source"
      style="width: 100%; height: 100%; min-height: 480px; border: 0"
    ></iframe>
    <template v-else>
      <div
        ref="fullscreenDivRef"
        :class="isFullscreen ? 'pdf-container-fullscreen' : 'pdf-container'"
      >
        <PageLoader v-if="isLoading" />
        <!-- NOTE: don't use v-else or the pdf will never render -->
        <VuePdfEmbed
          :source="source"
          :page="isFullscreen ? null : page"
          :height="isFullscreen ? height : null"
          @loaded="updateState"
        />
      </div>
      <div class="text-center mt-3">
        <v-pagination
          v-model="page"
          :length="pageCount"
          :total-visible="7"
        />
      </div>
    </template>
  </v-sheet>
</template>

<script setup lang="ts">
import { isNil, isUndefined } from "lodash"
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { supportsPDFs } from "pdfobject"

// Using import from dist/vue2-pdf-embed for Vue 2 compatibility, remove once we migrate to Vue 3.
import VuePdfEmbed from "vue-pdf-embed/dist/vue2-pdf-embed"

defineProps<{
  source: string
}>()

const page = ref(1)
const isLoading = ref(true)
const pageCount = ref(1)

type PDFDocumentProxy = {
  numPages: number
}

async function updateState(doc: PDFDocumentProxy) {
  isLoading.value = false

  pageCount.value = doc.numPages
  if (page.value > pageCount.value) {
    page.value = pageCount.value
  }
}

const fullscreenDivRef = ref<InstanceType<typeof HTMLDivElement> | null>(null)
const height = computed(() => {
  if (isNil(fullscreenDivRef.value)) return null

  return fullscreenDivRef.value.clientHeight - fullscreenDivRef.value.clientHeight / 10
})

const isFullscreenSupported = computed(() => {
  if (isNil(fullscreenDivRef.value)) return false

  return !isUndefined(fullscreenDivRef.value.requestFullscreen)
})

const isFullscreen = ref(false)

async function showFullscreen() {
  if (isNil(fullscreenDivRef.value)) return

  isLoading.value = true
  if (fullscreenDivRef.value.requestFullscreen) {
    await fullscreenDivRef.value.requestFullscreen()
  }
}

onMounted(() => {
  document.addEventListener("fullscreenchange", onFullscreenChange)
})

onBeforeUnmount(() => {
  document.removeEventListener("fullscreenchange", onFullscreenChange)
})

async function onFullscreenChange() {
  isLoading.value = false
  if (isNil(fullscreenDivRef.value)) return

  if (isNil(document.fullscreenElement)) {
    isFullscreen.value = false
  } else {
    isFullscreen.value = document.fullscreenElement === fullscreenDivRef.value
  }
}

defineExpose({
  isFullscreenSupported,
  showFullscreen,
})
</script>

<style scoped>
.pdf-container {
  max-height: 480px;
  overflow-y: auto;
}

/* True fullscreen sizing */
.pdf-container-fullscreen {
  width: 100vw;
  height: 100vh;
  max-height: none;
  background: rgba(0, 0, 0, 0.92); /* nicer backdrop */
  overflow-y: auto;
  margin: 0;
  padding: 0;
  display: block;
}

:deep(.vue-pdf-embed__page canvas) {
  margin-right: auto !important;
  margin-left: auto !important;
}
</style>
