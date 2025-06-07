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
          <div class="text-h5">Edit Per Diem</div>
        </v-card-title>

        <v-skeleton-loader
          v-if="isNil(perDiem)"
          class="mt-5 mx-3"
          type="list-item@4"
        />
        <v-card-text v-else>
          <v-row class="mt-5 mx-3">
            <v-col cols="12">
              <v-text-field
                :value="claimType"
                label="Claim Type"
                outlined
                readonly
                append-icon="mdi-lock"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                :value="travelRegion"
                label="Travel Region"
                outlined
                readonly
                append-icon="mdi-lock"
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                v-model="perDiem.amount"
                label="Amount *"
                type="number"
                :step="perDiem.amount > 1 ? 0.01 : 0.001"
                :rules="[required]"
                outlined
                required
              />
            </v-col>
            <v-col cols="12">
              <v-text-field
                :value="perDiem.currency"
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
import useSnack from "@/use/use-snack"
import { useI18n } from "@/plugins/vue-i18n-plugin"
import perDiemsApi from "@/api/per-diems-api"
import usePerDiem from "@/use/use-per-diem"

/**
 * @template [T=any]
 * @typedef {import("vue").Ref<T>} Ref
 */
/** @typedef {import('vuetify/lib/components').VForm} VForm */

const emit = defineEmits(["saved"])

/** @type {Ref<number | null>} */
const perDiemId = ref(null)
const { perDiem, isLoading } = usePerDiem(perDiemId)

const { t } = useI18n()
const claimType = computed(() => {
  if (isNil(perDiem.value)) return ""

  const { claimType: value } = perDiem.value
  return t(`per_diem.claim_type.${value}`, { $default: value })
})
const travelRegion = computed(() => {
  if (isNil(perDiem.value)) return ""

  const { travelRegion: value } = perDiem.value
  return t(`per_diem.travel_region.${value}`, { $default: value })
})

const snack = useSnack()
const router = useRouter()
const route = useRoute()
const showDialog = ref(false)

/** @type {Ref<InstanceType<typeof VForm> | null>} */
const form = ref(null)

watch(
  () => route.query.showEditPerDiem,
  (newShowEditPerDiem) => {
    if (!isNil(newShowEditPerDiem)) {
      perDiem.value = null
      perDiemId.value = parseInt(newShowEditPerDiem)
      showDialog.value = true
    } else {
      showDialog.value = false
      perDiem.value = null
      perDiemId.value = null
      form.value?.resetValidation()
    }
  },
  { immediate: true, deep: true }
)

function show(perDiem) {
  router.push({ query: { showEditPerDiem: perDiem.id } })
}

function hide() {
  router.push({ query: { showEditPerDiem: undefined } })
}

async function updateAndClose() {
  if (!form.value?.validate()) {
    snack("Please fill in all required fields", { color: "error" })
    return
  }

  isLoading.value = true
  try {
    const { perDiem: newPerDiem } = await perDiemsApi.update(perDiemId.value, perDiem.value)
    hide()

    await nextTick()
    emit("saved", newPerDiem.id)
    snack("Per diem saved successfully", { color: "success" })
  } catch (error) {
    console.error(error)
    snack("Failed to save per diem", { color: "error" })
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
