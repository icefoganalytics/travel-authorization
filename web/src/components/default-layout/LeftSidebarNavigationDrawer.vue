<template>
  <v-navigation-drawer
    v-model="showDrawer"
    :rail="showRail"
    mobile-breakpoint="lg"
    expand-on-hover
  >
    <v-list>
      <v-list-item
        v-for="listItem in listItems"
        :key="listItem.key"
        :to="listItem.to"
        :prepend-icon="listItem.prependIcon"
        :title="listItem.title"
      />
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import { useDisplay } from "vuetify"

import { ENVIRONMENT } from "@/config"
import useCurrentUser from "@/use/use-current-user"

type ListItem = {
  key: string
  prependIcon: string
  title: string
  to: {
    name: string
  }
}

const { isAdmin, isDepartmentAdmin, isFinanceUser, isPreApprovedTravelAdmin, isTravelDeskUser } =
  useCurrentUser()

const isInDevelopmentOrUserAcceptanceTesting =
  ENVIRONMENT === "development" || window.location.hostname === "travel-auth-dev.ynet.gov.yk.ca"

const dashboardListItem: ListItem = {
  key: "dashboard",
  title: "Dashboard",
  to: {
    name: "DashboardPage",
  },
  prependIcon: "mdi-view-dashboard",
}

const myTravelRequestsListItem: ListItem = {
  key: "myTravelRequests",
  title: "My Travel Requests",
  to: {
    name: "my-travel-requests/MyTravelRequestsPage",
  },
  prependIcon: "mdi-airplane",
}

const travelPreApprovalsListItem: ListItem = {
  key: "travelPreApprovals",
  title: "Travel Pre-Approvals",
  to: {
    name: "travel-pre-approvals/TravelPreApprovalRequestsPage",
  },
  prependIcon: "mdi-check-circle",
}

const travelDeskListItem: ListItem = {
  key: "travelDesk",
  title: "Travel Desk",
  to: {
    name: "TravelDeskPage",
  },
  prependIcon: "mdi-airplane",
}

const travelRequestsListItem: ListItem = {
  key: "travelRequests",
  title: "Travel Requests",
  to: {
    name: "TravelRequests",
  },
  prependIcon: "mdi-file-document-edit",
}

const flightExpensesListItem: ListItem = {
  key: "flightExpenses",
  title: "Flight Expenses",
  to: {
    name: "flight-expenses/AllFlightExpensesPage",
  },
  prependIcon: "mdi-cash",
}

const reportsListItem: ListItem = {
  key: "reports",
  title: "Reports",
  to: {
    name: "reports/ReportsTablePage",
  },
  prependIcon: "mdi-chart-bar",
}

const manageTravelRequestsListItem: ListItem = {
  key: "manageTravelRequests",
  title: "Manage Travel Requests",
  to: {
    name: "ManageTravelRequests",
  },
  prependIcon: "mdi-account-tie",
}

const expenseProcessingListItem: ListItem = {
  key: "expenseProcessing",
  title: "Expense Processing",
  to: {
    name: "ExpenseProcessingPage",
  },
  prependIcon: "mdi-calculator",
}

const qaScenariosListItem: ListItem = {
  key: "qaScenarios",
  title: "QA Scenarios",
  to: {
    name: "qa/ScenariosListPage",
  },
  prependIcon: "mdi-tools",
}

const listItems = computed<ListItem[]>(() => {
  if (isAdmin.value || isDepartmentAdmin.value) {
    const adminListItems = [
      dashboardListItem,
      myTravelRequestsListItem,
      travelPreApprovalsListItem,
      travelDeskListItem,
      travelRequestsListItem,
      flightExpensesListItem,
      reportsListItem,
      manageTravelRequestsListItem,
      expenseProcessingListItem,
    ]

    if (isInDevelopmentOrUserAcceptanceTesting) {
      adminListItems.push(qaScenariosListItem)
    }

    return adminListItems
  } else if (isFinanceUser.value) {
    return [dashboardListItem, myTravelRequestsListItem, expenseProcessingListItem]
  } else if (isPreApprovedTravelAdmin.value) {
    return [dashboardListItem, myTravelRequestsListItem, travelPreApprovalsListItem]
  } else if (isTravelDeskUser.value) {
    return [dashboardListItem, myTravelRequestsListItem, travelDeskListItem]
  } else {
    return [dashboardListItem, myTravelRequestsListItem]
  }
})

const { lgAndUp } = useDisplay()
const showDrawer = ref(lgAndUp.value)
const showRail = ref(false)

function toggle() {
  if (lgAndUp.value) {
    showRail.value = !showRail.value
  } else {
    showDrawer.value = !showDrawer.value
  }
}

defineExpose({
  toggle,
})
</script>
