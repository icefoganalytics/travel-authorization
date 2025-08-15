const routes = [
  {
    path: "/reporting-summary",
    component: () => import("@/layouts/DefaultLayout.vue"),
    children: [
      {
        name: "ReportsHome",
        path: "",
        component: () => import("@/modules/reports/views/Reports.vue"),
      },
    ],
  },
]

export default routes
