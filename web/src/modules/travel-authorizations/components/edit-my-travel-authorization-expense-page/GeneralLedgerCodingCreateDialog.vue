<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
    persistent
    @keydown.esc="hide"
    @input="hideIfFalse"
  >
    <template #activator="{ on, attrs }">
      <v-btn
        color="primary"
        dark
        class="mb-2"
        v-bind="attrs"
        v-on="on"
      >
        Add Coding
      </v-btn>
    </template>

    <v-form
      ref="form"
      @submit.prevent="createAndClose"
    >
      <v-card :loading="isLoading">
        <v-card-title>
          <span class="text-h5">Create Coding</span>
        </v-card-title>

        <v-card-text>
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
import { ref, watch, nextTick } from "vue"

import { type VForm } from "vuetify/lib/components"

import { required, isGeneralLedgerCode } from "@/utils/validators"
import useRouteQuery, { booleanTransformer } from "@/use/utils/use-route-query"

import generalLedgerCodingsApi from "@/api/general-ledger-codings-api"
import useSnack from "@/use/use-snack"

import CurrencyTextField from "@/components/Utils/CurrencyTextField.vue"

const props = defineProps<{
  travelAuthorizationId: number
}>()

// TODO: switch to `created: [void]` syntax in vue 3
const emit = defineEmits<{
  (event: "created"): void
}>()

const showDialog = useRouteQuery("showCreateGLCoding", "false", {
  transform: booleanTransformer,
})

const generalLedgerCoding = ref({
  travelAuthorizationId: props.travelAuthorizationId,
  code: "",
  amount: 0.0,
})

const form = ref<InstanceType<typeof VForm> | null>(null)
const snack = useSnack()
const isLoading = ref(false)

async function createAndClose() {
  if (!form.value?.validate()) return

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
  form.value?.resetValidation()
  generalLedgerCoding.value = {
    travelAuthorizationId: props.travelAuthorizationId,
    code: "",
    amount: 0.0,
  }
}

function show() {
  showDialog.value = true
}

function hide() {
  showDialog.value = false
}

function hideIfFalse(value: boolean | null) {
  if (value !== false) return

  hide()
}

defineExpose({
  show,
})
</script>
