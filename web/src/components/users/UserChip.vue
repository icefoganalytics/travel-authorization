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
      offset-y
      transition="scale-transition"
    >
      <v-card width="300">
        <v-list>
          <v-list-item>
            <template #prepend>
              <v-img :src="gravatarUrl"></v-img>
            </template>
            <div>
              <v-list-item-title>{{ user.firstName }} {{ user.lastName }}</v-list-item-title>
              <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
            </div>
            <template #append>
              <v-btn
                icon
                :to="userProfileLink"
              >
                <v-icon>mdi-link</v-icon>
              </v-btn>
            </template>
          </v-list-item>
        </v-list>
        <v-list density="compact">
          <v-list-item
            prepend-icon="mdi-account"
            :title="user.email"
          />
          <template
            v-for="(field, index) in fields"
            :key="index"
          >
            <v-list-item
              v-if="user[field]"
              :subtitle="String(user[field])"
            />
          </template>
        </v-list>
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
</script>
