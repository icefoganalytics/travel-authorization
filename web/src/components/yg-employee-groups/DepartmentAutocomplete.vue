<template>
  <v-autocomplete
    :value="value"
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
    :small-chips="smallChips"
    v-bind="$attrs"
    v-on="$listeners"
    @input="updateSearchAndEmitInput"
    @update:search-input="debouncedUpdateSearchToken"
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

<script setup>
import { computed, ref, watch } from "vue"
import { debounce, isEmpty, isNil } from "lodash"

import useYgEmployeeGroups from "@/use/use-yg-employee-groups"

const props = defineProps({
  value: {
    type: [Number, String],
    default: null,
  },
  where: {
    type: Object,
    default: () => ({}),
  },
  filters: {
    type: Object,
    default: () => ({}),
  },
  label: {
    type: String,
    default: "Department",
  },
  hint: {
    type: String,
    default: "Search for a department.",
  },
  autoSelectFirst: {
    type: Boolean,
    default: true,
  },
  chips: {
    type: Boolean,
    default: true,
  },
  clearable: {
    type: Boolean,
    default: true,
  },
  hideNoData: {
    type: Boolean,
    default: true,
  },
  hideSelected: {
    type: Boolean,
    default: true,
  },
  noFilter: {
    type: Boolean,
    default: true,
  },
  persistentHint: {
    type: Boolean,
    default: true,
  },
  smallChips: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(["input"])

function updateSearchAndEmitInput(value) {
  emit("input", value)
  updateSearchToken("")
}

const searchToken = ref("")

function updateSearchToken(value) {
  if (value === props.value) return

  searchToken.value = value
  page.value = 1
}

const debouncedUpdateSearchToken = debounce(updateSearchToken, 500)

const searchFilter = computed(() => {
  if (isNil(searchToken.value) || isEmpty(searchToken.value)) return {}

  return {
    search: searchToken.value,
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
  await refresh()
}

watch(
  () => props.value,
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
