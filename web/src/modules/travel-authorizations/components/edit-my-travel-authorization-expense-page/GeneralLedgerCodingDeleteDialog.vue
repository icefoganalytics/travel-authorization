<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
    @keydown.esc="hide"
    @input="hideIfFalse"
  >
    <v-card>
      <v-card-title class="text-h5">
        Are you sure you want to delete the following coding?
      </v-card-title>
      <v-skeleton-loader
        v-if="isNil(generalLedgerCodingId) || isNil(generalLedgerCoding)"
        type="card"
      />
      <v-card-text v-else>
        <div>
          <v-row no-gutters>
            <v-col class="text-center">
              {{ generalLedgerCoding.code }}
            </v-col>
          </v-row>
          <v-row no-gutters>
            <v-col class="text-center">
              {{ formatCurrency(generalLedgerCoding.amount) }}
            </v-col>
          </v-row>
        </div>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
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
        <v-spacer />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from "vue"
import { isNil } from "lodash"

import { formatCurrency } from "@/utils/formatters"

import generalLedgerCodingsApi from "@/api/general-ledger-codings-api"

import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"

import useGeneralLedgerCoding from "@/use/use-general-ledger-coding"
import useSnack from "@/use/use-snack"

const emit = defineEmits<{
  (event: "deleted"): void
}>()

const generalLedgerCodingId = useRouteQuery("showDelete", undefined, {
  transform: integerTransformer,
})
const { generalLedgerCoding, isLoading } = useGeneralLedgerCoding(generalLedgerCodingId)
const showDialog = ref(false)
const snack = useSnack()

async function deleteAndHide() {
  if (isNil(generalLedgerCodingId.value)) return

  isLoading.value = true
  try {
    await generalLedgerCodingsApi.delete(generalLedgerCodingId.value)

    hide()

    await nextTick()
    emit("deleted")
  } catch (error) {
    console.error(`Failed to delete general ledger coding: ${error}`, { error })
    snack.error(`Failed to delete general ledger coding: ${error}`)
  } finally {
    isLoading.value = false
  }
}

watch(
  generalLedgerCodingId,
  (newGeneralLedgerCodingId) => {
    if (isNil(newGeneralLedgerCodingId)) {
      showDialog.value = false
      return
    }

    showDialog.value = true
  },
  {
    immediate: true,
  }
)

function show(newGeneralLedgerCodingId: number) {
  generalLedgerCodingId.value = newGeneralLedgerCodingId
}

function hide() {
  generalLedgerCodingId.value = undefined
}

function hideIfFalse(value: boolean | null) {
  if (value !== false) return

  hide()
}

defineExpose({
  show,
})
</script>
