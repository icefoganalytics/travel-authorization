<template>
  <v-card
    variant="outlined"
    :style="{ border: border }"
  >
    <div
      ref="titleSlot"
      :class="largeTitle ? 'custom-large-title-card' : 'custom-title-card'"
      class="px-2"
      :style="{ width: titleWidth }"
    >
      <slot name="title"></slot>
    </div>

    <slot name="body"></slot>
  </v-card>
</template>

<script setup>
import { ref, onMounted } from "vue"

defineProps({
  largeTitle: {
    type: Boolean,
    default: false,
  },
  border: {
    type: String,
    required: false,
    default: "",
  },
})

/** @type {import("vue").Ref<InstanceType<typeof HtmlDivElement> | null>} */
const titleSlot = ref(null)
const titleWidth = ref("auto")

onMounted(() => {
  setTitleWidth()
})

function setTitleWidth() {
  if (titleSlot.value === null) return

  // Create a temporary span element to measure text width
  const span = document.createElement("span")
  span.style.visibility = "hidden"
  span.style.position = "absolute"
  span.style.whiteSpace = "nowrap"
  // Must match styling of actual title slot
  span.classList.add("px-2")

  // Get the text content of the slot
  const titleText = titleSlot.value.textContent
  span.textContent = titleText

  // Append span to titleSlot for accurate styling
  titleSlot.value.appendChild(span)

  if (span.offsetWidth > 10) titleWidth.value = `${span.offsetWidth + 1}px`

  // Remove the span element now that we have the size
  titleSlot.value.removeChild(span)
}
</script>
<style scoped>
.custom-title-card {
  margin: -0.75rem 0 0 1rem;
  font-size: 12pt;
  font-weight: 600;
  background: white;
  z-index: 99;
}

.custom-large-title-card {
  margin: -0.75rem 0 0 1rem;
  font-size: 15.5pt;
  color: #5e5e5e;
  background: white;
  z-index: 99;
}
</style>
