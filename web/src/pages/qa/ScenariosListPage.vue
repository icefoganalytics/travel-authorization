<template>
  <div>
    <h1>QA Scenarios</h1>

    <Breadcrumbs />

    <v-card
      :loading="isLoading"
      class="mx-auto"
      max-width="400"
    >
      <v-card-title> Apply a given QA Scenario </v-card-title>
      <v-card-subtitle>
        The following buttons aggressively mutate database state for the purposes of QA testing.
        This means that any property on the current user could be changed or removed by clicking
        these buttons. Data might be deleted, new data might be created, existing data might be
        completely changed.
        <b>USE AT YOUR OWN RISK!</b>
      </v-card-subtitle>
      <v-list>
        <v-list-item
          v-for="scenario in scenarios"
          :key="scenario"
        >
          <v-list-item-content>
            <v-btn
              :loading="isLoading"
              color="primary"
              @click="triggerScenario(scenario)"
              >{{ scenario }}</v-btn
            >
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-btn
              :loading="isLoading"
              color="primary"
              @click="syncYgEmployeeGroups"
              >Sync YG Employee Groups</v-btn
            >
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-content>
            <v-btn
              :loading="isLoading"
              color="primary"
              @click="syncYgEmployees"
              >Sync YG Employees</v-btn
            >
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-card>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue"

import scenariosApi from "@/api/qa/scenarios-api"
import ygEmployeesApi from "@/api/yg-employees-api"
import ygEmployeeGroupsApi from "@/api/yg-employee-groups-api"
import useSnack from "@/use/use-snack"

import Breadcrumbs from "@/components/Breadcrumbs.vue"

const scenarios = ref([])
const isLoading = ref(true)
const snack = useSnack()

onMounted(async () => {
  await listScenarios()
})

async function listScenarios() {
  isLoading.value = true
  try {
    const { scenarios: newScenarios } = await scenariosApi.list()
    scenarios.value = newScenarios
  } catch (error) {
    console.error(`Failed to list scenarios: ${error}`, { error })
    snack.error(`Failed to list scenarios: ${error}`)
  } finally {
    isLoading.value = false
  }
}

async function triggerScenario(scenario) {
  isLoading.value = true
  try {
    await scenariosApi.create(scenario)
    snack.success(`Scenario ${scenario} triggered successfully`)
  } catch (error) {
    console.error(`Failed to trigger scenario ${scenario}: ${error}`, { error })
    snack.error(`Failed to trigger scenario ${scenario}: ${error}`)
  } finally {
    isLoading.value = false
  }
}

async function syncYgEmployeeGroups() {
  isLoading.value = true
  try {
    await ygEmployeeGroupsApi.sync()
    snack.success("Yg employee groups synced successfully")
  } catch (error) {
    console.error(`Failed to sync Yg employee groups: ${error}`, { error })
    snack.error(`Failed to sync Yg employee groups: ${error}`)
  } finally {
    isLoading.value = false
  }
}

async function syncYgEmployees() {
  isLoading.value = true
  try {
    await ygEmployeesApi.sync()
    snack.success("Yg employees synced successfully")
  } catch (error) {
    console.error(`Failed to sync Yg employees: ${error}`, { error })
    snack.error(`Failed to sync Yg employees: ${error}`)
  } finally {
    isLoading.value = false
  }
}
</script>
