<template>
  <v-tooltip bottom>
    <template #activator="{ on }">
      <div
        class="d-flex align-center"
        v-on="on"
      >
        <v-tab
          class="d-flex align-start"
          disabled
        >
          <slot></slot>
          <v-icon
            class="ml-1"
            small
          >
            mdi-help-circle-outline
          </v-icon>
        </v-tab>
      </div>
    </template>
    <span v-if="lockReasons && lockReasons.length">
      {{ title }} is locked for the following reason(s):
      <ul>
        <li
          v-for="(reason, index) in lockReasons"
          :key="index"
        >
          {{ reason }}
        </li>
      </ul>
    </span>
    <span v-else> {{ title }} is currently locked. </span>
  </v-tooltip>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    lockReasons?: string[]
  }>(),
  {
    lockReasons: () => [],
  }
)
</script>

<style scoped></style>
