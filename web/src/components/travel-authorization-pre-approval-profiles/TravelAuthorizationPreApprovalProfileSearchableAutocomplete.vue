<template>
  <v-autocomplete
    :model-value="modelValue"
    :loading="isLoading"
    :items="allTravelAuthorizationPreApprovalProfiles"
    :label="label"
    :hint="hint"
    :no-data-text="noDataText"
    item-value="id"
    auto-select-first
    chips
    clearable
    hide-selected
    no-filter
    persistent-hint
    small-chips
    v-bind="$attrs"
    @update:model-value="emit('update:modelValue', $event)"
    @update:search-input="debouncedUpdateSearchToken"
    @click:clear="reset"
  >
    <template #chip="{ item, props: chipProps }">
      <TravelAuthorizationPreApprovalProfileChip
        v-if="!isNil(item.raw.id)"
        v-bind="chipProps"
        :travel-authorization-pre-approval-profile-id="item.raw.id"
      />
      <v-chip
        v-else
        :text="'Unknown#' + (item.raw.id || JSON.stringify(item.raw))"
      />
    </template>
    <template #item="{ item, props: itemProps }">
      <TravelAuthorizationPreApprovalProfileListItem
        v-if="!isNil(item.raw.id)"
        :travel-authorization-pre-approval-profile-id="item.raw.id"
        v-bind="itemProps"
      />
      <v-list-item
        v-else
        v-bind="itemProps"
        :title="'Unknown#' + (item.raw.id || JSON.stringify(item.raw))"
      />
    </template>

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

import useTravelAuthorizationPreApprovalProfile from "@/use/use-travel-authorization-pre-approval-profile"
import useTravelAuthorizationPreApprovalProfiles from "@/use/use-travel-authorization-pre-approval-profiles"

import TravelAuthorizationPreApprovalProfileChip from "@/components/travel-authorization-pre-approval-profiles/TravelAuthorizationPreApprovalProfileChip.vue"
import TravelAuthorizationPreApprovalProfileListItem from "@/components/travel-authorization-pre-approval-profiles/TravelAuthorizationPreApprovalProfileListItem.vue"

const props = defineProps({
  modelValue: {
    /** @type {number | null | undefined} */
    type: Number,
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
    default: "Pre-approved travel for (if applicable)",
  },
  hint: {
    type: String,
    default: "Search for a pre-approval.",
  },
  noDataText: {
    type: String,
    default: "No pre-approvals available",
  },
})

const emit = defineEmits(["update:modelValue"])

const travelAuthorizationPreApprovalProfileId = computed(() => props.modelValue)
const { travelAuthorizationPreApprovalProfile } = useTravelAuthorizationPreApprovalProfile(
  travelAuthorizationPreApprovalProfileId
)

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

const travelAuthorizationPreApprovalProfilesQuery = computed(() => {
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
const { travelAuthorizationPreApprovalProfiles, totalCount, isLoading, refresh } =
  useTravelAuthorizationPreApprovalProfiles(travelAuthorizationPreApprovalProfilesQuery)

const allTravelAuthorizationPreApprovalProfiles = computed(() => {
  if (isNil(travelAuthorizationPreApprovalProfile.value)) {
    return travelAuthorizationPreApprovalProfiles.value
  }

  return uniqBy(
    [...travelAuthorizationPreApprovalProfiles.value, travelAuthorizationPreApprovalProfile.value],
    "id"
  )
})

async function reset() {
  searchToken.value = ""
  travelAuthorizationPreApprovalProfile.value = null
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
