<template>
  <v-dialog
    v-model="showDialog"
    width="500"
    @keydown.esc="close"
  >
    <template #activator="{ on, attrs }">
      <v-btn
        :disabled="isLoading"
        :loading="isLoading"
        color="primary"
        v-bind="attrs"
        v-on="on"
      >
        Create Travel Request
      </v-btn>
    </template>

    <v-form
      ref="form"
      @submit.prevent="createAndGoToFormDetails"
    >
      <v-card>
        <v-card-title class="text-h5"> Create Travel Request </v-card-title>

        <v-card-text :loading="isLoading">
          <p>Create travel request for:</p>

          <UserEmailSearchableCombobox
            v-model="travelerEmail"
            label="Traveler Email"
            outlined
            required
          />
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            :loading="isLoading"
            color="secondary"
            @click="close"
            >Cancel</v-btn
          >

          <v-tooltip
            v-if="isDisabled"
            bottom
          >
            <template #activator="{ on }">
              <span v-on="on">
                <v-btn
                  class="ml-2"
                  color="success"
                  type="submit"
                  disabled
                  >Create (?)</v-btn
                >
              </span>
            </template>
            <span>Traveler email required.</span>
          </v-tooltip>
          <v-btn
            v-else
            :loading="isLoading"
            class="ml-2"
            color="success"
            type="submit"
            >Create</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup>
import { computed, ref, watch } from "vue"
import { useRoute, useRouter } from "vue2-helpers/vue-router"
import { isEmpty } from "lodash"

import { ACCOMMODATION_TYPES, TRAVEL_METHODS } from "@/api/travel-segments-api"
import travelAuthorizationsApi, {
  STATUSES as TRAVEL_AUTHORIZATION_STATUSES,
} from "@/api/travel-authorizations-api"

import useSnack from "@/use/use-snack"

import UserEmailSearchableCombobox from "@/components/users/UserEmailSearchableCombobox.vue"

const snack = useSnack()
const route = useRoute()
const router = useRouter()

const form = ref(null)
const showDialog = ref(route.query.showCreate === "true")
const travelerEmail = ref(null)

const isDisabled = computed(() => isEmpty(travelerEmail.value))
const isLoading = ref(false)

async function createAndGoToFormDetails() {
  isLoading.value = true
  try {
    const { travelAuthorization } = await travelAuthorizationsApi.create({
      userAttributes: {
        email: travelerEmail.value,
      },
      status: TRAVEL_AUTHORIZATION_STATUSES.DRAFT,
      travelSegmentEstimatesAttributes: [
        {
          isActual: false,
          segmentNumber: 1,
          modeOfTransport: TRAVEL_METHODS.AIRCRAFT,
          accommodationType: ACCOMMODATION_TYPES.HOTEL,
        },
        {
          isActual: false,
          segmentNumber: 2,
          modeOfTransport: TRAVEL_METHODS.AIRCRAFT,
          accommodationType: null,
        },
      ],
    })
    snack.success("Travel authorization created.")
    return router.push({
      name: "manage-travel-requests/ManageTravelRequestEditPurposeDetailsPage",
      params: {
        travelAuthorizationId: travelAuthorization.id,
      },
    })
  } catch (error) {
    console.error(`Error creating travel authorization: ${error}`, { error })
    snack.error(`Error creating travel authorization: ${error}`)
  } finally {
    isLoading.value = false
  }
}

function close() {
  showDialog.value = false
  form.value.resetValidation()
}

watch(
  () => showDialog.value,
  (newShowDialog) => {
    if (newShowDialog) {
      router.push({ query: { showCreate: newShowDialog } })
    } else {
      router.push({ query: { showCreate: undefined } })
    }
  }
)
</script>
