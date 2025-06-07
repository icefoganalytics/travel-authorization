<template>
  <v-dialog
    v-model="showDialog"
    max-width="500px"
    persistent
    @keydown.esc="close"
  >
    <v-form
      ref="form"
      @submit.prevent="updateAndClose"
    >
      <v-card :loading="isLoading">
        <v-card-title>
          <span class="text-h5">Edit Coding</span>
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

<script setup>
import { computed, nextTick, watch, ref } from "vue"
import { cloneDeep } from "lodash"
import { useRoute, useRouter } from "vue2-helpers/vue-router"

import useSnack from "@/use/use-snack"

import generalLedgerCodingsApi from "@/api/general-ledger-codings-api"
import { required, isGeneralLedgerCode } from "@/utils/validators"
import CurrencyTextField from "@/components/Utils/CurrencyTextField.vue"

const emit = defineEmits(["saved"])

const route = useRoute()
const router = useRouter()
const snack = useSnack()

const generalLedgerCoding = ref({})
const showDialog = ref(false)
const isLoading = ref(false)
const form = ref(null)

const generalLedgerCodingId = computed(() => generalLedgerCoding.value.id)

watch(
  () => showDialog.value,
  (value) => {
    if (value) {
      if (route.query.showEdit === generalLedgerCodingId.value.toString()) return

      router.push({ query: { showEdit: generalLedgerCodingId.value } })
    } else {
      router.push({ query: { showEdit: undefined } })
    }
  }
)

function show(newGeneralLedgerCoding) {
  generalLedgerCoding.value = cloneDeep(newGeneralLedgerCoding)
  showDialog.value = true
}

function close() {
  showDialog.value = false
  nextTick(() => {
    generalLedgerCoding.value = {}
    form.value.resetValidation()
  })
}

async function updateAndClose() {
  if (!form.value.validate()) return

  isLoading.value = true
  try {
    await generalLedgerCodingsApi.update(generalLedgerCodingId.value, generalLedgerCoding.value)

    close()

    nextTick(() => {
      emit("saved")
    })
  } catch (error) {
    snack(error.message, { color: "error" })
  } finally {
    isLoading.value = false
  }
}

defineExpose({
  show,
})
</script>
