const routes = [
  {
    path: "/travel-requests",
    component: () => import("@/layouts/DefaultLayout.vue"),
    children: [
      {
        name: "TravelRequests",
        path: "",
        component: () => import("@/modules/travelDesk/views/TravelRequest.vue"),
      },
    ],
  },
]

export default routes
