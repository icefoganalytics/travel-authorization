import { cast } from "@/utils/vue-router-utils"

const routes = [
  {
    path: "",
    component: () => import("@/layouts/DefaultLayout.vue"),
    children: [
      {
        path: "/travel-requests/:travelAuthorizationId",
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
              import(
                "@/modules/travel-authorizations/pages/EditTravelAuthorizationEstimatePage.vue"
              ),
            props: cast("travelAuthorizationId", parseInt),
          },
          {
            path: "expense/edit",
            name: "EditTravelAuthorizationExpensePage",
            component: () =>
              import(
                "@/modules/travel-authorizations/pages/EditTravelAuthorizationExpensePage.vue"
              ),
            props: cast("travelAuthorizationId", parseInt),
          },
        ],
      },
    ],
  },
]

export default routes
