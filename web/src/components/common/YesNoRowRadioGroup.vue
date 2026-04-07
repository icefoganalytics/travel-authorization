<template>
  <v-radio-group
    :value="value"
    :label="label"
    v-bind="$attrs"
    @change="emit('input', $event)"
  >
    <div class="d-flex align-baseline">
      <v-radio
        label="Yes"
        :value="true"
      ></v-radio>
      <v-radio
        class="ml-4"
        label="No"
        :value="false"
      ></v-radio>
    </div>
  </v-radio-group>
</template>

<script setup>
/**
 * Special v-radio group where label is above row of radio buttons.
 * This is different than v-radio-group "row" layout where label is to the left of radio buttons.
 */
defineProps({
  value: {
    type: Boolean,
    default: null,
  },
  label: {
    type: String,
    default: "Pick yes or no:",
  },
})

const emit = defineEmits(["input"])
</script>
