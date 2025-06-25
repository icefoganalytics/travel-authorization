<template>
  <v-dialog
    v-model="showDialog"
    persistent
    max-width="80%"
  >
    <v-form
      ref="form"
      @submit.prevent="updateAndClose"
    >
      <v-card :loading="isLoading">
        <v-card-title class="blue">
          <div class="text-h5">Edit Transportation</div>
        </v-card-title>

        <v-card-text>
          <v-row class="mt-5 mx-0">
            <v-col
              cols="12"
              md="3"
            >
              <TransportationTypeSelect
                v-model="otherTransportation.transportationType"
                label="Request Type *"
                :rules="[required]"
                outlined
                required
              />
            </v-col>
            <v-col
              class="d-none d-md-block"
              md="9"
            ></v-col>
          </v-row>
          <v-row class="mt-0 mx-0">
            <v-col
              cols="12"
              md="3"
            >
              <LocationsAutocomplete
                v-model="otherTransportation.depart"
                label="Depart *"
                item-value="city"
                :rules="[required]"
                outlined
                required
              />
            </v-col>
            <v-col
              cols="12"
              md="3"
            >
              <LocationsAutocomplete
                v-model="otherTransportation.arrive"
                label="Arrive *"
                item-value="city"
                :rules="[required]"
                outlined
                required
              />
            </v-col>
            <v-col
              cols="12"
              md="2"
            >
              <v-text-field
                v-model="otherTransportation.date"
                label="Date *"
                type="date"
                :min="minDate"
                :max="maxDate"
                :rules="[required]"
                outlined
                required
              />
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <v-textarea
                v-model="otherTransportation.additionalNotes"
                label="Additional Information"
                outlined
                clearable
              />
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer />
          <v-btn
            :loading="isLoading"
            color="grey darken-5"
            @click="close"
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
import { cloneDeep } from "lodash"

import { required } from "@/utils/validators"
import useSnack from "@/use/use-snack"
import travelDeskOtherTransportationsApi from "@/api/travel-desk-other-transportations-api"

import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
import TransportationTypeSelect from "@/components/travel-desk-other-transportations/TransportationTypeSelect.vue"

defineProps({
  travelDeskTravelRequestId: {
    type: Number,
    required: true,
  },
  minDate: {
    type: String,
    default: null,
  },
  maxDate: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(["saved"])

const otherTransportation = ref({})
const otherTransportationId = computed(() => otherTransportation.value.id)

const snack = useSnack()
const router = useRouter()
const route = useRoute()
const showDialog = ref(false)

/** @type {import("vue").Ref<InstanceType<typeof import("vuetify/lib").VForm> | null>} */
const form = ref(null)
const isLoading = ref(false)

watch(
  () => showDialog.value,
  (value) => {
    if (value) {
      if (route.query.showOtherTransportationEdit === otherTransportationId.value?.toString()) {
        return
      }

      router.push({ query: { showOtherTransportationEdit: otherTransportationId.value } })
    } else {
      router.push({ query: { showOtherTransportationEdit: undefined } })
    }
  }
)

function show(newOtherTransportation) {
  otherTransportation.value = cloneDeep(newOtherTransportation)
  showDialog.value = true
}

function close() {
  showDialog.value = false
  resetState()
  form.value?.resetValidation()
}

async function updateAndClose() {
  if (!form.value?.validate()) {
    snack("Please fill in all required fields", { color: "error" })
    return
  }

  isLoading.value = true
  try {
    const { travelDeskOtherTransportation: newOtherTransportation } =
      await travelDeskOtherTransportationsApi.update(
        otherTransportationId.value,
        otherTransportation.value
      )
    close()

    await nextTick()
    emit("saved", newOtherTransportation.id)
    snack("Other transportation request saved successfully", { color: "success" })
  } catch (error) {
    console.error(error)
    snack("Failed to save other transportation request", { color: "error" })
  } finally {
    isLoading.value = false
  }
}

function resetState() {
  otherTransportation.value = {}
}

defineExpose({
  show,
})
</script>

<style scoped></style>
