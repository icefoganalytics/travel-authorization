<template>
  <!-- Vertical layout -->
  <div
    v-if="vertical"
    class="text-body-1 text--primary"
  >
    <dt class="d-flex align-center font-weight-bold">
      <v-icon
        v-if="icon"
        size="18"
        class="mr-2"
        aria-hidden="true"
      >
        {{ icon }}
      </v-icon>
      <span>{{ label }}</span>
    </dt>
    <dd class="mt-2 font-weight-medium">
      <slot>{{ value }}</slot>
    </dd>
  </div>

  <!-- Horizontal layout -->
  <div
    v-else
    class="text-body-1 text--primary d-flex align-center gap-2"
  >
    <dt class="d-flex align-center font-weight-bold">
      <v-icon
        v-if="icon"
        size="18"
        class="mr-2"
        aria-hidden="true"
      >
        {{ icon }}
      </v-icon>
      <span>{{ label }}:</span>
    </dt>
    <dd class="font-weight-medium">
      <slot>{{ value }}</slot>
    </dd>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    icon?: string
    value?: string | number | boolean | null | undefined
    vertical?: boolean
  }>(),
  {
    icon: "",
    value: "",
    vertical: false,
  }
)
</script>

<style scoped>
.gap-2 {
  gap: 0.5rem; /* 8px */
}
</style>
