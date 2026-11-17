# Serializers

Use the maintained [Express Light Rail backend reference](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/docs/references/express-light-rail-backend-concepts-reference.md) for serializer design:

- [Selection by action](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/docs/references/express-light-rail-backend-concepts-reference.md#serializer-selection-by-action)
- [Explicit field allowlists](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/docs/references/express-light-rail-backend-concepts-reference.md#serializer-field-allowlists)
- [Model ownership, required preloads, and association composition](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/docs/references/express-light-rail-backend-concepts-reference.md#serializer-model-ownership)
- [Existing class-based dispatch](https://github.com/klondikemarlen/marlens-skills-rules-and-tools/blob/main/docs/references/express-light-rail-backend-concepts-reference.md#existing-class-based-serializer-dispatch)

## TravelAuth Conventions

- Use the local [`BaseSerializer`](base-serializer.ts), implementing instance `perform()` and inheriting its single-record/collection dispatch. Shared examples do not replace this project's actual base contract.
- Name output types `{Model}AsIndex`, `{Model}AsShow`, and `{Model}AsReference`; export them from the resource barrel as `AsIndex`, `AsShow`, and `AsReference`.
- Order resource barrel exports **Index → Show → Reference**.
- Controllers import named serializers from their resource-specific path, such as `import { IndexSerializer, ShowSerializer } from "@/serializers/travel-desk-invoices"`, not the top-level serializer namespace.
- Keep controller authorization, query construction, and response conventions in the [controller guide](../controllers/README.md), rather than duplicating controller examples here.
