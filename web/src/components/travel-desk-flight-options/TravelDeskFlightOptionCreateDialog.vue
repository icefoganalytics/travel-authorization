<template>
  <v-dialog
    v-model="showDialog"
    persistent
    max-width="1200px"
    @keydown.esc="hide"
  >
    <template #activator="slotData">
      <slot
        name="activator"
        v-bind="slotData"
      >
        <v-btn
          color="primary"
          v-bind="slotData.attrs"
          v-on="slotData.on"
        >
          Add Flight Option
        </v-btn>
      </slot>
    </template>

    <v-form
      ref="form"
      @submit.prevent="createAndHide"
    >
      <v-card :loading="isLoading">
        <v-card-title>
          <h2>Add Flight Option</h2>
        </v-card-title>

        <v-card-text>
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <TravelDeskFlightRequestSelect
                v-model="travelDeskFlightOptionAttributes.flightRequestId"
                label="Leg *"
                :where="{
                  travelRequestId: travelDeskTravelRequestId,
                }"
                :rules="[required]"
                variant="outlined"
                required
              />
            </v-col>
            <v-col
              cols="12"
              md="2"
            >
              <v-text-field
                v-model="travelDeskFlightOptionAttributes.cost"
                label="Cost *"
                type="number"
                :rules="[required]"
                prefix="$"
                variant="outlined"
                required
              />
            </v-col>
            <v-col
              cols="12"
              md="4"
            >
              <v-text-field
                v-model="travelDeskFlightOptionAttributes.duration"
                label="Travel Duration"
                readonly
                variant="outlined"
                append-inner-icon="mdi-lock"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col
              cols="12"
              class="d-flex flex-wrap justify-center gap-4"
            >
              <TravelDeskFlightSegmentAttributesCard
                v-for="(flightSegmentAttributes, index) in flightSegmentsAttributes"
                :key="`segment-${index}`"
                :travel-desk-flight-segment-attributes="flightSegmentAttributes"
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            :loading="isLoading"
            color="warning"
            variant="outlined"
            @click="hide"
          >
            Cancel
          </v-btn>
          <v-btn
            :loading="isLoading"
            color="primary"
            type="submit"
          >
            Create Flight Option
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup>
import { ref, nextTick, computed, watch } from "vue"
import { cloneDeep, isNil } from "lodash"

import { required } from "@/utils/validators"

import travelDeskFlightOptionsApi from "@/api/travel-desk-flight-options-api"

import useRouteQuery from "@/use/utils/use-route-query"
import useSnack from "@/use/use-snack"

import TravelDeskFlightRequestSelect from "@/components/travel-desk-flight-requests/TravelDeskFlightRequestSelect.vue"
import TravelDeskFlightSegmentAttributesCard from "@/components/travel-desk-flight-segments/TravelDeskFlightSegmentAttributesCard.vue"

const props = defineProps({
  travelDeskTravelRequestId: {
    type: Number,
    required: true,
  },
  attributes: {
    type: Object,
    default: () => ({}),
  },
})

const emit = defineEmits(["created"])

const travelDeskFlightOptionAttributes = ref(cloneDeep(props.attributes))

watch(
  () => cloneDeep(props.attributes),
  (newAttributes) => {
    travelDeskFlightOptionAttributes.value = newAttributes
  },
  {
    immediate: true,
    deep: true,
  }
)

const flightSegmentsAttributes = computed(
  () => travelDeskFlightOptionAttributes.value.flightSegmentsAttributes || []
)

const snack = useSnack()
const showDialog = useRouteQuery("showTravelDeskFlightOptionCreate", "false", { transform: Boolean })

/** @type {import("vue").Ref<InstanceType<typeof import("vuetify/components").VForm> | null>} */
const form = ref(null)
const isLoading = ref(false)

function hide() {
  showDialog.value = false
  resetAttributes()
  form.value?.resetValidation()
}

async function createAndHide() {
  if (isNil(form.value)) return

  const { valid } = await form.value.validate()
  if (!valid) {
    snack.warning("Please fill in all required fields.")
    return
  }

  isLoading.value = true
  try {
    const { travelDeskFlightOption } = await travelDeskFlightOptionsApi.create(
      travelDeskFlightOptionAttributes.value
    )
    hide()

    await nextTick()
    emit("created", travelDeskFlightOption.id)
    snack.success("Flight option created successfully")
  } catch (error) {
    snack.error("Failed to create flight option")
  } finally {
    isLoading.value = false
  }
}

function resetAttributes() {
  travelDeskFlightOptionAttributes.value = cloneDeep(props.attributes)
}
</script>

<style scoped>
.gap-4 {
  gap: 1rem; /* 16px */
}
</style>
