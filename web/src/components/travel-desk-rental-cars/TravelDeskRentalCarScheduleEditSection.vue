<template>
  <section>
    <v-row>
      <v-col cols="6">
        <StringDateInput
          v-model="pickUpDate"
          label="Pick-up date *"
          :picker-date="tripStartDate"
          :min="tripStartDate"
          :max="tripEndDate"
          :rules="[required]"
          variant="outlined"
          required
        />
      </v-col>
      <v-col cols="6">
        <TimeTextField
          v-model="pickUpTime"
          label="Pick-up time *"
          :rules="[required]"
          variant="outlined"
          required
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <StringDateInput
          v-model="dropOffDate"
          label="Drop-off date *"
          :picker-date="tripStartDate"
          :min="tripStartDate"
          :max="tripEndDate"
          :rules="[required]"
          variant="outlined"
          required
        />
      </v-col>
      <v-col cols="6">
        <TimeTextField
          v-model="dropOffTime"
          label="Drop-off time *"
          :rules="[required]"
          variant="outlined"
          required
        />
      </v-col>
    </v-row>
  </section>
</template>

<script setup lang="ts">
import { required } from "@/utils/validators"

import StringDateInput from "@/components/common/StringDateInput.vue"
import TimeTextField from "@/components/common/TimeTextField.vue"

defineProps<{
  tripStartDate?: string | null
  tripEndDate?: string | null
}>()

const pickUpDate = defineModel<string>("pickUpDate", { required: true })
const pickUpTime = defineModel<string>("pickUpTime", { required: true })
const dropOffDate = defineModel<string>("dropOffDate", { required: true })
const dropOffTime = defineModel<string>("dropOffTime", { required: true })
</script>
