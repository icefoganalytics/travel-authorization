<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
    persistent
    @keydown.esc="close"
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
            @click="close"
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

<script setup>
import { ref, watch, nextTick } from "vue"
import { useRoute, useRouter } from "vue2-helpers/vue-router"

import { useSnack } from "@/plugins/snack-plugin"
import { required, isGeneralLedgerCode } from "@/utils/validators"

import generalLedgerCodingsApi from "@/api/general-ledger-codings-api"

import CurrencyTextField from "@/components/Utils/CurrencyTextField.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const emit = defineEmits(["created"])

const route = useRoute()
const router = useRouter()
const snack = useSnack()

const form = ref(null)
const generalLedgerCoding = ref(build())
const showDialog = ref(route.query.showCreate === "true")
const isLoading = ref(false)

watch(showDialog, (value) => {
  if (value) {
    router.push({ query: { showCreate: value } })
  } else {
    router.push({ query: { showCreate: undefined } })
  }
})

function build() {
  return {
    travelAuthorizationId: props.travelAuthorizationId,
    code: "",
    amount: 0.0,
  }
}

function close() {
  showDialog.value = false
  generalLedgerCoding.value = build()
  form.value.resetValidation()
}

async function createAndClose() {
  if (!form.value.validate()) return

  isLoading.value = true
  try {
    await generalLedgerCodingsApi.create(generalLedgerCoding.value)
    close()
    nextTick(() => {
      emit("created")
    })
  } catch (error) {
    console.error(error)
    snack(error.message, { color: "error" })
  } finally {
    isLoading.value = false
  }
}
</script>
