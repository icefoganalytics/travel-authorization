import { cast } from "@/utils/vue-router-utils"

const routes = [
  {
    path: "/",
    component: () => import("@/layouts/Layout"),
    children: [
      {
        name: "MyTravelAuthorizationsPage",
        path: "my-travel-requests",
        component: () => import("@/modules/travel-authorizations/pages/MyTravelAuthorizationsPage"),
      },

      {
        name: "ManageTravelAuthorizationsPage",
        path: "manage-travel-requests",
        component: () =>
          import("@/modules/travel-authorizations/pages/ManageTravelAuthorizationsPage"),
      },
    ],
  },
  {
    path: "/my-travel-requests",
    component: () => import("@/layouts/Layout"),
    children: [
      {
        path: ":travelAuthorizationId",
        component: () =>
          import("@/modules/travel-authorizations/layouts/MyTravelAuthorizationLayout"),
        props: cast("travelAuthorizationId", parseInt),
        children: [
          {
            path: "",
            redirect: "details",
          },
          {
            path: "details",
            name: "ReadMyTravelAuthorizationDetailsPage",
            component: () =>
              import("@/modules/travel-authorizations/pages/ReadMyTravelAuthorizationDetailsPage"),
            props: cast("travelAuthorizationId", parseInt),
          },
          {
            path: "details/edit",
            name: "EditMyTravelAuthorizationDetailsPage",
            component: () =>
              import("@/modules/travel-authorizations/pages/EditMyTravelAuthorizationDetailsPage"),
            props: cast("travelAuthorizationId", parseInt),
          },
          {
            path: "estimate",
            name: "ReadMyTravelAuthorizationEstimatePage",
            component: () =>
              import("@/modules/travel-authorizations/pages/ReadMyTravelAuthorizationEstimatePage"),
            props: cast("travelAuthorizationId", parseInt),
          },
          {
            path: "estimate/edit",
            name: "EditMyTravelAuthorizationEstimatePage",
            component: () =>
              import("@/modules/travel-authorizations/pages/EditMyTravelAuthorizationEstimatePage"),
            props: cast("travelAuthorizationId", parseInt),
          },
          {
            path: "request",
            name: "MyTravelRequestsRequestReadPage",
            component: () => import("@/pages/my-travel-requests/MyTravelRequestsRequestReadPage"),
            props: cast("travelAuthorizationId", parseInt),
          },
          {
            path: "request/edit",
            name: "MyTravelRequestsRequestEditPage",
            component: () => import("@/pages/my-travel-requests/MyTravelRequestsRequestEditPage"),
            props: cast("travelAuthorizationId", parseInt),
          },
          {
            path: "expense",
            name: "ReadMyTravelAuthorizationExpensePage",
            component: () =>
              import("@/modules/travel-authorizations/pages/ReadMyTravelAuthorizationExpensePage"),
            props: cast("travelAuthorizationId", parseInt),
          },
          {
            path: "expense/edit",
            name: "EditMyTravelAuthorizationExpensePage",
            component: () =>
              import("@/modules/travel-authorizations/pages/EditMyTravelAuthorizationExpensePage"),
            props: cast("travelAuthorizationId", parseInt),
          },
        ],
      },
    ],
  },
  {
    path: "/travel-requests",
    component: () => import("@/layouts/Layout"),
    children: [
      {
        path: ":travelAuthorizationId",
        component: () =>
          import("@/modules/travel-authorizations/layouts/TravelAuthorizationLayout.vue"),
        props: cast("travelAuthorizationId", parseInt),
        children: [
          {
            path: "",
            redirect: "details/edit",
          },
          {
            path: "details/edit",
            name: "EditTravelAuthorizationDetailsPage",
            component: () =>
              import("@/modules/travel-authorizations/pages/EditTravelAuthorizationDetailsPage"),
            props: cast("travelAuthorizationId", parseInt),
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
          import("@/modules/travel-authorizations/layouts/ManageTravelAuthorizationLayout"),
        props: cast("travelAuthorizationId", parseInt),
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
