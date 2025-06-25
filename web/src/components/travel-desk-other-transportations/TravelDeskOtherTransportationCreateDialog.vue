<template>
  <v-dialog
    v-model="showDialog"
    persistent
    max-width="80%"
  >
    <template #activator="{ on, attrs }">
      <v-btn
        color="primary"
        v-bind="attrs"
        v-on="on"
      >
        Add Transportation
      </v-btn>
    </template>

    <v-form
      ref="form"
      @submit.prevent="createAndClose"
    >
      <v-card :loading="isLoading">
        <v-card-title class="blue">
          <div class="text-h5">Add Transportation</div>
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
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup>
import { ref, nextTick, watch } from "vue"
import { useRoute, useRouter } from "vue2-helpers/vue-router"

import { required } from "@/utils/validators"
import useSnack from "@/use/use-snack"
import travelDeskOtherTransportationsApi from "@/api/travel-desk-other-transportations-api"

import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"
import TransportationTypeSelect from "@/components/travel-desk-other-transportations/TransportationTypeSelect.vue"

const props = defineProps({
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

const emit = defineEmits(["created"])

const otherTransportation = ref({
  travelRequestId: props.travelDeskTravelRequestId,
})

const snack = useSnack()
const router = useRouter()
const route = useRoute()
const showDialog = ref(route.query.showOtherTransportationCreate === "true")

/** @type {import("vue").Ref<InstanceType<typeof import("vuetify/lib").VForm> | null>} */
const form = ref(null)
const isLoading = ref(false)

watch(
  () => props.travelDeskTravelRequestId,
  () => {
    resetState()
  },
  { immediate: true }
)

watch(
  () => showDialog.value,
  (value) => {
    if (value) {
      router.push({ query: { showOtherTransportationCreate: "true" } })
    } else {
      router.push({ query: { showOtherTransportationCreate: undefined } })
    }
  }
)

function close() {
  showDialog.value = false
  resetState()
  form.value?.resetValidation()
}

async function createAndClose() {
  if (!form.value?.validate()) {
    snack("Please fill in all required fields", { color: "error" })
    return
  }

  isLoading.value = true
  try {
    const { travelDeskOtherTransportation: newOtherTransportation } =
      await travelDeskOtherTransportationsApi.create(otherTransportation.value)
    close()

    await nextTick()
    emit("created", newOtherTransportation.id)
    snack("Other transportation request created successfully", { color: "success" })
  } catch (error) {
    console.error(error)
    snack("Failed to create other transportation request", { color: "error" })
  } finally {
    isLoading.value = false
  }
}

function resetState() {
  otherTransportation.value = {
    travelRequestId: props.travelDeskTravelRequestId,
  }
}
</script>

<style scoped></style>
