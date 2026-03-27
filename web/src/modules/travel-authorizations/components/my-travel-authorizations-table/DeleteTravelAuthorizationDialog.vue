<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
    @keydown.esc="hide"
    @input="hideIfFalse"
  >
    <v-card>
      <v-card-title class="text-h5">
        Are you sure you want to delete the following travel authorization request?
      </v-card-title>
      <v-skeleton-loader
        v-if="isNil(travelAuthorizationId) || isNil(travelAuthorization)"
        type="card"
      />
      <v-card-text v-else>
        <div>
          <v-row no-gutters>
            <v-col class="text-center">{{ eventNameText }}</v-col>
          </v-row>
          <v-row no-gutters>
            <v-col class="text-center">{{ purposeText }}</v-col>
          </v-row>
          <v-row no-gutters>
            <v-col class="text-center">{{ statusText }}</v-col>
          </v-row>
          <v-row no-gutters>
            <v-col class="text-center">{{ territoryText }}</v-col>
          </v-row>
          <v-row no-gutters>
            <v-col class="text-center">{{ objectivesText }}</v-col>
          </v-row>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          color="secondary"
          :loading="isLoading"
          @click="hide"
          >Cancel</v-btn
        >
        <v-btn
          color="error"
          :loading="isLoading"
          @click="deleteAndHide"
          >OK</v-btn
        >
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue"
import { isNil } from "lodash"

import travelAuthorizations from "@/api/travel-authorizations-api"
import { useI18n } from "@/plugins/vue-i18n-plugin"
import useSnack from "@/use/use-snack"
import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import useTravelAuthorization from "@/use/use-travel-authorization"

const emit = defineEmits<{
  (event: "deleted"): void
}>()

const travelAuthorizationId = useRouteQuery("showDelete", undefined, {
  transform: integerTransformer,
})
const { travelAuthorization, isLoading } = useTravelAuthorization(travelAuthorizationId)

const showDialog = ref(false)
const eventNameText = computed(
  () => travelAuthorization.value?.eventName || "No trip name provided"
)
const purposeText = computed(() => formatPurpose(travelAuthorization.value?.purpose?.purpose))
const statusText = computed(() => formatStatus(travelAuthorization.value?.status))
const territoryText = computed(() =>
  formatTerritory(travelAuthorization.value?.allTravelWithinTerritory)
)
const objectivesText = computed(() => formatObjectives(travelAuthorization.value?.benefits))

const snack = useSnack()

async function deleteAndHide() {
  if (isNil(travelAuthorizationId.value)) return

  isLoading.value = true
  try {
    await travelAuthorizations.delete(travelAuthorizationId.value)
    hide()

    await nextTick()
    emit("deleted")
  } catch (error) {
    console.error(`Failed to delete travel authorization: ${error}`, { error })
    snack.error(`Failed to delete travel authorization: ${error}`)
  } finally {
    isLoading.value = false
  }
}

function formatPurpose(value: string | null | undefined) {
  if (isNil(value)) return "Unknown purpose"

  return value
}

const { t } = useI18n()

function formatStatus(value: string | null | undefined) {
  if (isNil(value)) return "Unknown"

  return t(`global.status.${value}`, { $default: "Unknown" })
}

function formatTerritory(value: boolean | null | undefined) {
  if (isNil(value)) return "In Territory: Unknown"

  return value ? "In Territory: Yes" : "In Territory: No"
}

function formatObjectives(value: string | null | undefined) {
  if (isNil(value)) return "No objectives provided"

  return value
}

watch(
  travelAuthorizationId,
  (newTravelAuthorizationId) => {
    if (isNil(newTravelAuthorizationId)) {
      showDialog.value = false
      travelAuthorization.value = null
      return
    }

    showDialog.value = true
  },
  {
    immediate: true,
  }
)

function show(newTravelAuthorizationId: number) {
  travelAuthorizationId.value = newTravelAuthorizationId
}

function hide() {
  travelAuthorizationId.value = undefined
}

function hideIfFalse(value: boolean | null) {
  if (value !== false) return

  hide()
}

defineExpose({
  show,
})
</script>
