<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
  >
    <v-card :loading="isLoading">
      <v-card-title class="text-h5">
        Are you sure you want to delete the following coding?
      </v-card-title>
      <v-card-text>
        <div v-if="hasGeneralLedgerCoding">
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
        <v-spacer></v-spacer>
        <v-btn
          color="secondary"
          :loading="isLoading"
          @click="close"
          >Cancel</v-btn
        >
        <v-btn
          color="error"
          :loading="isLoading"
          @click="deleteAndClose"
          >OK</v-btn
        >
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { isEmpty } from "lodash"
import { computed, ref, nextTick, watch } from "vue"
import { useRoute, useRouter } from "vue2-helpers/vue-router"

import useSnack from "@/use/use-snack"

import generalLedgerCodingsApi from "@/api/general-ledger-codings-api"

const emit = defineEmits(["deleted"])

const route = useRoute()
const router = useRouter()
const snack = useSnack()

const generalLedgerCoding = ref({})
const showDialog = ref(false)
const isLoading = ref(false)

const generalLedgerCodingId = computed(() => generalLedgerCoding.value.id)
const hasGeneralLedgerCoding = computed(() => !isEmpty(generalLedgerCoding.value))

watch(
  () => showDialog.value,
  (value) => {
    if (value) {
      if (route.query.showDelete === generalLedgerCodingId.value.toString()) return

      router.push({ query: { showDelete: generalLedgerCodingId.value } })
    } else {
      router.push({ query: { showDelete: undefined } })
    }
  }
)

function show(newGeneralLedgerCoding) {
  generalLedgerCoding.value = newGeneralLedgerCoding
  showDialog.value = true
}

function close() {
  showDialog.value = false
}

async function deleteAndClose() {
  isLoading.value = true
  try {
    await generalLedgerCodingsApi.delete(generalLedgerCodingId.value)

    close()
    nextTick(() => {
      emit("deleted")
    })
  } catch (error) {
    snack(error.message, { color: "error" })
  } finally {
    isLoading.value = false
  }
}

function formatCurrency(amount) {
  const formatter = new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  })
  return formatter.format(amount)
}

defineExpose({
  show,
})
</script>
