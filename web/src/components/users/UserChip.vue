<template>
  <v-chip
    ref="chip"
    class="d-flex-inline justify-center"
    style="min-width: fit-content"
    link
    variant="outlined"
  >
    <v-progress-circular
      v-if="isNil(user)"
      size="20"
      width="2"
      indeterminate
    />
    <template v-else>
      {{ user.firstName }} {{ user.lastName }}
      <v-icon end>mdi-menu-down</v-icon>
    </template>
    <v-progress-circular
      v-if="isNil(user)"
      size="20"
      width="2"
      indeterminate
    />
    <v-menu
      v-else
      :activator="chip?.$el"
      :close-on-content-click="false"
      :offset="8"
      transition="scale-transition"
    >
      <v-card width="300">
        <v-card-text class="d-flex align-center">
          <v-img
            :src="gravatarUrl"
            class="mr-3"
            width="40"
            height="40"
          ></v-img>
          <div class="flex-grow-1">
            <div class="text-body-1 font-weight-bold">{{ user.firstName }} {{ user.lastName }}</div>
            <div class="text-body-2 text-wrap">{{ user.email }}</div>
          </div>
          <v-btn
            icon="mdi-link"
            size="small"
            variant="text"
            :to="userProfileLink"
          />
        </v-card-text>
        <v-divider></v-divider>
        <v-card-text>
          <div class="d-flex align-center ga-3">
            <v-icon>mdi-account</v-icon>
            <div class="text-body-2 text-wrap">{{ user.email }}</div>
            <v-btn
              size="x-small"
              icon="mdi-content-copy"
              title="Copy email to clipboard"
              variant="text"
              @click="copyToClipboard(user.email)"
            />
          </div>
          <template
            v-for="(field, index) in fields"
            :key="index"
          >
            <div
              v-if="user[field]"
              class="text-body-2 text-wrap mt-2"
            >
              {{ String(user[field]) }}
            </div>
          </template>
        </v-card-text>
      </v-card>
    </v-menu>
  </v-chip>
</template>

<script setup lang="ts">
import { computed, ref, toRefs } from "vue"
import md5 from "md5"
import { isNil } from "lodash"

import { type VChip } from "vuetify/components"

import useCurrentUser from "@/use/use-current-user"
import useSnack from "@/use/use-snack"
import useUser, { type User } from "@/use/use-user"

const props = withDefaults(
  defineProps<{
    userId?: number | null
  }>(),
  {
    userId: null,
  }
)

const { userId } = toRefs(props)
const { user } = useUser(userId)

const chip = ref<InstanceType<typeof VChip> | null>(null)

const fields = ref<(keyof User)[]>([
  "manager",
  "mailcode",
  "department",
  "division",
  "branch",
  "unit",
])

const gravatarUrl = computed(() => {
  if (isNil(user.value?.email)) {
    return ""
  }

  const normalizedEmail = user.value.email.trim().toLowerCase()
  const hash = md5(normalizedEmail)
  return `https://www.gravatar.com/avatar/${hash}`
})

const { currentUser } = useCurrentUser()
const isCurrentUser = computed(() => !isNil(props.userId) && props.userId === currentUser.value?.id)

const userProfileLink = computed(() => {
  if (isCurrentUser.value) {
    return {
      name: "ProfilePage",
    }
  }

  return {
    name: "users/UserPage",
    params: {
      userId: props.userId,
    },
  }
})

const snack = useSnack()

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    snack.success("Email copied")
  } catch (error) {
    console.error(`Failed to copy to clipboard: ${error}`)
    snack.error(`Failed to copy to clipboard: ${error}`)
  }
}
</script>
