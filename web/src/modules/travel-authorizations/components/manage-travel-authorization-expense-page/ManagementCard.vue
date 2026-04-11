<template>
  <v-skeleton-loader
    v-if="isNil(travelAuthorization)"
    type="card"
  />
  <v-card v-else>
    <v-form ref="form">
      <v-card-text>
        <v-row>
          <v-col
            cols="12"
            md="4"
            class="d-flex ga-2"
          >
            <v-btn
              class="flex-grow-1"
              color="success"
              @click="approve"
            >
              Approve
            </v-btn>
            <v-btn
              class="flex-grow-1"
              color="error"
              @click="deny"
            >
              Deny
            </v-btn>
          </v-col>
          <v-col
            cols="12"
            md="6"
          >
            <UserEmailSearchableCombobox
              v-model="travelAuthorization.supervisorEmail"
              :rules="[required]"
              label="Reassign to"
              density="compact"
              hide-details="auto"
              required
              variant="outlined"
            />
          </v-col>
          <v-col
            cols="12"
            md="2"
          >
            <v-btn
              class="mt-0"
              block
              :loading="isLoadingTravelAuthorization"
              @click="reassign"
            >
              Reassign
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-form>
  </v-card>
</template>

<script setup lang="ts">
import { toRefs, useTemplateRef } from "vue"
import { isNil } from "lodash"
import { useRouter } from "vue-router"

import { required } from "@/utils/validators"

import useSnack from "@/use/use-snack"
import travelAuthorizationApi from "@/api/travel-authorizations-api"
import useTravelAuthorization from "@/use/use-travel-authorization"

import UserEmailSearchableCombobox from "@/components/users/UserEmailSearchableCombobox.vue"

const props = defineProps<{
  travelAuthorizationId: number
}>()

const emit = defineEmits(["approved", "denied"])

const { travelAuthorizationId } = toRefs(props)
const {
  travelAuthorization,
  isLoading: isLoadingTravelAuthorization,
  save,
} = useTravelAuthorization(travelAuthorizationId)

const form = useTemplateRef("form")
const snack = useSnack()
const router = useRouter()

async function reassign() {
  if (isNil(form.value)) return

  const { valid } = await form.value.validate()
  if (!valid) {
    snack.warning("Please fill in all required fields.")
    return
  }

  try {
    // TODO: if we want to track re-assignment we should add an action specific endpoint.
    await save()
    snack.success("Travel authorization reassigned.")

    // must redirect away from the current page, as re-assignment might revoke the user's
    // permissions to access the said page.
    await router.push({
      name: "ManageTravelRequests",
    })
  } catch (error) {
    console.error(`Failed to reassign travel authorization: ${error}`, { error })
    snack.error(`Failed to reassign travel authorization: ${error}`)
  }
}

async function approve() {
  try {
    await travelAuthorizationApi.approveExpenseClaim(props.travelAuthorizationId)
    snack.success("Travel authorization approved!")
    emit("approved", props.travelAuthorizationId)
  } catch (error) {
    console.error(`Failed to approve travel authorization: ${error}`, { error })
    snack.error(`Failed to approve travel authorization: ${error}`)
  }
}

async function deny() {
  try {
    await travelAuthorizationApi.deny(props.travelAuthorizationId)
    snack.success("Travel authorization denied!")
    emit("denied", props.travelAuthorizationId)
  } catch (error) {
    console.error(`Failed to deny travel authorization: ${error}`, { error })
    snack.error(`Failed to deny travel authorization: ${error}`)
  }
}
</script>
