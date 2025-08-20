<template>
  <img
    ref="imgRef"
    style="min-width: 320px; min-height: 480px"
  />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { isNil } from "lodash"

import Viewer from "viewerjs"
import "viewerjs/dist/viewer.css"

const props = defineProps<{
  src: string
}>()

const emit = defineEmits<{
  (event: "update:fullscreen", value: boolean): void
}>()

const viewer = ref<Viewer | null>(null)
const imgRef = ref<HTMLImageElement | null>(null)

onMounted(() => {
  if (isNil(imgRef.value)) return

  initializeViewer(imgRef.value)
})

onBeforeUnmount(() => {
  destroyViewer()
})

async function initializeViewer(newImgRef: HTMLImageElement) {
  viewer.value = new Viewer(newImgRef, {
    inline: true,
    url: () => props.src,
    viewed() {
      viewer.value?.zoomTo(0.5)
    },
    navbar: false,
    toolbar: {
      zoomIn: true,
      zoomOut: true,
      oneToOne: true,
      reset: true,
      prev: false,
      play: false,
      next: false,
      rotateLeft: false,
      rotateRight: false,
      flipHorizontal: false,
      flipVertical: false,
    },
    rotatable: false,
    scalable: false,
  })
}

watch(
  () => props.src,
  () => {
    if (isNil(viewer.value)) return

    viewer.value.update()
  }
)

const isFullscreen = computed(() => (viewer.value as unknown as { fulled: boolean })?.fulled)

watch(isFullscreen, (newIsFullscreen) => {
  emit("update:fullscreen", newIsFullscreen)
})

function destroyViewer() {
  if (viewer.value) {
    viewer.value.destroy()
    viewer.value = null
  }
}

defineExpose({
  show: () => viewer.value?.show(),
})
</script>
