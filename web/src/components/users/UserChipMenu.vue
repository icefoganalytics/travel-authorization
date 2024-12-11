<template>
  <v-menu
    v-model="menu"
    :close-on-content-click="false"
    offset-y
    transition="scale-transition"
  >
    <template #activator="{ on }">
      <v-chip
        class="d-flex-inline justify-center"
        style="min-width: 150px"
        color="teal"
        text-color="white"
        pill
        v-on="on"
      >
        <v-progress-circular
          v-if="isLoading"
          size="20"
          width="2"
          color="white"
          indeterminate
        ></v-progress-circular>
        <template v-else>
          {{ user.firstName }} {{ user.lastName }}
          <v-icon right>mdi-menu-down</v-icon>
        </template>
      </v-chip>
    </template>

    <v-card width="300">
      <v-list dark>
        <v-list-item>
          <v-list-item-avatar>
            <v-img :src="gravatarUrl"></v-img>
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ user.firstName }} {{ user.lastName }}</v-list-item-title>
            <v-list-item-subtitle>{{ user.email }}</v-list-item-subtitle>
          </v-list-item-content>
          <v-list-item-action>
            <v-btn
              icon
              :to="userProfileLink"
            >
              <v-icon>mdi-link</v-icon>
            </v-btn>
          </v-list-item-action>
        </v-list-item>
      </v-list>
      <v-list dense>
        <v-list-item>
          <v-list-item-icon>
            <v-icon>mdi-account</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>{{ user.email }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <template v-for="(field, index) in fields">
          <v-list-item
            v-if="user[field]"
            :key="index"
          >
            <v-list-item-content>
              <v-list-item-subtitle>{{ user[field] }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-list>
    </v-card>
  </v-menu>
</template>

<script setup>
import { computed, ref, toRefs } from "vue"
import md5 from "md5"
import { isNil } from "lodash"

import useCurrentUser from "@/use/use-current-user"
import useUser from "@/use/use-user"

const props = defineProps({
  userId: {
    type: Number,
    default: () => null,
  },
})

const { userId } = toRefs(props)
const { user, isLoading } = useUser(userId)

const menu = ref(false)
const fields = ref(["manager", "mailcode", "department", "division", "branch", "unit"])

const gravatarUrl = computed(() => {
  if (isNil(user.value.email)) {
    return ""
  }

  const normalizedEmail = user.value.email.trim().toLowerCase()
  const hash = md5(normalizedEmail)
  return `https://www.gravatar.com/avatar/${hash}`
})

const { currentUser } = useCurrentUser()
const isCurrentUser = computed(() => !isNil(props.userId) && props.userId === currentUser.value?.id)

const userProfileLink = computed(() => {
  return isCurrentUser.value ? "/profile" : `/users/${props.userId}`
})
</script>
