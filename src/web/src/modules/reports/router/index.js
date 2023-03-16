const routes = [
	{
		path: "/reporting-summary",
		component: () => import("@/layouts/BlankLayout"),
		children: [
			{
				name: "ReportsHome",
				path: "",
				meta: {
					requiresAuth: true
				},
				component: () => import("../views/Reports.vue")
			}
		]
	}
];

export default routes;