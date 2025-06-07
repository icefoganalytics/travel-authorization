<template>
  <v-dialog
    :value="showDialog"
    persistent
    max-width="1200px"
    @keydown.esc="hide"
    @input="hideIfFalse"
  >
    <v-form
      ref="form"
      @submit.prevent="updateAndHide"
    >
      <v-skeleton-loader
        v-if="isNil(travelDeskHotelId) || isNil(travelDeskHotel)"
        type="card"
      />
      <v-card
        v-else
        :loading="isLoading"
      >
        <v-card-title>
          <h2>Edit Hotel</h2>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col
              cols="12"
              md="4"
            >
              <v-text-field
                v-model="travelDeskHotel.checkIn"
                label="Check-in Date *"
                type="date"
                :rules="[required]"
                :min="minDate"
                :max="maxDate"
                outlined
                required
              />
              <v-text-field
                v-model="travelDeskHotel.checkOut"
                label="Check-out Date *"
                type="date"
                :rules="[required]"
                :min="minDate"
                :max="maxDate"
                outlined
                required
              />
              <LocationsAutocomplete
                v-model="travelDeskHotel.city"
                label="City *"
                item-value="city"
                :rules="[required]"
                outlined
                required
              />
              <v-radio-group
                v-model="travelDeskHotel.isDedicatedConferenceHotelAvailable"
                label="Conference/Meeting Hotel? *"
                :rules="[required]"
                outlined
                row
                required
              >
                <v-radio
                  label="Yes"
                  :value="true"
                ></v-radio>
                <v-radio
                  label="No"
                  :value="false"
                ></v-radio>
              </v-radio-group>
            </v-col>
            <v-col
              cols="12"
              md="8"
            >
              <v-textarea
                v-model="travelDeskHotel.additionalInformation"
                label="Additional Information"
                rows="8"
                outlined
                clearable
              />
            </v-col>
          </v-row>

          <v-row
            v-if="travelDeskHotel.isDedicatedConferenceHotelAvailable"
            class="mt-0 mx-3"
          >
            <v-col
              cols="12"
              md="4"
            >
              <v-text-field
                v-model="travelDeskHotel.conferenceName"
                :rules="[required]"
                label="Conference/Meeting Name *"
                outlined
                required
              />
            </v-col>
            <v-col
              cols="12"
              md="8"
            >
              <v-text-field
                v-model="travelDeskHotel.conferenceHotelName"
                label="Conference/Meeting Hotel *"
                :rules="[required]"
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
import { ref, nextTick, watch } from "vue"
import { isNil } from "lodash"

import { required } from "@/utils/validators"
import useSnack from "@/use/use-snack"
import useRouteQuery, { integerTransformer } from "@/use/utils/use-route-query"
import travelDeskHotelsApi from "@/api/travel-desk-hotels-api"
import useTravelDeskHotel from "@/use/use-travel-desk-hotel"

import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"

defineProps({
  minDate: {
    type: String,
    default: null,
  },
  maxDate: {
    type: String,
    default: null,
  },
  // TODO: consider computing flightStart/End internally?
  flightStart: {
    type: String,
    default: null,
  },
  flightEnd: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(["saved"])

const travelDeskHotelId = useRouteQuery("showHotelEdit", undefined, {
  transform: integerTransformer,
})

const { travelDeskHotel, isLoading } = useTravelDeskHotel(travelDeskHotelId)

const showDialog = ref(false)

/** @type {import("vue").Ref<InstanceType<typeof import("vuetify/lib").VForm> | null>} */
const form = ref(null)

function show(newTravelDeskHotelId) {
  travelDeskHotelId.value = newTravelDeskHotelId
}

function hide() {
  travelDeskHotelId.value = undefined
}

watch(
  travelDeskHotelId,
  (newTravelDeskHotelId) => {
    if (isNil(newTravelDeskHotelId)) {
      showDialog.value = false
      travelDeskHotel.value = null
      form.value?.resetValidation()
    } else {
      showDialog.value = true
    }
  },
  {
    immediate: true,
  }
)

const snack = useSnack()

async function updateAndHide() {
  if (!form.value?.validate()) {
    snack.error("Please fill in all required fields")
    return
  }

  if (travelDeskHotel.value.isDedicatedConferenceHotelAvailable === false) {
    travelDeskHotel.value.conferenceName = undefined
    travelDeskHotel.value.conferenceHotelName = undefined
  }

  isLoading.value = true
  try {
    const { travelDeskHotel: newTravelDeskHotel } = await travelDeskHotelsApi.update(
      travelDeskHotelId.value,
      travelDeskHotel.value
    )
    hide()

    await nextTick()
    emit("saved", newTravelDeskHotel.id)
    snack.success("Hotel request saved successfully")
  } catch (error) {
    console.error(`Failed to save hotel request: ${error}`)
    snack.error(`Failed to save hotel request: ${error}`)
  } finally {
    isLoading.value = false
  }
}

function hideIfFalse(value) {
  if (value !== false) return

  hide()
}

defineExpose({
  show,
})
</script>

<style scoped></style>
