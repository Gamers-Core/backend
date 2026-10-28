# Copilot instructions for gamers-core/backend

## Quick project facts

- This is a NestJS 11 backend with feature-first modules under [src](src/).
- TypeORM + Postgres is configured in [datasource.ts](datasource.ts): snake_case naming, `synchronize: false`, `migrationsRun: true`, and entity discovery from `src/**/*.entity.ts`.
- App bootstrap in [src/app.module.ts](src/app.module.ts) wires the global auth guard, request context middleware, validation pipe, and cookie session setup.
- Default local workflow is `npm run start:dev` with `NODE_ENV=local`; full quality gate is `npm test`.

## Architecture and boundaries

- Keep controllers thin and move business logic into services; prefer the existing pattern in each feature module rather than inventing new abstractions.
- Entry wiring lives in [src/app.module.ts](src/app.module.ts) and [src/main.ts](src/main.ts); app-wide middleware, guards, validation, and CORS are all centralized there.
- High-traffic domains include auth + OTP, products + media lifecycle, orders + cart, and integrations such as Redis, Cloudinary, SMTP, and Bosta.

## Request/auth lifecycle

- Auth is globally enforced through `APP_GUARD` in [src/auth/guards/auth.guard.ts](src/auth/guards/auth.guard.ts): it reads `req.session.userId`, loads the user, assigns `req.user`, and updates locale and response headers.
- `@Public()` only bypasses auth errors; handlers still receive `req.user` when a session exists.
- Use `@CurrentUser()` from [src/users/decorators/current-user.decorator.ts](src/users/decorators/current-user.decorator.ts) instead of reading the session directly.
- `COOKIE_KEY` is mandatory at boot, and cookie settings are resolved from environment values in [src/app.module.ts](src/app.module.ts).

## Auth + OTP behavior

- The current OTP purpose set is sign-in only in [src/auth/const.ts](src/auth/const.ts).
- The auth flow is: `POST /auth/signin` creates OTP state, then `POST /auth/verify-otp` resolves the purpose handler and stores `session.userId` on success in [src/auth/auth.service.ts](src/auth/auth.service.ts).
- OTP state is Redis-backed with attempt/resend limits and TTL in [src/otp-session/otp-session.service.ts](src/otp-session/otp-session.service.ts).
- OTP email send and mismatch checks are environment-gated through [src/common/with-environment.ts](src/common/with-environment.ts); non-production environments do not enforce the same strict validation as production.
- If a new OTP purpose is added, update the constant, types, DTOs, handler map, and mail templates together.

## DTOs, serialization, and localization

- Prefer `@Serialize(DTO)` on controllers; the serializer injects class-transformer context with `locale` and `userId` in [src/common/interceptors/serialize.interceptor.ts](src/common/interceptors/serialize.interceptor.ts).
- Locale is request-scoped: the `x-locale` header seeds AsyncLocalStorage in [src/i18n/locale-context.middleware.ts](src/i18n/locale-context.middleware.ts), and the auth guard overrides it with the user locale when present.
- Domain exceptions should use translated keys via the custom exception layer under [src/common/exceptions](src/common/exceptions).

## Data access and side effects

- Prefer transactional service methods for multi-step writes. Product writes synchronize the product, variants, and media attachments in one flow in [src/products/services/products.service.ts](src/products/services/products.service.ts).
- Use `withOptionalManager` whenever a service accepts an optional `EntityManager`, so database work can remain atomic without forcing a different code path.
- Media uploads are drafted with expiry metadata and cleaned via cron in [src/media/services/media.service.ts](src/media/services/media.service.ts).
- Do not bypass the repository/service structure for database writes just to keep code compact.

## Environment assumptions and integrations

- `DATABASE_URL` is required; SSL is enabled outside local in [datasource.ts](datasource.ts).
- CORS is configured in [src/main.ts](src/main.ts) and exposes `x-locale` and `x-is-logged-in`.
- Redis, Cloudinary, SMTP, and Bosta credentials are required for their respective modules; validate the environment before working in those flows.
- Keep environment checks centralized through [src/config](src/config) and helper utilities, not scattered ad hoc in feature code.

## Developer workflow

- Install: `npm install`
- Local dev: `npm run start:dev` (`NODE_ENV=local`)
- Build: `npm run build`
- Run compiled app: `npm run start` / `npm run start:staging` / `npm run start:prod`
- Migration generation: `npm run migration:generate -- migrations/<Name>`
- Migration apply: `npm run migration:run`
- Quality gate: `npm test` (runs `tsc`, `eslint`, and `prettier --check`)

## Working style for agents

- Follow the repo’s established patterns in each feature folder before introducing a new abstraction.
- When adding or modifying API behavior, update the corresponding DTOs, validation rules, serialization, and tests in the same change.
- Prefer small, explicit changes that match the current NestJS/TypeORM conventions already used in this codebase.
