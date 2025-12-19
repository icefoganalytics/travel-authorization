<template>
  <v-dialog
    v-model="showDialog"
    persistent
    max-width="1200px"
    @keydown.esc="hide"
  >
    <template #activator="{ on, attrs }">
      <v-btn
        color="primary"
        v-bind="merge(attrs, activatorProps)"
        v-on="on"
      >
        Add Hotel
      </v-btn>
    </template>

    <v-form
      ref="form"
      @submit.prevent="createAndHide"
    >
      <v-card :loading="isLoading">
        <v-card-title>
          <h2>Add Hotel</h2>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col
              cols="12"
              md="4"
            >
              <v-text-field
                v-model="travelDeskHotelAttributes.checkIn"
                label="Check-in Date *"
                type="date"
                :rules="[required]"
                :min="minDate"
                :max="maxDate"
                outlined
                required
              />
              <v-text-field
                v-model="travelDeskHotelAttributes.checkOut"
                label="Check-out Date *"
                type="date"
                :rules="[required]"
                :min="minDate"
                :max="maxDate"
                outlined
                required
              />
              <LocationsAutocomplete
                v-model="travelDeskHotelAttributes.city"
                label="City *"
                item-value="city"
                :rules="[required]"
                outlined
                required
              />
              <v-radio-group
                v-model="travelDeskHotelAttributes.isDedicatedConferenceHotelAvailable"
                label="Conference/Meeting Hotel? *"
                :rules="[required]"
                outlined
                required
                row
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
                v-model="travelDeskHotelAttributes.additionalInformation"
                label="Additional Information"
                rows="8"
                outlined
                clearable
              />
            </v-col>
          </v-row>

          <v-row
            v-if="travelDeskHotelAttributes.isDedicatedConferenceHotelAvailable"
            class="mt-0 mx-3"
          >
            <v-col
              cols="12"
              md="4"
            >
              <v-text-field
                v-model="travelDeskHotelAttributes.conferenceName"
                label="Conference/Meeting Name *"
                :rules="[required]"
                outlined
                required
              />
            </v-col>
            <v-col
              cols="12"
              md="8"
            >
              <v-text-field
                v-model="travelDeskHotelAttributes.conferenceHotelName"
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
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup>
import { ref, nextTick, watchEffect } from "vue"
import { merge } from "lodash"

import { required } from "@/utils/validators"
import useSnack from "@/use/use-snack"
import useRouteQuery, { booleanTransformer } from "@/use/utils/use-route-query"
import travelDeskHotelsApi from "@/api/travel-desk-hotels-api"

import LocationsAutocomplete from "@/components/locations/LocationsAutocomplete.vue"

const props = defineProps({
  activatorProps: {
    type: Object,
    default: () => ({}),
  },
  travelDeskTravelRequestId: {
    type: Number,
    required: true,
  },
  conferenceName: {
    /** @type {string | null} */
    type: String,
    default: null,
  },
  minDate: {
    type: String,
    default: null,
  },
  maxDate: {
    type: String,
    default: null,
  },
  // TODO: consider loading flightStart/End using travelDeskTravelRequestId?
  flightStart: {
    type: String,
    default: null,
  },
  flightEnd: {
    type: String,
    default: null,
  },
})

const emit = defineEmits(["created"])

const showDialog = useRouteQuery("showHotelCreate", false, {
  transform: booleanTransformer,
})

const travelDeskHotelAttributes = ref({
  travelRequestId: props.travelDeskTravelRequestId,
  conferenceName: props.conferenceName,
  checkIn: props.flightStart,
  checkOut: props.flightEnd,
  isDedicatedConferenceHotelAvailable: true,
})

watchEffect(() => {
  travelDeskHotelAttributes.value.travelRequestId = props.travelDeskTravelRequestId
})
watchEffect(() => {
  travelDeskHotelAttributes.value.conferenceName = props.conferenceName
})
watchEffect(() => {
  travelDeskHotelAttributes.value.checkIn = props.flightStart
})
watchEffect(() => {
  travelDeskHotelAttributes.value.checkOut = props.flightEnd
})

/** @type {import("vue").Ref<InstanceType<typeof import("vuetify/lib").VForm> | null>} */
const form = ref(null)
const isLoading = ref(false)
const snack = useSnack()

async function createAndHide() {
  if (!form.value?.validate()) {
    snack.error("Please fill in all required fields")
    return
  }

  if (travelDeskHotelAttributes.value.isDedicatedConferenceHotelAvailable === false) {
    travelDeskHotelAttributes.value.conferenceName = undefined
    travelDeskHotelAttributes.value.conferenceHotelName = undefined
  }

  isLoading.value = true
  try {
    const { travelDeskHotel: newHotel } = await travelDeskHotelsApi.create(
      travelDeskHotelAttributes.value
    )
    hide()

    await nextTick()
    emit("created", newHotel.id)
    snack.success("Hotel request created successfully")
  } catch (error) {
    console.error(error)
    snack.error("Failed to create hotel request")
  } finally {
    isLoading.value = false
  }
}

function hide() {
  showDialog.value = false
  travelDeskHotelAttributes.value = {
    travelRequestId: props.travelDeskTravelRequestId,
    conferenceName: props.conferenceName,
    checkIn: props.flightStart,
    checkOut: props.flightEnd,
    isDedicatedConferenceHotelAvailable: true,
  }
  form.value?.resetValidation()
}
</script>

<style scoped>
.label {
  font-weight: 600;
  font-size: 10pt !important;
}
</style>
