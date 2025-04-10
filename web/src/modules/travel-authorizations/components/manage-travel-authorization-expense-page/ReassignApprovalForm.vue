<template>
  <v-form
    ref="form"
    :loading="isLoading"
  >
    <v-row>
      <v-col
        cols="12"
        md="3"
      >
        <UserEmailSearchableCombobox
          v-model="travelAuthorization.supervisorEmail"
          :rules="[required]"
          label="Reassign to"
          dense
          outlined
          required
        />
      </v-col>
      <v-col
        cols="12"
        md="3"
      >
        <v-btn
          :loading="isLoading"
          class="mt-0"
          color="primary"
          @click="reassign"
        >
          Reassign
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue2-helpers/vue-router"

import { required } from "@/utils/validators"

import { useSnack } from "@/plugins/snack-plugin"
import useTravelAuthorization from "@/use/use-travel-authorization"

import UserEmailSearchableCombobox from "@/components/users/UserEmailSearchableCombobox.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
})

const form = ref(null)
const snack = useSnack()
const router = useRouter()

const { travelAuthorization, isLoading, save } = useTravelAuthorization(props.travelAuthorizationId)

async function reassign() {
  try {
    // TODO: if we want to track re-assigment we should add an action specific endpoint
    await save()
    snack("Travel authorization reassigned.", { color: "success" })

    // must redirect away from the current page, as re-assigment might revoke the user's permissions to
    // access the said page.
    router.push({
      name: "ManageTravelRequests",
    })
  } catch (error) {
    snack(error.message, { color: "error" })
  }
}
</script>
