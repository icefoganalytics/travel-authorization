<template>
  <v-autocomplete
    :model-value="modelValue"
    :loading="isLoading"
    :items="departments"
    :label="label"
    :hint="hint"
    :auto-select-first="autoSelectFirst"
    :chips="chips"
    :clearable="clearable"
    :hide-no-data="hideNoData"
    :hide-selected="hideSelected"
    :no-filter="noFilter"
    :persistent-hint="persistentHint"
    v-bind="$attrs"
    @update:model-value="emitInputAndReset"
    @update:search="debouncedUpdateSearchToken"
    @click:clear="reset"
  >
    <template
      v-if="hasMore"
      #append-item
    >
      <v-divider />
      <v-list-item
        class="text-primary text-center"
        @click="nextPage"
      >
        <v-list-item-title>Show More</v-list-item-title>
      </v-list-item>
    </template>
  </v-autocomplete>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { debounce, isEmpty, isNil } from "lodash"

import useYgEmployeeGroups, {
  type YgEmployeeGroupFiltersOptions,
  type YgEmployeeGroupWhereOptions,
} from "@/use/use-yg-employee-groups"

const props = withDefaults(
  defineProps<{
    modelValue?: string | null
    where?: YgEmployeeGroupWhereOptions
    filters?: YgEmployeeGroupFiltersOptions
    label?: string
    hint?: string
    autoSelectFirst?: boolean
    chips?: boolean
    clearable?: boolean
    hideNoData?: boolean
    hideSelected?: boolean
    noFilter?: boolean
    persistentHint?: boolean
  }>(),
  {
    modelValue: null,
    where: () => ({}),
    filters: () => ({}),
    label: "Department",
    hint: "Search for a department.",
    autoSelectFirst: true,
    chips: true,
    clearable: true,
    hideNoData: true,
    hideSelected: true,
    noFilter: true,
    persistentHint: true,
  }
)

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void
}>()

function emitInputAndReset(value: string | null) {
  if (isNil(value)) {
    emit("update:modelValue", "")
    reset()
    return
  }

  emit("update:modelValue", value)
  reset()
}

const searchToken = ref("")

function updateSearchToken(value: string) {
  if (value === props.modelValue) return

  searchToken.value = value
  page.value = 1
}

const debouncedUpdateSearchToken = debounce(updateSearchToken, 500)

const searchFilter = computed(() => {
  if (isNil(searchToken.value) || isEmpty(searchToken.value)) return {}

  return {
    search: searchToken.value.trim().split(" "),
  }
})

const perPage = computed(() => {
  if (isNil(searchToken.value) || isEmpty(searchToken.value)) return 100

  return 20
})

const page = ref(1)

const ygEmployeeGroupsQuery = computed(() => {
  return {
    where: props.where,
    filters: {
      ...props.filters,
      ...searchFilter.value,
      isDepartment: true,
    },
    perPage: perPage.value,
    page: page.value,
  }
})
const { ygEmployeeGroups, totalCount, isLoading, refresh } =
  useYgEmployeeGroups(ygEmployeeGroupsQuery)

const departments = computed(() => {
  return ygEmployeeGroups.value.map((ygEmployeeGroup) => ygEmployeeGroup.department)
})

async function reset() {
  searchToken.value = ""
  page.value = 1
  await refresh()
}

watch(
  () => props.modelValue,
  async (newModelValue) => {
    if (isEmpty(newModelValue)) {
      await reset()
    }
  }
)

const hasMore = computed(() => page.value * perPage.value < totalCount.value)

function nextPage() {
  page.value += 1
}

defineExpose({
  reset,
})
</script>
