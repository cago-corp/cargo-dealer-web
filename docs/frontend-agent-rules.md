### TypeScript / Runtime Boundary
- TypeScript types are not runtime validation.
- Never accept untrusted external data via `as`, `as unknown as`, or unchecked casting.
- Avoid permissive schemas such as `z.any()` unless explicitly justified.

### Next.js App Router Boundaries
- Validate `params`, `searchParams`, `cookies`, `headers`, `request.json()`, `request.formData()`, and server action arguments at the boundary.
- Do not pass secrets, full session objects, admin-only data, or raw backend errors from server code to client components.
- Do not rely on middleware, hidden UI, or route structure as the only authorization check.

### Caching / Personalization
- Treat authenticated and user-scoped data as non-public.
- Do not use shared/static caching or revalidation for auth-scoped data unless explicitly approved.
- Do not dehydrate or serialize more data than the client strictly needs.
- Do not persist auth-scoped query cache to browser storage unless explicitly approved.

### TanStack Query
- Query and mutation functions must return Zod-validated data, not raw `response.json()`.
- Keep fetch/auth/session handling and response parsing centralized in shared helpers.
- Do not place tokens, cookies, emails, or other sensitive values in query keys.
- Do not treat optimistic UI state as authorization or source of truth.

### Browser Messaging / Uploads
- For `postMessage`, verify both `origin` and payload schema.
- For file inputs, validate MIME type, extension, and size independently.
- Never trust filename or client-provided MIME alone.

### Delivery Expectations
When you finish, report:
- security assumptions
- boundaries validated
- schema/helper names used
- sensitive data exposed to the client and why it is safe
- remaining risks / unknowns