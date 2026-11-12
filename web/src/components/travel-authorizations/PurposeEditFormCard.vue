<template>
  <v-skeleton-loader
    v-if="isNil(travelAuthorization)"
    type="card"
  />
  <HeaderActionsFormCard
    v-else
    ref="headerActionsFormCard"
    title="Purpose"
    validate-on="lazy"
  >
    <v-row>
      <v-col
        cols="12"
        md="6"
      >
        <TravelPurposeSelect
          v-model="travelAuthorization.purposeId"
          :rules="[required]"
          density="compact"
          label="Purpose *"
          variant="outlined"
          required
          validate-on="blur"
          @update:model-value="emit('update:travelPurposeId', $event)"
        />
      </v-col>
      <v-col
        cols="12"
        xl="6"
      >
        <v-text-field
          v-model="travelAuthorization.eventName"
          :rules="[required]"
          density="compact"
          label="Name of meeting/conference, mission, trade fair or course *"
          variant="outlined"
          required
          validate-on="blur"
          @update:model-value="emit('update:eventName', $event)"
        />
      </v-col>
      <v-col
        cols="12"
        md="3"
        xl="2"
      >
        <!-- Depending on in territory flag we will load a different list of destinations -->
        <v-checkbox
          v-model="travelAuthorization.allTravelWithinTerritory"
          label="In Territory?"
          density="compact"
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <h3 class="mb-2">Objectives</h3>
        <ul class="mt-0 mb-0 pl-8">
          <li>Purpose of attendance</li>
          <li>Relevance and anticipated benefits to branch and Government of Yukon</li>
        </ul>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-textarea
          v-model="travelAuthorization.benefits"
          :rules="[required]"
          auto-grow
          density="compact"
          label="Objectives *"
          variant="outlined"
          required
          rows="10"
          validate-on="blur"
        />
      </v-col>
    </v-row>

    <template #actions><slot name="actions"></slot></template>
  </HeaderActionsFormCard>
</template>

<script setup lang="ts">
import { ref, toRefs } from "vue"
import { isNil } from "lodash"

import { required } from "@/utils/validators"
import useSnack from "@/use/use-snack"
import useTravelAuthorization from "@/use/use-travel-authorization"

import HeaderActionsFormCard from "@/components/common/HeaderActionsFormCard.vue"
import TravelPurposeSelect from "@/components/travel-purposes/TravelPurposeSelect.vue"

const props = defineProps<{
  travelAuthorizationId: number
}>()

const emit = defineEmits<{
  (event: "update:travelPurposeId", travelPurposeId: number): void
  (event: "update:eventName", eventName: string | null): void
}>()

const { travelAuthorizationId } = toRefs(props)
const { travelAuthorization, save } = useTravelAuthorization(travelAuthorizationId)
const headerActionsFormCard = ref<InstanceType<typeof HeaderActionsFormCard> | null>(null)
const isSaving = ref(false)
const snack = useSnack()

async function saveWrapper() {
  if (isNil(travelAuthorization.value)) return
  if (isNil(headerActionsFormCard.value)) return

  const { valid } = await headerActionsFormCard.value.validate()
  if (!valid) {
    snack.warning("Please fill in all required fields.")
    return
  }

  isSaving.value = true
  try {
    await save({
      purposeId: travelAuthorization.value.purposeId,
      eventName: travelAuthorization.value.eventName,
      allTravelWithinTerritory: travelAuthorization.value.allTravelWithinTerritory,
      benefits: travelAuthorization.value.benefits,
    })
  } catch (error) {
    console.error(`Failed to save travel authorization: ${error}`, { error })
    throw error
  } finally {
    isSaving.value = false
  }
}

defineExpose({
  save: saveWrapper,
  validate: async () => headerActionsFormCard.value?.validate(),
})
</script>
