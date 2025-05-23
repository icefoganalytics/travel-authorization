<template>
  <v-card :elevation="elevation">
    <v-form
      ref="form"
      :value="value"
      @input="emit('input', $event)"
      @submit="emit('submit', $event)"
    >
      <v-card-title class="d-flex flex-column flex-md-row justify-md-space-between align-md-end">
        <slot name="header">
          <component
            :is="headerTag"
            v-if="!isEmpty(title)"
            :class="headerClass"
          >
            {{ title }}
          </component>
        </slot>
        <v-spacer class="mt-4 mt-md-0" />
        <slot name="header-actions"></slot>
      </v-card-title>
      <v-divider :class="dividerClass" />
      <v-card-text>
        <slot></slot>
      </v-card-text>
      <v-card-actions
        v-if="$slots['actions']"
        class="d-flex flex-column flex-md-row"
      >
        <slot name="actions"></slot>
      </v-card-actions>
    </v-form>
  </v-card>
</template>

<script setup>
import { ref } from "vue"
import { isEmpty, isNil } from "lodash"

defineProps({
  value: {
    type: Boolean,
    default: null,
  },
  title: {
    type: String,
    default: "",
  },
  headerTag: {
    type: String,
    default: "h3",
    validator(value) {
      if (typeof value !== "string") return false

      return ["h1", "h2", "h3", "h4", "h5", "h6"].includes(value)
    },
  },
  headerClass: {
    type: [String, Object, Array],
    default: "text-h5 mb-0",
  },
  dividerClass: {
    type: [String, Object, Array],
    default: "mb-3",
  },
  elevation: {
    type: [String, Number],
    default: 0,
  },
})

const emit = defineEmits(["input", "submit"])

/** @typedef {import('vuetify/lib/components').VForm} VForm */
/** @type {import('vue').Ref<InstanceType<typeof VForm> | null>} */
const form = ref(null)

function validate() {
  if (isNil(form.value)) throw new Error("form component not loaded")

  return form.value?.validate()
}

function resetValidation() {
  if (isNil(form.value)) throw new Error("form component not loaded")

  return form.value?.resetValidation()
}

defineExpose({
  validate,
  resetValidation,
})
</script>
