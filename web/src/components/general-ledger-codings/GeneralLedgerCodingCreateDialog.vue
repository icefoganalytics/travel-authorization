<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
    @keydown.esc="hide"
    @update:model-value="hideIfFalse"
  >
    <template #activator="{ props: activatorProps }">
      <v-btn v-bind="activatorProps"> Add Coding </v-btn>
    </template>

    <v-form
      ref="formRef"
      @submit.prevent="createAndClose"
    >
      <v-card :loading="isLoading">
        <v-card-title>
          <span class="text-h5">Create Coding</span>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col>
              <v-text-field
                v-model="generalLedgerCoding.code"
                :rules="[isGeneralLedgerCode]"
                validate-on="blur"
                density="compact"
                variant="outlined"
                required
                label="G/L code"
                hint="e.g. 552-123456-2015-1234-12345 — Vote (3) - Program (6) - Object (4) - Subledger 1 (0-4) - Subledger 2 (0-5)"
                persistent-hint
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <CurrencyTextField
                v-model="generalLedgerCoding.amount"
                :rules="[required]"
                label="Amount"
                density="compact"
                variant="outlined"
                required
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            :loading="isLoading"
            color="error"
            @click="hide"
          >
            Cancel
          </v-btn>
          <v-btn
            :loading="isLoading"
            color="primary"
            type="submit"
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

import { type VForm } from "vuetify/components"

import { required, isGeneralLedgerCode } from "@/utils/validators"
import useRouteQuery, { booleanTransformer } from "@/use/utils/use-route-query"

import generalLedgerCodingsApi from "@/api/general-ledger-codings-api"
import useSnack from "@/use/use-snack"

import CurrencyTextField from "@/components/common/CurrencyTextField.vue"

const props = defineProps<{
  travelAuthorizationId: number
}>()

const emit = defineEmits<{
  created: [void]
}>()

const showDialog = useRouteQuery("showCreateGLCoding", "false", {
  transform: booleanTransformer,
})

const generalLedgerCoding = ref({
  travelAuthorizationId: props.travelAuthorizationId,
  code: "",
  amount: 0.0,
})

const formRef = ref<InstanceType<typeof VForm> | null>(null)
const snack = useSnack()
const isLoading = ref(false)

async function createAndClose() {
  if (isNil(formRef.value)) return

  const { valid } = await formRef.value.validate()
  if (!valid) {
    snack.warning("Please fill in all required fields.")
    return
  }

  isLoading.value = true
  try {
    await generalLedgerCodingsApi.create(generalLedgerCoding.value)
    hide()

    await nextTick()
    emit("created")
  } catch (error) {
    console.error(`Failed to create general ledger coding: ${error}`, { error })
    snack.error(`Failed to create general ledger coding: ${error}`)
  } finally {
    isLoading.value = false
  }
}

watch(
  () => showDialog.value,
  () => {
    reset()
  }
)

watch(
  () => props.travelAuthorizationId,
  () => {
    reset()
  }
)

function reset() {
  formRef.value?.resetValidation()
  generalLedgerCoding.value = {
    travelAuthorizationId: props.travelAuthorizationId,
    code: "",
    amount: 0.0,
  }
}

function hide() {
  showDialog.value = false
}

function hideIfFalse(value: boolean | null) {
  if (value !== false) return

  hide()
}
</script>
