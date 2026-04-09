<template>
  <v-container class="pa-0 py-md-3 px-md-6">
    <v-form
      ref="form"
      @submit.prevent="createTravelAgency"
    >
      <v-card>
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
                v-model="attributes.agencyName"
                label="Agency Name *"
                variant="outlined"
                required
                :rules="[required]"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="attributes.contactName"
                label="Contact Name"
                variant="outlined"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="attributes.contactEmail"
                label="Contact Email"
                type="email"
                :rules="[isEmail]"
                variant="outlined"
                validate-on="blur"
              />
            </v-col>
            <v-col
              cols="12"
              md="6"
            >
              <v-text-field
                v-model="attributes.contactPhoneNumber"
                label="Contact Phone Number"
                hint="e.g. 123-456-7890"
                type="tel"
                :rules="[isPhoneNumber]"
                variant="outlined"
                validate-on="blur"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col
              cols="12"
              md="8"
            >
              <v-textarea
                v-model="attributes.agencyInfo"
                label="Additional Information"
                clearable
                variant="outlined"
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
            :to="{
              name: 'administration/TravelAgenciesPage',
            }"
          >
            Cancel
          </v-btn>

          <v-btn
            :loading="isLoading"
            class="ml-4"
            color="success"
            type="submit"
            >Save
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-form>
  </v-container>
</template>

<script setup>
import { ref } from "vue"
import { isNil } from "lodash"
import { useRouter } from "vue-router"

import useSnack from "@/use/use-snack"
import { required, isEmail, isPhoneNumber } from "@/utils/validators"
import travelDeskTravelAgenciesApi from "@/api/travel-desk-travel-agencies-api"
import useBreadcrumbs from "@/use/use-breadcrumbs"

/**
 * @template [T=any]
 * @typedef {import("vue").Ref<T>} Ref
 */
/** @typedef {import('vuetify/components').VForm} VForm */

const isLoading = ref(false)

/** @type {Ref<InstanceType<typeof VForm> | null>} */
const form = ref(null)

const attributes = ref({
  agencyName: "",
  agencyInfo: null,
})
const router = useRouter()

const snack = useSnack()

async function createTravelAgency() {
  if (isNil(form.value)) return

  const { valid } = await form.value.validate()
  if (!valid) {
    snack("Please fill in all required fields.", { color: "error" })
    return
  }

  isLoading.value = true
  try {
    await travelDeskTravelAgenciesApi.create(attributes.value)
    return router.push({
      name: "administration/TravelAgenciesPage",
    })
  } catch (error) {
    console.error(error)
    snack(`Failed to create travel agency: ${error}`, { color: "error" })
  } finally {
    isLoading.value = false
  }
}

useBreadcrumbs([
  {
    title: "Administration",
    to: { name: "AdministrationPage" },
  },
  {
    title: "Travel Agencies",
    to: { name: "administration/TravelAgenciesPage" },
  },
  {
    title: "New Travel Agency",
    to: { name: "administration/travel-agencies/TravelAgencyNewPage" },
  },
])
</script>

<style scoped></style>
