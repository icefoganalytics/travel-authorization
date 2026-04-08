<template>
  <v-skeleton-loader
    v-if="isLoading"
    type="card"
  />
  <div v-else>
    <h1 class="d-flex justify-space-between">
      User

      <v-btn
        v-if="isAdmin"
        color="primary"
        :to="{
          name: 'administration/users/UserEditPage',
          params: {
            userId,
          },
        }"
      >
        Edit
      </v-btn>
    </h1>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <DescriptionElement
          label="First name"
          :value="user.firstName"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <DescriptionElement
          label="Last name"
          :value="user.lastName"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="6"
        class="d-flex align-center"
      >
        <DescriptionElement
          label="Email"
          :value="user.email"
        />
        <v-btn
          class="ml-2 my-0"
          title="Copy email to clipboard"
          icon
          size="small"
          @click="copyToClipboard(user.email, 'Email copied to clipboard')"
        >
          <v-icon>mdi-content-copy</v-icon>
        </v-btn>
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <DescriptionElement
          label="Status"
          :value="formatStatus(user.status)"
        />
      </v-col>
    </v-row>

    <v-divider class="my-6"></v-divider>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <DescriptionElement
          label="Manager"
          :value="user.manager"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <DescriptionElement
          label="Mail code"
          :value="user.mailcode"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <DescriptionElement
          label="Department"
          :value="user.department"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <DescriptionElement
          label="Division"
          :value="user.division"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <DescriptionElement
          label="Branch"
          :value="user.branch"
        />
      </v-col>
      <v-col
        cols="12"
        md="6"
      >
        <DescriptionElement
          label="Unit"
          :value="user.unit"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <h2>Roles</h2>

        <v-chip
          v-for="(role, index) in user.roles"
          :key="index"
          class="ma-2"
          color="info"
        >
          {{ formatRole(role) }}
        </v-chip>
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import useBreadcrumbs from "@/use/use-breadcrumbs"
import useCurrentUser from "@/use/use-current-user"
import useSnack from "@/use/use-snack"
import useUser from "@/use/use-user"

import DescriptionElement from "@/components/common/DescriptionElement.vue"

const props = defineProps({
  userId: {
    type: [String, Number],
    required: true,
  },
})

const userId = computed(() => parseInt(props.userId))
const { user, isLoading } = useUser(userId)

const { isAdmin } = useCurrentUser()

const { t } = useI18n()

function formatRole(value) {
  return t(`role.name.${value}`, value)
}

function formatStatus(value) {
  return t(`global.status.${value}`, value)
}

const snack = useSnack()

async function copyToClipboard(text, message = "Copied to clipboard") {
  try {
    await navigator.clipboard.writeText(text)
    snack.success(message)
  } catch (error) {
    console.error(`Failed to copy to clipboard: ${error}`)
    snack.error(`Failed to copy to clipboard: ${error}`)
  }
}

const userDisplayName = computed(() =>
  [user.value.firstName, user.value.lastName].filter(Boolean).join(" ")
)

const breadcrumbs = computed(() => [
  // TODO: consider if there should be "Users" page that is accessible to everyone?
  {
    title: "Users",
    disabled: true,
  },
  {
    title: isLoading.value === true ? "..." : userDisplayName.value,
    disabled: true,
  },
])
useBreadcrumbs(breadcrumbs)
</script>
