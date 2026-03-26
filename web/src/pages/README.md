# Pages

Any component that is directly routeable is considered a page.

Pages should live under `web/src/pages/` in a path that mirrors their URL shape, and the page
component name should end in `Page`.

## Intent

This document exists to keep routeable page naming and organization predictable.

## Constraints

1. It should take minimal effort to figure out where to add a new page component for a given
   user-centric URL.
2. It should be easy to find the page component for a given URL.
3. It should be easy to add page variations such as `edit`, `new`, or state-specific pages.
4. Route names must be unique.
5. It should be easy to find a component given the Vue Router route name.

## Directory Structure

For example:

```bash
src/
├── pages/
│   ├── my-travel-requests/
│   │   ├── MyTravelRequestsPage.vue           # /my-travel-requests
│   │   ├── MyTravelRequestPage.vue            # /my-travel-requests/:id
│   │   ├── details/
│   │   │   ├── DetailsPage.vue                # /my-travel-requests/:id/details
│   │   │   ├── DetailsEditPage.vue            # /my-travel-requests/:id/details/edit
│   │   ├── estimate/
│   │   │   ├── EstimatePage.vue               # /my-travel-requests/:id/estimate
│   │   │   ├── EstimateEditPage.vue           # /my-travel-requests/:id/estimate/edit
│   │   ├── expense/
│   │   │   ├── ExpensePage.vue                # /my-travel-requests/:id/expense
│   │   │   ├── ExpenseEditPage.vue            # /my-travel-requests/:id/expense/edit
│   │   ├── request/
│   │   │   ├── RequestPage.vue                # /my-travel-requests/:id/request
│   │   │   ├── RequestEditPage.vue            # /my-travel-requests/:id/request/edit
```

## Routes

For example

```ts
const routes = [
  {
    path: "/my-travel-requests",
    component: () => import("@/pages/my-travel-requests/MyTravelRequestsPage.vue"),
    children: [
      {
        path: ":id",
        component: () => import("@/pages/my-travel-requests/MyTravelRequestPage.vue"),
        children: [
          {
            path: "details",
            component: () => import("@/pages/my-travel-requests/details/DetailsPage.vue"),
            name: "my-travel-requests/details/DetailsPage",
          },
          {
            path: "details/edit",
            component: () => import("@/pages/my-travel-requests/details/DetailsEditPage.vue"),
            name: "my-travel-requests/details/DetailsEditPage",
          },
          {
            path: "estimate",
            component: () => import("@/pages/my-travel-requests/estimate/EstimatePage.vue"),
            name: "my-travel-requests/estimate/EstimatePage",
          },
          {
            path: "estimate/edit",
            component: () => import("@/pages/my-travel-requests/estimate/EstimateEditPage.vue"),
            name: "my-travel-requests/estimate/EstimateEditPage",
          },
          {
            path: "expense",
            component: () => import("@/pages/my-travel-requests/expense/ExpensePage.vue"),
            name: "my-travel-requests/expense/ExpensePage",
          },
          {
            path: "expense/edit",
            component: () => import("@/pages/my-travel-requests/expense/ExpenseEditPage.vue"),
            name: "my-travel-requests/expense/ExpenseEditPage",
          },
          {
            path: "request",
            component: () => import("@/pages/my-travel-requests/request/RequestPage.vue"),
            name: "my-travel-requests/request/RequestPage",
          },
          {
            path: "request/edit",
            component: () => import("@/pages/my-travel-requests/request/RequestEditPage.vue"),
            name: "my-travel-requests/request/RequestEditPage",
          },
        ],
      },
    ],
  },
]
```

## Naming Guidance

- Prefer page names that reflect the user-facing concept first, then the state or variant
- Keep route names aligned with the file path when practical
- When a flow naturally branches into dedicated routeable screens, prefer separate pages over
  overloading one page with large conditional sections
