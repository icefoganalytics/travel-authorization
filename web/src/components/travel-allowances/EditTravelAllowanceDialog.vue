<template>
  <v-dialog
    v-model="showDialog"
    width="500"
    @keydown.esc="hide"
    @click:outside="hide"
  >
    <v-form
      ref="form"
      @submit.prevent="updateAndClose"
    >
      <v-card :loading="isLoading">
        <v-card-title class="blue">
          <div class="text-h5">Edit Travel Allowance</div>
        </v-card-title>

        <v-skeleton-loader
          v-if="isNil(travelAllowance)"
          class="mt-5 mx-3"
          type="list-item@3"
        />
        <v-card-text v-else>
          <v-row class="mt-5 mx-3">
            <v-col cols="12">
              <v-text-field
                :value="allowanceType"
                label="Claim Type"
                outlined
                readonly
                append-icon="mdi-lock"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="travelAllowance.amount"
                label="Amount *"
                type="number"
                :step="travelAllowance.amount > 1 ? 0.01 : 0.001"
                :rules="[required]"
                outlined
                required
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                :value="travelAllowance.currency"
                label="Currency"
                outlined
                readonly
                append-icon="mdi-lock"
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            :loading="isLoading"
            color="grey darken-5"
            @click="hide"
          >
            Cancel
          </v-btn>
          <v-btn
            :loading="isLoading"
            color="green darken-1"
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
import { computed, ref, nextTick, watch } from "vue"
import { useRoute, useRouter } from "vue2-helpers/vue-router"
import { isNil } from "lodash"

import { required } from "@/utils/validators"
import { useI18n } from "@/plugins/vue-i18n-plugin"
import useSnack from "@/use/use-snack"
import travelAllowancesApi from "@/api/travel-allowances-api"
import useTravelAllowance from "@/use/use-travel-allowance"

/**
 * @template [T=any]
 * @typedef {import("vue").Ref<T>} Ref
 */
/** @typedef {import('vuetify/lib/components').VForm} VForm */

const emit = defineEmits(["saved"])

/** @type {Ref<number | null>} */
const travelAllowanceId = ref(null)
const { travelAllowance, isLoading } = useTravelAllowance(travelAllowanceId)

const { t } = useI18n()
const allowanceType = computed(() => {
  if (isNil(travelAllowance.value)) return ""

  const { allowanceType: value } = travelAllowance.value
  return t(`travel_allowance.allowance_type.${value}`, { $default: value })
})

const snack = useSnack()
const router = useRouter()
const route = useRoute()
const showDialog = ref(false)

/** @type {Ref<InstanceType<typeof VForm> | null>} */
const form = ref(null)

watch(
  () => route.query.showEditTravelAllowance,
  (newShowEditTravelAllowance) => {
    if (!isNil(newShowEditTravelAllowance)) {
      travelAllowance.value = null
      travelAllowanceId.value = parseInt(newShowEditTravelAllowance)
      showDialog.value = true
    } else {
      showDialog.value = false
      travelAllowance.value = null
      travelAllowanceId.value = null
      form.value?.resetValidation()
    }
  },
  { immediate: true, deep: true }
)

function show(travelAllowance) {
  router.push({ query: { showEditTravelAllowance: travelAllowance.id } })
}

function hide() {
  router.push({ query: { showEditTravelAllowance: undefined } })
}

async function updateAndClose() {
  if (!form.value?.validate()) {
    snack("Please fill in all required fields", { color: "error" })
    return
  }

  isLoading.value = true
  try {
    const { travelAllowance: newTravelAllowance } = await travelAllowancesApi.update(
      travelAllowanceId.value,
      travelAllowance.value
    )
    hide()

    await nextTick()
    emit("saved", newTravelAllowance.id)
    snack("Travel allowance saved successfully", { color: "success" })
  } catch (error) {
    console.error(error)
    snack("Failed to save travel allowance", { color: "error" })
  } finally {
    isLoading.value = false
  }
}

defineExpose({
  show,
})
</script>

<style scoped>
::v-deep(.v-skeleton-loader__list-item) {
  height: 6rem;
}

::v-deep(.v-skeleton-loader__text) {
  height: 3rem;
}
</style>
