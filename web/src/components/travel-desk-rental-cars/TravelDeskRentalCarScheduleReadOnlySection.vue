<template>
  <section>
    <v-row>
      <v-col cols="6">
        <StringDateInput
          :model-value="pickUpDate"
          label="Pick-up date *"
          append-inner-icon="mdi-lock"
          variant="outlined"
          readonly
        />
      </v-col>
      <v-col cols="6">
        <TimeTextField
          :model-value="pickUpTime"
          label="Pick-up time *"
          append-inner-icon="mdi-lock"
          variant="outlined"
          readonly
        />
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="6">
        <StringDateInput
          :model-value="dropOffDate"
          label="Drop-off date *"
          append-inner-icon="mdi-lock"
          variant="outlined"
          readonly
        />
      </v-col>
      <v-col cols="6">
        <TimeTextField
          :model-value="dropOffTime"
          label="Drop-off time *"
          append-inner-icon="mdi-lock"
          variant="outlined"
          readonly
        />
      </v-col>
    </v-row>
  </section>
</template>

<script setup lang="ts">
import StringDateInput from "@/components/common/StringDateInput.vue"
import TimeTextField from "@/components/common/TimeTextField.vue"

defineProps<{
  pickUpDate: string
  pickUpTime: string
  dropOffDate: string
  dropOffTime: string
}>()
</script>
