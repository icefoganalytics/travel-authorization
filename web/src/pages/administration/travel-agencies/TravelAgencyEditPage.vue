<template>
  <v-container class="pa-0 py-md-3 px-md-6">
    <v-form
      ref="form"
      @submit.prevent="validateAndSave"
    >
      <v-skeleton-loader
        v-if="isNil(travelDeskTravelAgency)"
        type="card"
      />
      <v-card
        v-else
        :loading="isLoading"
      >
        <v-card-title>
          <h2>Create Travel Agency</h2>
        </v-card-title>
        <v-card-text>
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="travelDeskTravelAgency.agencyName"
                label="Agency Name *"
                outlined
                required
                :rules="[required]"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="travelDeskTravelAgency.contactName"
                label="Contact Name"
                outlined
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="travelDeskTravelAgency.contactEmail"
                label="Contact Email"
                type="email"
                :rules="[isEmail]"
                outlined
                validate-on-blur
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="travelDeskTravelAgency.contactPhoneNumber"
                label="Contact Phone Number"
                hint="e.g. 123-456-7890"
                type="tel"
                :rules="[isPhoneNumber]"
                outlined
                validate-on-blur
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col
              cols="12"
              md="8"
            >
              <v-textarea
                v-model="travelDeskTravelAgency.agencyInfo"
                label="Additional Information"
                clearable
                outlined
              />
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn
            :loading="isLoading"
            color="warning"
            outlined
            :to="{
              name: 'administration/TravelAgenciesPage',
            }"
          >
            Back
          </v-btn>

          <v-btn
            :loading="isLoading"
            class="ml-4"
            color="primary"
            type="submit"
            >Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-container>
</template>

<script setup>
import { ref, toRefs } from "vue"
import { isNil } from "lodash"

import useSnack from "@/use/use-snack"
import { required, isEmail, isPhoneNumber } from "@/utils/validators"
import useBreadcrumbs from "@/use/use-breadcrumbs"
import useTravelDeskTravelAgency from "@/use/use-travel-desk-travel-agency"

/**
 * @template [T=any]
 * @typedef {import("vue").Ref<T>} Ref
 */
/** @typedef {import('vuetify/lib').VForm} VForm */

/**
 * @type {{
 *   travelDeskTravelAgencyId: string | number
 * }}
 */
const props = defineProps({
  travelDeskTravelAgencyId: {
    type: [String, Number],
    required: true,
  },
})

const { travelDeskTravelAgencyId } = toRefs(props)
const { travelDeskTravelAgency, isLoading, save } =
  useTravelDeskTravelAgency(travelDeskTravelAgencyId)

/** @type {Ref<InstanceType<typeof VForm> | null>} */
const form = ref(null)
const snack = useSnack()

async function validateAndSave() {
  if (!form.value?.validate()) {
    snack("Please fill in all required fields.", { color: "error" })
    return
  }

  isLoading.value = true
  try {
    await save()
    return
  } catch (error) {
    console.error(error)
    snack(`Failed to save travel agency: ${error}`, { color: "error" })
  } finally {
    isLoading.value = false
  }
}

useBreadcrumbs([
  {
    text: "Administration",
    to: { name: "AdministrationPage" },
  },
  {
    text: "Travel Agencies",
    to: { name: "administration/TravelAgenciesPage" },
  },
  {
    text: "Edit Travel Agency",
    to: { name: "administration/travel-agencies/TravelAgencyEditPage" },
  },
])
</script>

<style scoped></style>
