<template>
  <v-autocomplete
    :value="value"
    :loading="isLoading"
    :items="allYgEmployees"
    :label="label"
    :hint="hint"
    :item-value="itemValue"
    :item-text="itemText"
    :auto-select-first="autoSelectFirst"
    :chips="chips"
    :clearable="clearable"
    :hide-selected="hideSelected"
    :no-filter="noFilter"
    :persistent-hint="persistentHint"
    :small-chips="smallChips"
    v-bind="$attrs"
    v-on="$listeners"
    @input="emit('input', $event)"
    @update:search-input="debouncedUpdateSearchToken"
    @click:clear="reset"
  >
    <!-- TODO: triggers => [Vuetify] assert: staticList should not be called if slots are used -->
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
import { debounce, isEmpty, isNil, uniqBy } from "lodash"

import useYgEmployee from "@/use/use-yg-employee"
import useYgEmployees from "@/use/use-yg-employees"

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
    default: "Employee",
  },
  hint: {
    type: String,
    default: "Search for an employee.",
  },
  itemValue: {
    type: String,
    default: "fullName",
  },
  itemText: {
    type: String,
    default: "fullName",
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

const ygEmployeeId = computed(() => {
  if (props.itemText !== "id") return null

  return props.value
})
const { ygEmployee } = useYgEmployee(ygEmployeeId)

const searchToken = ref("")

function updateSearchToken(value) {
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

const ygEmployeesQuery = computed(() => {
  return {
    where: props.where,
    filters: {
      ...props.filters,
      ...searchFilter.value,
    },
    perPage: perPage.value,
    page: page.value,
  }
})
const { ygEmployees, totalCount, isLoading, refresh } = useYgEmployees(ygEmployeesQuery)

const allYgEmployees = computed(() => {
  if (isNil(ygEmployee.value)) {
    return ygEmployees.value
  }

  return uniqBy([...ygEmployees.value, ygEmployee.value], "id")
})

async function reset() {
  searchToken.value = ""
  ygEmployee.value = null
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
