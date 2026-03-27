<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
    persistent
    @keydown.esc="hide"
    @input="hideIfFalse"
  >
    <v-form
      ref="form"
      @submit.prevent="updateAndClose"
    >
      <v-card :loading="isLoading">
        <v-card-title>
          <span class="text-h5">Edit Coding</span>
        </v-card-title>

        <v-skeleton-loader
          v-if="isNil(generalLedgerCodingId) || isNil(generalLedgerCoding)"
          type="card"
        />
        <v-card-text v-else>
          <v-row>
            <v-col>
              <!-- See https://github.com/icefoganalytics/travel-authorization/issues/156#issuecomment-1890047168 -->
              <v-text-field
                v-model="generalLedgerCoding.code"
                :rules="[isGeneralLedgerCode]"
                validate-on-blur
                dense
                outlined
                required
              >
                <template #label>
                  <v-tooltip bottom>
                    <template #activator="{ on }">
                      <div v-on="on">
                        G/L code
                        <v-icon small> mdi-help-circle-outline </v-icon>
                      </div>
                    </template>
                    <span>
                      e.g. 552-123456-2015-1234-12345
                      <br />
                      The format is vote (3 characters) - Program (6 characters) - object code (4
                      digits) - subledger-1 (0-4 characters) - subleger-2 (0-5 characters).</span
                    >
                  </v-tooltip>
                </template>
              </v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <CurrencyTextField
                v-model="generalLedgerCoding.amount"
                :rules="[required]"
                label="Amount"
                dense
                outlined
                required
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            :loading="isLoading"
            color="error"
            @click="hide"
          >
            Cancel
          </v-btn>
          <v-btn
            :loading="isLoading"
            type="submit"
            color="primary"
          >
            Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from "vue"
import { isNil } from "lodash"

import generalLedgerCodingsApi from "@/api/general-ledger-codings-api"
import { required, isGeneralLedgerCode } from "@/utils/validators"
import useGeneralLedgerCoding from "@/use/use-general-ledger-coding"
import useSnack from "@/use/use-snack"
import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import CurrencyTextField from "@/components/Utils/CurrencyTextField.vue"
import { type VForm } from "vuetify/lib/components"

const emit = defineEmits<{
  (event: "saved"): void
}>()

const generalLedgerCodingId = useRouteQuery("showEdit", undefined, {
  transform: integerTransformer,
})
const { generalLedgerCoding, isLoading } = useGeneralLedgerCoding(generalLedgerCodingId)

const form = ref<InstanceType<typeof VForm> | null>(null)
const snack = useSnack()

async function updateAndClose() {
  if (!form.value?.validate()) return
  if (isNil(generalLedgerCodingId.value)) return
  if (isNil(generalLedgerCoding.value)) return

  isLoading.value = true
  try {
    await generalLedgerCodingsApi.update(generalLedgerCodingId.value, generalLedgerCoding.value)

    hide()

    await nextTick()
    emit("saved")
  } catch (error) {
    console.error(`Failed to update general ledger coding: ${error}`, { error })
    snack.error(`Failed to update general ledger coding: ${error}`)
  } finally {
    isLoading.value = false
  }
}

const showDialog = ref(false)

watch(
  generalLedgerCodingId,
  (newGeneralLedgerCodingId) => {
    if (isNil(newGeneralLedgerCodingId)) {
      showDialog.value = false
      generalLedgerCoding.value = null
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

async function hide() {
  showDialog.value = false
  generalLedgerCodingId.value = undefined

  await nextTick()
  generalLedgerCoding.value = null
  form.value?.resetValidation()
}

function hideIfFalse(value: boolean | null) {
  if (value !== false) return

  hide()
}

defineExpose({
  show,
})
</script>
