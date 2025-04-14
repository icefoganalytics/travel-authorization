<template>
  <v-dialog
    v-model="showDialog"
    width="500"
  >
    <template #activator="{ on, attrs }">
      <v-btn
        :loading="isLoading"
        :disabled="isDisabled"
        :class="buttonClasses"
        color="warning"
        v-bind="attrs"
        v-on="on"
      >
        Re-assign
      </v-btn>
    </template>

    <v-form
      ref="form"
      @submit.prevent="reAssignAndClose"
    >
      <v-card>
        <v-card-title class="text-h5"> Re-assign Request </v-card-title>

        <v-card-text :loading="isLoading">
          <v-row>
            <v-col>
              <UserEmailSearchableCombobox
                v-model="supervisorEmail"
                :rules="[required]"
                label="Re-assign to *"
                dense
                outlined
                required
                validate-on-blur
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-textarea
                v-model="note"
                :rules="[required]"
                label="Note for the next approver"
                rows="5"
                required
                outlined
              />
            </v-col>
          </v-row>
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
          <v-btn
            :loading="isLoading"
            color="error"
            type="submit"
            >Re-assign</v-btn
          >
        </v-card-actions>
      </v-card>
    </v-form>
  </v-dialog>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue2-helpers/vue-router"

import { required } from "@/utils/validators"

import { useSnack } from "@/plugins/snack-plugin"
import travelAuthorizationApi from "@/api/travel-authorizations-api"
import useRouteQuery from "@/use/utils/use-route-query"

import UserEmailSearchableCombobox from "@/components/users/UserEmailSearchableCombobox.vue"

const props = defineProps({
  travelAuthorizationId: {
    type: Number,
    required: true,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  buttonClasses: {
    type: [String, Array, Object],
    default: null,
  },
})

const showDialog = useRouteQuery("showReAssign", false)
const form = ref(null)
const isLoading = ref(false)

const supervisorEmail = ref(null)
const note = ref(null)

function close() {
  showDialog.value = false
  form.value.resetValidation()
}

const snack = useSnack()
const router = useRouter()

async function reAssignAndClose() {
  if (!form.value.validate()) return

  isLoading.value = true
  try {
    await travelAuthorizationApi.submit(props.travelAuthorizationId, {
      supervisorEmail: supervisorEmail.value,
      travelAuthorizationActionLogAttributes: {
        note: note.value,
      },
    })
    snack.success("Travel authorization re-assigned.")
    await router.replace({
      name: "ManageTravelRequests",
    })
  } catch (error) {
    console.error(error)
    snack.error(`Failed to re-assign travel authorization: ${error}`)
  } finally {
    isLoading.value = false
  }
}
</script>
