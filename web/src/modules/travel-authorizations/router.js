import { cast } from "@/utils/vue-router-utils"

const routes = [
  {
    path: "/travel-requests",
    component: () => import("@/layouts/DefaultLayout.vue"),
    children: [
      {
        path: ":travelAuthorizationId",
        component: () => import("@/layouts/travel-authorizations/TravelAuthorizationLayout.vue"),
        props: true,
        children: [
          {
            path: "",
            redirect: "details/edit",
          },
          {
            path: "details/edit",
            name: "EditTravelAuthorizationDetailsPage",
            component: () =>
              import(
                "@/modules/travel-authorizations/pages/EditTravelAuthorizationDetailsPage.vue"
              ),
            props: true,
          },
          {
            path: "estimate/edit",
            name: "EditTravelAuthorizationEstimatePage",
            component: () =>
              import("@/modules/travel-authorizations/pages/EditTravelAuthorizationEstimatePage"),
            props: cast("travelAuthorizationId", parseInt),
          },
          {
            path: "expense/edit",
            name: "EditTravelAuthorizationExpensePage",
            component: () =>
              import("@/modules/travel-authorizations/pages/EditTravelAuthorizationExpensePage"),
            props: cast("travelAuthorizationId", parseInt),
          },
        ],
      },
      {
        path: ":travelAuthorizationId",
        component: () =>
          import("@/layouts/travel-authorizations/TravelAuthorizationManageLayout.vue"),
        props: true,
        children: [
          {
            path: "",
            redirect: "details/manage",
          },
          {
            name: "ManageTravelAuthorizationDetailsPage",
            path: "details/manage",
            component: () =>
              import("@/modules/travel-authorizations/pages/ManageTravelAuthorizationDetailsPage"),
            props: cast("travelAuthorizationId", parseInt),
          },
          {
            path: "estimate/manage",
            name: "ManageTravelAuthorizationEstimatePage",
            component: () =>
              import("@/modules/travel-authorizations/pages/ManageTravelAuthorizationEstimatePage"),
            props: cast("travelAuthorizationId", parseInt),
          },
          {
            path: "expense/manage",
            name: "ManageTravelAuthorizationExpensePage",
            component: () =>
              import("@/modules/travel-authorizations/pages/ManageTravelAuthorizationExpensePage"),
            props: cast("travelAuthorizationId", parseInt),
          },
        ],
      },
    ],
  },
]

export default routes
