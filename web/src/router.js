import Vue from "vue"
import VueRouter from "vue-router"

import { authGuard } from "@/utils/auth-guard"

import FlightEstimate from "@/components/Administration/RatesEstimateManagement/AirEstimate"
import PoolCarCost from "@/components/Administration/RatesEstimateManagement/PoolCarCost"
import RentalCarEstimates from "@/components/Administration/RatesEstimateManagement/RentalCarEstimate"

import preapprovedRouter from "@/modules/preapproved/router"
import travelDeskRouter from "@/modules/travelDesk/router"
import travelAuthorizationsRouter from "@/modules/travel-authorizations/router"
import flightExpenseRouter from "@/modules/flightExpenses/router"
import reportsRouter from "@/modules/reports/router"

Vue.use(VueRouter)

const routes = [
  {
    path: "/",
    component: () => import("@/layouts/DefaultLayout.vue"),
    children: [
      {
        path: "",
        redirect: "dashboard",
      },
      {
        name: "DashboardPage",
        path: "dashboard",
        component: () => import("@/pages/DashboardPage"),
      },
      {
        name: "Profile",
        path: "profile",
        component: () => import("@/pages/UserProfilePage"),
      },
      {
        component: () => import("@/layouts/LayoutWithBreadcrumbs.vue"),
        path: "",
        children: [
          {
            name: "TravelDeskPage",
            path: "travel-desk",
            component: () => import("@/pages/TravelDeskPage.vue"),
          },
          {
            name: "TravelDeskReadPage",
            path: "travel-desk/:travelDeskTravelRequestId",
            component: () => import("@/pages/travel-desk/TravelDeskReadPage.vue"),
            props: true,
          },
          {
            name: "TravelDeskEditPage",
            path: "travel-desk/:travelDeskTravelRequestId/edit",
            component: () => import("@/pages/travel-desk/TravelDeskEditPage.vue"),
            props: true,
          },
          {
            name: "TravelDeskFlightSegmentsManagePage",
            path: "travel-desk/:travelDeskTravelRequestId/manage-flight-segments",
            component: () => import("@/pages/travel-desk/TravelDeskFlightSegmentsManagePage.vue"),
            props: true,
          },
        ],
      },
      {
        // TODO: push readcrumbs into higher layout
        path: "",
        component: () => import("@/layouts/LayoutWithBreadcrumbs.vue"),
        children: [
          {
            path: "/administration",
            name: "AdministrationPage",
            component: () => import("@/pages/AdministrationPage.vue"),
          },
          {
            path: "administration/users/:userId/edit",
            name: "administration/users/UserEditPage",
            component: () => import("@/pages/administration/users/UserEditPage.vue"),
            props: true,
          },
          {
            path: "/administration/users",
            name: "administration/UsersPage",
            component: () => import("@/pages/administration/UsersPage.vue"),
          },
          {
            path: "/administration/purpose",
            name: "Administration/LookupTableManagement/Purpose",
            component: () =>
              import("@/components/Administration/LookupTableManagement/Purpose.vue"),
          },
          {
            path: "/administration/travel-rates",
            name: "administration/TravelRatesPage",
            component: () => import("@/pages/administration/TravelRatesPage.vue"),
          },
          {
            path: "TravelRatesPage/administration/travel-rates/edit",
            name: "administration/TravelRatesEditPage",
            component: () => import("@/pages/administration/TravelRatesEditPage.vue"),
          },
          {
            path: "administration/travel-agencies",
            name: "administration/TravelAgenciesPage",
            component: () => import("@/pages/administration/TravelAgenciesPage.vue"),
          },
          {
            path: "administration/travel-agencies/new",
            name: "administration/travel-agencies/TravelAgencyNewPage",
            component: () =>
              import("@/pages/administration/travel-agencies/TravelAgencyNewPage.vue"),
          },
          {
            path: "administration/travel-agencies/:travelDeskTravelAgencyId/edit",
            name: "administration/travel-agencies/TravelAgencyEditPage",
            component: () =>
              import("@/pages/administration/travel-agencies/TravelAgencyEditPage.vue"),
            props: true,
          },
        ],
      },
      {
        path: "administration/flightEstimate",
        name: "FlightEstimate",
        component: FlightEstimate,
      },
      {
        path: "administration/poolCarCost",
        name: "PoolCarCost",
        component: PoolCarCost,
      },
      {
        path: "administration/rentalCarEstimates",
        name: "RentalCarEstimates",
        component: RentalCarEstimates,
      },
      {
        path: "qa/scenarios",
        name: "Qa-Scenarios",
        component: () => import("@/pages/qa/ScenariosListPage"),
      },
      {
        path: "health-check",
        name: "HealthCheck",
        component: () => import("@/pages/HealthCheckPage"),
        meta: { requiresAuth: false },
      },
    ],
  },

  ...preapprovedRouter,
  ...travelDeskRouter,
  ...travelAuthorizationsRouter,
  ...flightExpenseRouter,
  ...reportsRouter,
  {
    path: "",
    component: () => import("@/layouts/DefaultLayout.vue"),
    children: [
      {
        // TODO: push readcrumbs into higher layout
        path: "",
        component: () => import("@/layouts/LayoutWithBreadcrumbs.vue"),
        children: [
          {
            path: "my-travel-requests",
            name: "my-travel-requests/MyTravelRequestsPage",
            component: () => import("@/pages/my-travel-requests/MyTravelRequestsPage.vue"),
          },
          {
            path: "my-travel-requests/:travelAuthorizationId",
            component: () =>
              import("@/layouts/travel-authorizations/MyTravelAuthorizationWizardLayout.vue"),
            props: true,
            children: [
              {
                path: "",
                redirect: "details",
              },
              {
                path: "details",
                name: "my-travel-requests/details/DetailsPage",
                component: () => import("@/pages/my-travel-requests/details/DetailsPage.vue"),
                props: true,
              },
              {
                path: "details/edit-purpose",
                name: "my-travel-requests/details/DetailsEditPurposePage",
                component: () =>
                  import("@/pages/my-travel-requests/details/DetailsEditPurposePage.vue"),
                props: true,
              },
              {
                path: "details/edit-trip",
                name: "my-travel-requests/details/DetailsEditTripPage",
                component: () =>
                  import("@/pages/my-travel-requests/details/DetailsEditTripPage.vue"),
                props: true,
              },
              {
                path: "details/submit",
                name: "my-travel-requests/details/DetailsSubmitPage",
                component: () => import("@/pages/my-travel-requests/details/DetailsSubmitPage.vue"),
                props: true,
              },
              {
                path: "estimate",
                name: "my-travel-requests/estimate/EstimatePage",
                component: () => import("@/pages/my-travel-requests/estimate/EstimatePage.vue"),
                props: true,
              },
              {
                path: "estimate/edit",
                name: "my-travel-requests/estimate/EstimateEditPage",
                component: () => import("@/pages/my-travel-requests/estimate/EstimateEditPage.vue"),
                props: true,
              },
              {
                path: "awaiting-approval",
                name: "my-travel-requests/AwaitingApprovalPage",
                component: () => import("@/pages/my-travel-requests/AwaitingApprovalPage.vue"),
                props: true,
              },
              {
                path: "request",
                name: "my-travel-requests/request/RequestPage",
                component: () => import("@/pages/my-travel-requests/request/RequestPage"),
                props: true,
              },
              {
                path: "request/edit-travel-details",
                name: "my-travel-requests/request/RequestEditTravelDetailsPage",
                component: () =>
                  import("@/pages/my-travel-requests/request/RequestEditTravelDetailsPage"),
                props: true,
              },
              {
                path: "request/edit",
                name: "my-travel-requests/request/RequestEditPage",
                component: () => import("@/pages/my-travel-requests/request/RequestEditPage"),
                props: true,
              },
              {
                path: "awaiting-request-options",
                name: "my-travel-requests/AwaitingRequestOptionsPage",
                component: () =>
                  import("@/pages/my-travel-requests/AwaitingRequestOptionsPage.vue"),
                props: true,
              },
              {
                path: "request/rank-options",
                name: "my-travel-requests/request/RequestOptionsProvidedPage",
                component: () =>
                  import("@/pages/my-travel-requests/request/RequestOptionsProvidedPage.vue"),
                props: true,
              },
              {
                path: "awaiting-request-booking",
                name: "my-travel-requests/AwaitingRequestBookingPage",
                component: () =>
                  import("@/pages/my-travel-requests/AwaitingRequestBookingPage.vue"),
                props: true,
              },
              {
                path: "expense",
                name: "my-travel-requests/expense/ExpensePage",
                component: () => import("@/pages/my-travel-requests/expense/ExpensePage.vue"),
                props: true,
              },
              {
                path: "expense/edit",
                name: "my-travel-requests/expense/ExpenseEditPage",
                component: () => import("@/pages/my-travel-requests/expense/ExpenseEditPage.vue"),
                props: true,
              },
              {
                path: "awaiting-travel-start",
                name: "my-travel-requests/AwaitingTravelStartPage",
                component: () => import("@/pages/my-travel-requests/AwaitingTravelStartPage.vue"),
                props: true,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    name: "SignInPage",
    path: "/sign-in",
    component: () => import("@/pages/SignInPage.vue"),
    meta: { requiresAuth: false },
  },
  {
    name: "UnauthorizedPage",
    path: "/errors/unauthorized",
    component: () => import("@/pages/UnauthorizedPage.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "*",
    name: "Not Found",
    component: () => import("@/pages/NotFoundPage"),
    meta: { requiresAuth: false },
  },
]

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
})

router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth === false) return next()

  const isAuthenticated = await authGuard(to)
  if (isAuthenticated) return next()

  return next(false)
})

export default router
