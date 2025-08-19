<template>
  <img
    ref="imgRef"
    style="min-width: 320px; min-height: 480px"
  />
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { isNil } from "lodash"

import Viewer from "viewerjs"
import "viewerjs/dist/viewer.css"

const props = defineProps<{
  imageBlob: Blob
}>()

const activeObjectUrl = computed<string>(() => URL.createObjectURL(props.imageBlob))

const viewer = ref<Viewer | null>(null)
const imgRef = ref<HTMLImageElement | null>(null)

onMounted(() => {
  if (isNil(imgRef.value)) return

  initializeViewer(imgRef.value)
})

onBeforeUnmount(() => {
  destroyViewer()
  revokeBlob()
})

async function initializeViewer(newImgRef: HTMLImageElement) {
  viewer.value = new Viewer(newImgRef, {
    inline: true,
    url: () => activeObjectUrl.value,
    viewed() {
      viewer.value?.zoomTo(0.33)
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

function destroyViewer() {
  if (viewer.value) {
    viewer.value.destroy()
    viewer.value = null
  }
}

function revokeBlob() {
  URL.revokeObjectURL(activeObjectUrl.value)
}

defineExpose({
  show: () => viewer.value?.show(),
})
</script>
