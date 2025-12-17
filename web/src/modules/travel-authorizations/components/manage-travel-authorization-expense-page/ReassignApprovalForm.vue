<template>
  <v-skeleton-loader
    v-if="isNil(travelAuthorization)"
    type="card"
  />
  <v-form
    v-else
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

<script setup lang="ts">
import { ref, toRefs } from "vue"
import { isNil } from "lodash"
import { useRouter } from "vue2-helpers/vue-router"
import { type VForm } from "vuetify/lib/components"

import { required } from "@/utils/validators"

import useSnack from "@/use/use-snack"
import useTravelAuthorization from "@/use/use-travel-authorization"

import UserEmailSearchableCombobox from "@/components/users/UserEmailSearchableCombobox.vue"

const props = defineProps<{
  travelAuthorizationId: number
}>()

const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization, isLoading, save } = useTravelAuthorization(travelAuthorizationId)

const form = ref<InstanceType<typeof VForm> | null>(null)
const snack = useSnack()
const router = useRouter()

async function reassign() {
  if (!form.value?.validate()) return

  try {
    // TODO: if we want to track re-assigment we should add an action specific endpoint
    await save()
    snack.success("Travel authorization reassigned.")

    // must redirect away from the current page, as re-assigment might revoke the user's permissions to
    // access the said page.
    router.push({
      name: "ManageTravelRequests",
    })
  } catch (error) {
    console.error(`Failed to reassign travel authorization: ${error}`, { error })
    snack.error(`Failed to reassign travel authorization: ${error}`)
  }
}
</script>
